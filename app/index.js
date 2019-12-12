/*
 * Copyright (C) 2018 Ryan Mason - All Rights Reserved
 *
 * Permissions of this strong copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights.
 *
 * https://github.com/Rytiggy/Glance/blob/master/LICENSE
 * ------------------------------------------------
 *
 * You are free to modify the code but please leave the copyright in the header.
 *
 * ------------------------------------------------
 */
import Transfer from "../modules/app/transfer.js";
const transfer = new Transfer();
import clock from "clock";
import { display } from "display";
clock.granularity = "minutes";
import document from "document";
import { inbox } from "file-transfer";
import fs from "fs";
import DateTime from "../modules/app/dateTime.js";
import BatteryLevels from "../modules/app/batteryLevels.js";
import Graph from "../modules/app/bloodline.js";
import UserActivity from "../modules/app/userActivity.js";
import Alerts from "../modules/app/alerts.js";
import Errors from "../modules/app/errors.js";
import UserAgreement from "../modules/app/userAgreement.js";
import Actions from "../modules/app/actions.js";
const actions = new Actions();
import Treatments from "../modules/app/treatments.js";

import * as messaging from "messaging";
// import * as weather from 'fitbit-weather/app'

// import UserSettings from "../modules/app/userSettings.js";
import { memory } from "system";
const dateTime = new DateTime();
const batteryLevels = new BatteryLevels();
const graph = new Graph();
const userActivity = new UserActivity();
const errors = new Errors();
const userAgreement = new UserAgreement();

var alerts = [];
var data = { bloodSugars: null, settings: null };

var singleOrMultipleDispaly = document.getElementById("singleBG");
var time = singleOrMultipleDispaly.getElementById("time");
var batteryLevel = document.getElementById("batteryLevel");
var batteryPercent = document.getElementById("batteryPercent");

loadingScreen();

// On file tranfer
inbox.onnewfile = () => {
  let fileName;
  do {
    fileName = inbox.nextFile();
    if (fileName) {
      data.bloodSugars = fs.readFileSync(fileName, "cbor").bloodSugars;
    }
  } while (fileName);
  updateDisplay(data);
  console.warn("Interval JS memory: " + memory.js.used + "/" + memory.js.total);
};

// Listen for messages from the companion
messaging.peerSocket.onmessage = function(evt) {
  if (evt.data) {
    if (evt.data.key == "settings") {
      // update the settings to the data object
      data.settings = evt.data.data;
      updateSettingSpecificDisplay(data.settings);
    }
  }
};

var dataToSend = {
  command: "refreshData",
  data: {
    heart: 0,
    steps: userActivity.get().steps
  }
};

// update interval
transfer.send(dataToSend);
clock.ontick = evt => {
  if (data.settings) {
    updateSettingSpecificDisplay(data.settings);
    updateDisplay(data);
    // request new data
    transfer.send(dataToSend);
  }
};

// when the screen is off add a interval to keep fetching data
let refreshInterval = null;
display.onchange = function() {
  if (display.on) {
    console.log("on");
    clearInterval(refreshInterval);
    refreshInterval = null;
  } else {
    console.log("screen off");
    refreshInterval = setInterval(function() {
      transfer.send(dataToSend);
    }, 120000);
  }
};

/**
 * Update watchface display This deals with the BGS data
 * @param {Object} data received from the companion
 */
function updateDisplay(data) {
  if (data.bloodSugars) {
    checkDataState(data.bloodSugars);
    updateAlerts(data.bloodSugars, data.settings);
    updateBloodSugarDisplay(data.bloodSugars, data.settings);
    updateStats(data.bloodSugars, data.settings);
    updateGraph(data.bloodSugars, data.settings);
    // largeGraphDisplay(data);
  } else {
    batteryLevel.width = batteryLevels.get().level;
    batteryPercent.text = "" + batteryLevels.get().percent + "%";
    updateTimeDisplay();
  }
}

/**
 * Update bloodsugar display
 * @param {Object} data recived from the companion
 */
