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

import document from "document";
import { inbox } from "file-transfer";
import fs from "fs";
import { vibration } from "haptics";
import DateTime from "../modules/app/dateTime.js";
import BatteryLevels from "../modules/app/batteryLevels.js";
import Graph from "../modules/app/bloodline.js";
import UserActivity from "../modules/app/userActivity.js";
import Alerts from "../modules/app/alerts.js";
import Errors from "../modules/app/errors.js";
import Transfer from "../modules/app/transfer.js";
import * as messaging from "messaging";
// import * as weather from 'fitbit-weather/app'

// import UserSettings from "../modules/app/userSettings.js";
import { memory } from "system";
const dateTime = new DateTime();
const batteryLevels = new BatteryLevels();
const graph = new Graph();
const userActivity = new UserActivity();
const errors = new Errors();
const transfer = new Transfer();
// const userSettings = new UserSettings();

var alerts = [];
var data = null;
// = {
//   settings: userSettings.load(),
// }
var singleOrMultipleDispaly = document.getElementById("singleBG");
var time = singleOrMultipleDispaly.getElementById("time");
var batteryLevel = document.getElementById("batteryLevel");
var batteryPercent = document.getElementById("batteryPercent");

console.log(JSON.stringify(data));
loadingScreen();
setInterval(function() {
  console.warn("JS memory: " + memory.js.used + "/" + memory.js.total);
  updateDisplay(data);
}, 10000);
inbox.onnewfile = () => {
  let fileName;
  do {
    fileName = inbox.nextFile();
    if (fileName) {
      data = fs.readFileSync(fileName, "cbor");
    }
  } while (fileName);
  updateDisplay(data);
};

/**
 * Update watchface display
 * @param {Object} data recived from the companion
 */
function updateDisplay(data) {
  console.log("Update Display called");
  if (data) {
    console.warn("JS memory: " + memory.js.used + "/" + memory.js.total);
    // userSettings.save(data.settings);
    if (data.settings.numOfDataSources == 2) {
      singleOrMultipleDispaly = document.getElementById("dualBG");
      document.getElementById("dualBG").style.display = "inline";
      document.getElementById("singleBG").style.display = "none";
    } else {
      singleOrMultipleDispaly = document.getElementById("singleBG");
      document.getElementById("singleBG").style.display = "inline";
      document.getElementById("dualBG").style.display = "none";
    }
    time = singleOrMultipleDispaly.getElementById("time");

    time.text = dateTime.getTime(data.settings.timeFormat);
    checkDataState(data);

    updateBgColor(data);
    setTextColor(data.settings.textColor);
    updateHeader(data);
    updateAlerts(data);
    updateBloodSugarDisplay(data);
    updateStats(data);
    updateGraph(data);
    largeGraphDisplay(data);
  } else {
    console.warn("NO DATA");
    batteryLevel.width = batteryLevels.get().level;
    batteryPercent.text = "" + batteryLevels.get().percent + "%";
    updateTimeDisplay();
  }
}

/**
 * Update bloodsugar display
 * @param {Object} data recived from the companion
 */