function updateBloodSugarDisplay(bloodSugars, settings) {
  const BloodSugarDisplayContainer = singleOrMultipleDispaly.getElementsByClassName(
    "bloodSugarDisplay"
  );
  BloodSugarDisplayContainer.forEach((ele, index) => {
    const bloodSugar = bloodSugars[index];
    const delta = BloodSugarDisplayContainer[index].getElementById("delta");
    const sgv = BloodSugarDisplayContainer[index].getElementById("sgv");
    const errorLine = BloodSugarDisplayContainer[index].getElementById(
      "errorLine"
    );
    const timeOfLastSgv = BloodSugarDisplayContainer[index].getElementById(
      "timeOfLastSgv"
    );
    const arrows = BloodSugarDisplayContainer[index].getElementById("arrows");
    const fistBgNonPredictiveBG = bloodSugar.user.currentBg;

    let deltaText = fistBgNonPredictiveBG.bgdelta;
    // add Plus
    if (deltaText > 0) {
      deltaText = "+" + deltaText;
    }
    delta.text = deltaText + " " + settings.glucoseUnits;
    sgv.text = fistBgNonPredictiveBG.currentbg;
    timeOfLastSgv.text = dateTime.getTimeSenseLastSGV(
      fistBgNonPredictiveBG.datetime
    )[0];
    arrows.href =
      "../resources/img/arrows/" + fistBgNonPredictiveBG.direction + ".png";

    let timeSenseLastSGV = dateTime.getTimeSenseLastSGV(
      fistBgNonPredictiveBG.datetime
    )[1];
    errors.check(timeSenseLastSGV, sgv, errorLine);
  });
}

/**
 * Update alert display
 * @param {Object} bloodSugars recived from the companion
 * @param {Object} settings recived from the companion
 */
function updateAlerts(bloodSugars, settings) {
  const alertContainer = singleOrMultipleDispaly.getElementsByClassName(
    "alertContainer"
  );
  const BloodSugarDisplayContainer = singleOrMultipleDispaly.getElementsByClassName(
    "bloodSugarDisplay"
  );

  BloodSugarDisplayContainer.forEach((ele, index) => {
    const bloodSugar = bloodSugars[index];
    const sgv = BloodSugarDisplayContainer[index].getElementById("sgv");
    const errorLine = BloodSugarDisplayContainer[index].getElementById(
      "errorLine"
    );
    const fistBgNonPredictiveBG = bloodSugar.user.currentBg;

    let userName = null;
    if (index == 0) {
      userName = settings.dataSourceName;
    } else {
      userName = settings.dataSourceNameTwo;
    }

    if (typeof alerts[index] === "undefined") {
      let newAlert = new Alerts(false, 120, 15);
      alerts.push(newAlert);
    }

    alerts[index].check(
      bloodSugar.user,
      errorLine,
      sgv,
      fistBgNonPredictiveBG,
      settings,
      userName,
      alertContainer[index]
    );
  });
}

/**
 * Update stats display
 * @param {Object} bloodSugars recived from the companion
 * @param {Object} settings recived from the companion
 */
function updateStats(bloodSugars, settings) {
  const statsContainer = singleOrMultipleDispaly.getElementsByClassName(
    "stats"
  );
  statsContainer.forEach((ele, index) => {
    const bloodSugar = bloodSugars[index];
    const fistBgNonPredictiveBG = bloodSugar.user.currentBg;
    const layoutOne = statsContainer[index].getElementById("layoutOne");
    const layoutTwo = statsContainer[index].getElementById("layoutTwo");
    const layoutThree = statsContainer[index].getElementById("layoutThree");
    const layoutFour = statsContainer[index].getElementById("layoutFour");
    const layoutFive = statsContainer[index].getElementById("layoutFive");
    const syringe = statsContainer[index].getElementById("syringe");
    const hamburger = statsContainer[index].getElementById("hamburger");
    const step = statsContainer[index].getElementById("step");
    const heart = statsContainer[index].getElementById("heart");

    let userName = null;
    if (index == 0) {
      userName = settings.dataSourceName;
    } else {
      userName = settings.dataSourceNameTwo;
    }
    layoutOne.text = userName;

    if (
      fistBgNonPredictiveBG[settings.layoutOne] &&
      settings.layoutOne != "iob"
    ) {
      layoutTwo.text = fistBgNonPredictiveBG[settings.layoutOne];
      layoutTwo.x = 8;
      syringe.style.display = "none";
    } else {
      if (fistBgNonPredictiveBG.iob != 0) {
        layoutTwo.text = fistBgNonPredictiveBG.iob;
        layoutTwo.x = 30;
        syringe.style.display = "inline";
      } else {
        layoutTwo.text = "";
        syringe.style.display = "none";
      }
    }

    if (
      fistBgNonPredictiveBG[settings.layoutTwo] &&
      settings.layoutTwo != "cob"
    ) {
      layoutThree.text = fistBgNonPredictiveBG[settings.layoutTwo];
      layoutThree.x = 8;
      hamburger.style.display = "none";
    } else {
      if (fistBgNonPredictiveBG.cob != 0) {
        layoutThree.text = fistBgNonPredictiveBG.cob;
        layoutThree.x = 30;
        hamburger.style.display = "inline";
      } else {
        layoutThree.text = "";
        hamburger.style.display = "none";
      }
    }

    if (
      fistBgNonPredictiveBG[settings.layoutThree] &&
      settings.layoutThree != "steps"
    ) {
      layoutFour.text = fistBgNonPredictiveBG[settings.layoutThree];
      layoutFour.x = 8;
      step.style.display = "none";
    } else {
      layoutFour.text = commas(userActivity.get().steps);
      layoutFour.x = 30;
      step.style.display = "inline";
    }

    if (
      fistBgNonPredictiveBG[settings.layoutFour] &&
      settings.layoutFour != "heart"
    ) {
      layoutFive.text = fistBgNonPredictiveBG[settings.layoutFour];
      layoutFive.x = 8;
      heart.style.display = "none";
    } else {
      layoutFive.text = userActivity.get().heartRate;
      layoutFive.x = 30;
      heart.style.display = "inline";
    }
  });
}

/**
 * Update graph display
 * @param {Object} bloodSugars recived from the companion
 * @param {Object} settings recived from the companion
 */
function updateGraph(bloodSugars, settings) {
  const graphContainer = singleOrMultipleDispaly.getElementsByClassName(
    "graph"
  );
  graphContainer.forEach((ele, index) => {
    const bloodSugar = bloodSugars[index];
    graph.update(
      bloodSugar.user,
      settings.highThreshold,
      settings.lowThreshold,
      settings,
      graphContainer[index]
    );
  });
}

/**
 * Update bg color
 * @param {string} bgColorOne hex color recived from the companion
 * @param {string} bgColorTwo hex color two recived from the companion
 */
function updateBgColor(bgColorOne, bgColorTwo) {
  const bgColor = singleOrMultipleDispaly.getElementsByClassName("bgColor");
  bgColor.forEach((ele, index) => {
    if (isOdd(index)) {
      bgColor[index].gradient.colors.c1 = bgColorTwo;
      bgColor[index].gradient.colors.c2 = bgColorOne;
    } else {
      bgColor[index].gradient.colors.c1 = bgColorOne;
      bgColor[index].gradient.colors.c2 = bgColorTwo;
    }
  });
}

/**
 * Update header display
 * @param {string} dateFormat recived from the companion
 * @param {string} enableDOW recived from the companion
 */
function updateHeader(dateFormat, enableDOW) {
  const date = document.getElementById("date");
  const weatherText = document.getElementById("weather");
  const weatherIcon = document.getElementById("weatherIcon");
  const degreeIcon = document.getElementById("degreeIcon");
  degreeIcon.style.display = "none";
  batteryLevel.width = batteryLevels.get().level;
  batteryLevel.style.fill = batteryLevels.get().color;
  batteryPercent.text = batteryLevels.get().percent + "%";
  date.text = dateTime.getDate(dateFormat, enableDOW);
}

/**
 * Update loading screen display
 * @param {Object} data recived from the companion
 */
function loadingScreen() {
  // let spinner = document.getElementById("spinner");
  const status = document.getElementById("errorStatus");
  const statusLead = document.getElementById("errorStatusLead");
  // Start the spinner
  // spinner.state = "enabled";
  status.text = "Syncing";

  let checkConnection = function() {
    if (messaging.peerSocket.readyState == 0) {
      // if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      status.text = "Connected";
      clearInterval(checkConnectionInterval);
      checkConnectionInterval = null;
      statusLead.text = "Loading Data from phone";
      setTimeout(function() {
        if (!data) {
          statusLead.text =
            "Problem receiving data, try restarting watchface and double check settings.";
        }
      }, 15000);
      // loadingScreenContainer.style.display = "none";
    }
    if (messaging.peerSocket.readyState === messaging.peerSocket.CLOSED) {
      // loadingScreenContainer.style.display = "inline";
      status.text = "Phone unreachable";
      statusLead.text = "Please wait or try restarting the watch";
    }
  };
  var checkConnectionInterval = setInterval(checkConnection, 5000);

  messaging.peerSocket.onerror = function(err) {
    status.text = "Connection error: " + err.code + " - " + err.message;
  };
}

/**
 *  Validate data is not in error state
 * @param {Object} bloodSugars recived from the companion
 */