function updateBloodSugarDisplay(data) {
  const BloodSugarDisplayContainer = singleOrMultipleDispaly.getElementsByClassName(
    "bloodSugarDisplay"
  );
  BloodSugarDisplayContainer.forEach((ele, index) => {
    const bloodSugar = data.bloodSugars[index];
    const delta = BloodSugarDisplayContainer[index].getElementById("delta");
    const sgv = BloodSugarDisplayContainer[index].getElementById("sgv");
    const errorLine = BloodSugarDisplayContainer[index].getElementById(
      "errorLine"
    );
    const timeOfLastSgv = BloodSugarDisplayContainer[index].getElementById(
      "timeOfLastSgv"
    );
    const arrows = BloodSugarDisplayContainer[index].getElementById("arrows");
    const fistBgNonPredictiveBG = getfistBgNonPredictiveBG(bloodSugar.user.bgs);

    let deltaText = fistBgNonPredictiveBG.bgdelta;
    // add Plus
    if (deltaText > 0) {
      deltaText = "+" + deltaText;
    }
    delta.text = deltaText + " " + data.settings.glucoseUnits;
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
 * @param {Object} data recived from the companion
 */
function updateAlerts(data) {
  const alertContainer = singleOrMultipleDispaly.getElementsByClassName(
    "alertContainer"
  );
  const BloodSugarDisplayContainer = singleOrMultipleDispaly.getElementsByClassName(
    "bloodSugarDisplay"
  );

  BloodSugarDisplayContainer.forEach((ele, index) => {
    console.warn(index);
    const bloodSugar = data.bloodSugars[index];
    const sgv = BloodSugarDisplayContainer[index].getElementById("sgv");
    const errorLine = BloodSugarDisplayContainer[index].getElementById(
      "errorLine"
    );
    const fistBgNonPredictiveBG = getfistBgNonPredictiveBG(bloodSugar.user.bgs);

    let userName = null;
    if (index == 0) {
      userName = data.settings.dataSourceName;
    } else {
      userName = data.settings.dataSourceNameTwo;
    }

    if (typeof alerts[index] === "undefined") {
      let newAlert = new Alerts(false, 120, 15);
      alerts.push(newAlert);
    }

    alerts[index].check(
      data,
      bloodSugar.user.bgs,
      errorLine,
      sgv,
      fistBgNonPredictiveBG,
      data.settings,
      userName,
      alertContainer[index]
    );
  });
}

/**
 * Update stats display
 * @param {Object} data recived from the companion
 */
function updateStats(data) {
  const statsContainer = singleOrMultipleDispaly.getElementsByClassName(
    "stats"
  );
  statsContainer.forEach((ele, index) => {
    const bloodSugar = data.bloodSugars[index];
    const fistBgNonPredictiveBG = getfistBgNonPredictiveBG(bloodSugar.user.bgs);
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
      userName = data.settings.dataSourceName;
    } else {
      userName = data.settings.dataSourceNameTwo;
    }
    layoutOne.text = userName;

    if (
      fistBgNonPredictiveBG[data.settings.layoutOne] &&
      data.settings.layoutOne != "iob"
    ) {
      layoutTwo.text = fistBgNonPredictiveBG[data.settings.layoutOne];
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
      fistBgNonPredictiveBG[data.settings.layoutTwo] &&
      data.settings.layoutTwo != "cob"
    ) {
      layoutThree.text = fistBgNonPredictiveBG[data.settings.layoutTwo];
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
      fistBgNonPredictiveBG[data.settings.layoutThree] &&
      data.settings.layoutThree != "steps"
    ) {
      layoutFour.text = fistBgNonPredictiveBG[data.settings.layoutThree];
      layoutFour.x = 8;
      step.style.display = "none";
    } else {
      layoutFour.text = commas(userActivity.get().steps);
      layoutFour.x = 30;
      step.style.display = "inline";
    }

    if (
      fistBgNonPredictiveBG[data.settings.layoutFour] &&
      data.settings.layoutFour != "heart"
    ) {
      layoutFive.text = fistBgNonPredictiveBG[data.settings.layoutFour];
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
 * @param {Object} data recived from the companion
 */
function updateGraph(data) {
  const graphContainer = singleOrMultipleDispaly.getElementsByClassName(
    "graph"
  );
  graphContainer.forEach((ele, index) => {
    const bloodSugar = data.bloodSugars[index];
    graph.update(
      bloodSugar.user.bgs,
      data.settings.highThreshold,
      data.settings.lowThreshold,
      data.settings,
      graphContainer[index]
    );
  });
}

/**
 * Update bg color
 * @param {Object} data recived from the companion
 */
function updateBgColor(data) {
  const bgColor = singleOrMultipleDispaly.getElementsByClassName("bgColor");
  bgColor.forEach((ele, index) => {
    if (isOdd(index)) {
      bgColor[index].gradient.colors.c1 = data.settings.bgColorTwo;
      bgColor[index].gradient.colors.c2 = data.settings.bgColor;
    } else {
      bgColor[index].gradient.colors.c1 = data.settings.bgColor;
      bgColor[index].gradient.colors.c2 = data.settings.bgColorTwo;
    }
  });
}

/**
 * Update header display
 * @param {Object} data recived from the companion
 */
function updateHeader(data) {
  const date = document.getElementById("date");
  const weatherText = document.getElementById("weather");
  const weatherIcon = document.getElementById("weatherIcon");
  const degreeIcon = document.getElementById("degreeIcon");
  degreeIcon.style.display = "none";
  degreeIcon.style.display = "none";
  // weather.fetch(30 * 60 * 1000) // return the cached value if it is less than 30 minutes old
  //   .then(weather => {
  //     console.log(JSON.stringify(weather))
  //     weatherIcon.style.display = "inline";
  //     degreeIcon.style.display = "inline";
  //     if(data.settings.tempType == "f") {
  //       weatherText.text =  Math.round( parseFloat(weather.temperatureF) );
  //     } else {
  //       weatherText.text =  Math.round( parseFloat(weather.temperatureC) );
  //     }
  //     weatherIcon.href = '../resources/img/weather/'+weather.conditionCode+'.png';
  //   })
  //   .catch(error => console.log(JSON.stringify(error)))

  batteryLevel.width = batteryLevels.get().level;
  batteryLevel.style.fill = batteryLevels.get().color;
  batteryPercent.text = batteryLevels.get().percent + "%";
  date.text = dateTime.getDate(
    data.settings.dateFormat,
    data.settings.enableDOW
  );
}

/**
 * Update loading screen display
 * @param {Object} data recived from the companion
 */
function loadingScreen() {
  var loadingScreenContainer = document.getElementById("errorStateContainer");
  // let spinner = document.getElementById("spinner");
  const status = document.getElementById("errorStatus");
  const statusLead = document.getElementById("errorStatusLead");
  // Start the spinner
  // spinner.state = "enabled";
  status.text = "Syncing";

  let checkConnection = function() {
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      status.text = "Connected";
      clearInterval(checkConnectionInterval);
      statusLead.text = "Loading Data from phone";
      setTimeout(function() {
        console.log(!data);
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
    console.log("Connection error: " + err.code + " - " + err.message);
    status.text = "Connection error: " + err.code + " - " + err.message;
  };
}

/**
 *  Validate data is not in error state
 * @param {Object} data recived from the companion
 */
function checkDataState(data) {
  const BloodSugarDisplayContainer = singleOrMultipleDispaly.getElementsByClassName(
    "bloodSugarDisplay"
  );

  BloodSugarDisplayContainer.forEach((ele, index) => {
    var errorCodes = "";
    var errorCodesDesc = "";
    const bloodSugar = data.bloodSugars[index];
    const fistBgNonPredictiveBG = getfistBgNonPredictiveBG(bloodSugar.user.bgs);
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
  //   console.log(index)
  //   graphContainer[index].onclick = function(evt) {
  //     largeGraphDisplay.style.display = 'inline';
  //     const bloodSugar = data.bloodSugars[index];
  //     console.log(JSON.stringify(bloodSugar.user.bgs.length))
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
var dataToSend = {
  heart: 0,
  steps: userActivity.get().steps
};
// Request data every 5 mins from companion
setTimeout(function() {
  transfer.send(dataToSend);
}, 1500);
setInterval(function() {
  transfer.send(dataToSend);
}, 180000);

function updateTimeDisplay(classes) {
  time.text = dateTime.getTime();
}

function isOdd(n) {
  return Math.abs(n % 2) == 1;
}