function checkDataState(bloodSugars) {
  const BloodSugarDisplayContainer = singleOrMultipleDispaly.getElementsByClassName(
    "bloodSugarDisplay"
  );

  BloodSugarDisplayContainer.forEach((ele, index) => {
    var errorCodes = "";
    var errorCodesDesc = "";
    const bloodSugar = bloodSugars[index];

    const fistBgNonPredictiveBG = bloodSugar.user.currentBg;
    const bloodSugarContainer = BloodSugarDisplayContainer[
      index
    ].getElementById("bloodSugarContainer");
    const errorStateContainer = BloodSugarDisplayContainer[
      index
    ].getElementById("errorStateContainer");
    const errorStatus = BloodSugarDisplayContainer[index].getElementById(
      "errorStatus"
    );
    const errorStatusLead = BloodSugarDisplayContainer[index].getElementById(
      "errorStatusLead"
    );
    if (fistBgNonPredictiveBG.currentbg === "E503") {
      errorCodes = "E503";
      errorCodesDesc = `Data source configuration error. Check settings.`;
    } else if (fistBgNonPredictiveBG.currentbg === "E500") {
      errorCodes = "E500";
      errorCodesDesc = `Data source configuration error. Check settings.`;
    } else if (fistBgNonPredictiveBG.currentbg === "E404") {
      errorCodes = "E404";
      errorCodesDesc = `No Data source found. Check settings.`;
    } else if (fistBgNonPredictiveBG.currentbg === "E400") {
      errorCodes = "E400";
      errorCodesDesc = ` Bad request - Check data source login info.`;
    }

    if (errorCodes.length > 0) {
      errorStatus.text = errorCodes;
      errorStatusLead.text = errorCodesDesc;
      errorStateContainer.style.display = "inline";
      bloodSugarContainer.style.display = "none";
    } else {
      errorStateContainer.style.display = "none";
      bloodSugarContainer.style.display = "inline";
    }
  });
}
/**
 *  Validate data is not in error state
 * @param {Object} data recived from the companion
 */
function largeGraphDisplay(data) {
  // const graphContainer = singleOrMultipleDispaly.getElementsByClassName('graph');
  // const largeGraphDisplay = document.getElementById('largeGraphDisplay');
  // const largeGraph = document.getElementById('largeGraph');
  // graphContainer.forEach((ele, index) => {
  //   graphContainer[index].onclick = function(evt) {
  //     largeGraphDisplay.style.display = 'inline';
  //     const bloodSugar = data.bloodSugars[index];
  //     graph.update(bloodSugar.user.bgs,
  //       data.settings.highThreshold,
  //       data.settings.lowThreshold,
  //       data.settings,
  //       largeGraph
  //     );
  //   }
  // });
  // largeGraph.onclick = function(evt) {
  //   largeGraphDisplay.style.display = 'none';
  // }
}

/**
 * Update settings specific UI elements
 * @param {Object} settings the users settings
 */
function updateSettingSpecificDisplay(settings) {
  // Check if user has agreed to user agreement
  if (userAgreement.check(settings)) {
    document.getElementById("userAgreement").style.display = "none";

    console.warn("JS memory: " + memory.js.used + "/" + memory.js.total);

    if (settings.numOfDataSources == 2) {
      singleOrMultipleDispaly = document.getElementById("dualBG");
      document.getElementById("dualBG").style.display = "inline";
      document.getElementById("singleBG").style.display = "none";
    } else {
      singleOrMultipleDispaly = document.getElementById("singleBG");
      document.getElementById("singleBG").style.display = "inline";
      document.getElementById("dualBG").style.display = "none";
    }

    actions.init(transfer, singleOrMultipleDispaly, settings);
    const treatments = new Treatments(transfer, settings);

    time = singleOrMultipleDispaly.getElementById("time");
    time.text = dateTime.getTime(settings.timeFormat);

    updateBgColor(settings.bgColor, settings.bgColorTwo); // settings only
    setTextColor(settings.textColor); //settings only
    updateHeader(settings.dateFormat, settings.enableDOW); // settings only
  } else {
    // user has not agreed to user agreement
    document.getElementById("userAgreement").style.display = "inline";
  }
}

function commas(value) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
/**
 * Get Fist BG that is not a predictive BG
 * @param {Array} bgs
 * @returns {Array}
 */
function getfistBgNonPredictiveBG(bgs) {
  return bgs.filter(bg => {
    if (bg.bgdelta || bg.bgdelta === 0) {
      return true;
    }
  })[0];
}

function setTextColor(color) {
  let settingsTextColor = singleOrMultipleDispaly.getElementsByClassName(
    "settingsTextColor"
  );
  settingsTextColor.forEach((ele, index) => {
    ele.style.fill = color;
  });
}

function updateTimeDisplay(classes) {
  time.text = dateTime.getTime();
}

function isOdd(n) {
  return Math.abs(n % 2) == 1;
}

// var dataToSend = {
//   command: "refreshData",
//   data: {
//     heart: 0,
//     steps: userActivity.get().steps
//   }
// };
// Request data every 5 mins from companion
// setTimeout(function() {
//   transfer.send(dataToSend);
// }, 1500);
// setInterval(function() {
//   transfer.send(dataToSend);
// }, 180000);
