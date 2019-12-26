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
import * as transfer from "../modules/app/transfer.js";
import document from "document";
import { inbox } from "file-transfer";
import fs from "fs";
import * as dateTime from "../modules/app/dateTime.js";
dateTime.init();
import * as batteryLevels from "../modules/app/batteryLevels.js";
import * as graph from "../modules/app/bloodline.js";
import * as userActivity from "../modules/app/userActivity.js";
import Alerts from "../modules/app/alerts.js";
import * as errors from "../modules/app/errors.js";
import * as userAgreement from "../modules/app/userAgreement.js";
import * as actions from "../modules/app/actions.js";
import * as treatments from "../modules/app/treatments.js";
import * as messaging from "messaging";

import { memory } from "system";

var alerts = [];
var data = { bloodSugars: null, settings: null };

var singleOrMultipleDispaly = document.getElementById("singleBG");
var time = singleOrMultipleDispaly.getElementById("time");

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

setInterval(function() {
  // check if the data is older then 5 minutes and fetch more data
  if (data.bloodSugars) {
    let timeSenseLastSGV = dateTime.getTimeSenseLastSGV(
      data.bloodSugars[0].user.currentBg.datetime
    )[1];

    //todo account for user 2 if it exists

    if (timeSenseLastSGV >= 5) {
      console.log("request more data please!");
      transfer.send(dataToSend);
    }
  }
  updateSettingSpecificDisplay(data.settings);
  updateDisplay(data);
}, 10000);

/**
 * Update watchface display This deals with the BGS data
 * @param {Object} data received from the companion
 */
function updateDisplay(data) {
  checkDataState(data.bloodSugars);
  updateAlerts(data.bloodSugars, data.settings);
  updateBloodSugarDisplay(data.bloodSugars, data.settings);
  updateStats(data.bloodSugars, data.settings);
  updateGraph(data.bloodSugars, data.settings);
  // largeGraphDisplay(data);
  console.log("JS memory: " + memory.js.used + "/" + memory.js.total);
}

/**
 * Update blood sugar display
 * @param {*} bloodSugars received from the companion
 * @param {*} settings  received from the companion
 */
function updateBloodSugarDisplay(bloodSugars, settings) {
  // default eles to update
  let sgvEle = "sgv";
  let deltaEle = "delta";
  let errorLineEle = "errorLine";
  let timeOfLastSgvEle = "timeOfLastSgv";
  let arrowsEle = "arrows";
  if (settings.numOfDataSources == 3) {
    // if its the large display
    sgvEle = "largeSgv";
    deltaEle = "largeDelta";
    errorLineEle = "largeErrorLine";
    timeOfLastSgvEle = "largeTimeOfLastSgv";
    arrowsEle = "largeArrows";
  }

  let BloodSugarDisplayContainer = singleOrMultipleDispaly.getElementsByClassName(
    "bloodSugarDisplay"
  );
  BloodSugarDisplayContainer.forEach((ele, index) => {
    let bloodSugar = bloodSugars[index];
    if (bloodSugar.user) {
      let delta = BloodSugarDisplayContainer[index].getElementById(deltaEle);
      let sgv = BloodSugarDisplayContainer[index].getElementById(sgvEle);
      let errorLine = BloodSugarDisplayContainer[index].getElementById(
        errorLineEle
      );
      let timeOfLastSgv = BloodSugarDisplayContainer[index].getElementById(
        timeOfLastSgvEle
      );
      let arrows = BloodSugarDisplayContainer[index].getElementById(arrowsEle);
      let fistBgNonPredictiveBG = bloodSugar.user.currentBg;

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
    }
  });
}

/**
 * Update alert display
 * @param {Object} bloodSugars recived from the companion
 * @param {Object} settings recived from the companion
 */
function updateAlerts(bloodSugars, settings) {
  let sgvEle = "sgv";
  let errorLineEle = "errorLine";
  if (settings.numOfDataSources == 3) {
    // if its the large display
    sgvEle = "largeSgv";
    errorLineEle = "largeErrorLine";
  }

  let alertContainer = singleOrMultipleDispaly.getElementsByClassName(
    "alertContainer"
  );
  let BloodSugarDisplayContainer = singleOrMultipleDispaly.getElementsByClassName(
    "bloodSugarDisplay"
  );

  BloodSugarDisplayContainer.forEach((ele, index) => {
    let bloodSugar = bloodSugars[index];
    if (bloodSugar.user) {
      let sgv = BloodSugarDisplayContainer[index].getElementById(sgvEle);
      let errorLine = BloodSugarDisplayContainer[index].getElementById(
        errorLineEle
      );
      let fistBgNonPredictiveBG = bloodSugar.user.currentBg;

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
    }
  });
}

/**
 * Update stats display
 * @param {Object} bloodSugars recived from the companion
 * @param {Object} settings recived from the companion
 */
function updateStats(bloodSugars, settings) {
  let statsContainer = singleOrMultipleDispaly.getElementsByClassName("stats");
  statsContainer.forEach((ele, index) => {
    let bloodSugar = bloodSugars[index];
    // todo add check here for blood sugar at this index
    let fistBgNonPredictiveBG = bloodSugar.user.currentBg;
    let layoutOne = statsContainer[index].getElementById("layoutOne");
    let layoutTwo = statsContainer[index].getElementById("layoutTwo");
    let layoutThree = statsContainer[index].getElementById("layoutThree");
    let layoutFour = statsContainer[index].getElementById("layoutFour");
    let layoutFive = statsContainer[index].getElementById("layoutFive");
    let syringe = statsContainer[index].getElementById("syringe");
    let hamburger = statsContainer[index].getElementById("hamburger");
    let step = statsContainer[index].getElementById("step");
    let heart = statsContainer[index].getElementById("heart");

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
  let graphContainer = singleOrMultipleDispaly.getElementsByClassName("graph");
  graphContainer.forEach((ele, index) => {
    let bloodSugar = bloodSugars[index];
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
  let bgColor = singleOrMultipleDispaly.getElementsByClassName("bgColor");
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
  if (data.settings.numOfDataSources != 2) {
    let date = singleOrMultipleDispaly.getElementById("date");
    date.text = dateTime.getDate(dateFormat, enableDOW);
    batteryLevels.get(singleOrMultipleDispaly);
  }
}

/**
 * Update loading screen display
 * @param {Object} data recived from the companion
 */
function loadingScreen() {
  // let spinner = document.getElementById("spinner");
  let status = document.getElementById("errorStatus");
  let statusLead = document.getElementById("errorStatusLead");
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
  let errorStatusEle = "errorStatus";
  let errorStatusLeadEle = "errorStatusLead";

  if (data.settings.numOfDataSources == 3) {
    errorStatusEle = "largeErrorStatus";
    errorStatusLeadEle = "largeErrorStatusLead";
  }

  let BloodSugarDisplayContainer = singleOrMultipleDispaly.getElementsByClassName(
    "bloodSugarDisplay"
  );

  BloodSugarDisplayContainer.forEach((ele, index) => {
    var errorCodes = "";
    var errorCodesDesc = "";
    let bloodSugar = bloodSugars[index];
    if (bloodSugar.user) {
      let fistBgNonPredictiveBG = bloodSugar.user.currentBg;
      let bloodSugarContainer = BloodSugarDisplayContainer[
        index
      ].getElementById("bloodSugarContainer");
      let errorStateContainer = BloodSugarDisplayContainer[
        index
      ].getElementById("errorStateContainer");
      let errorStatus = BloodSugarDisplayContainer[index].getElementById(
        errorStatusEle
      );
      let errorStatusLead = BloodSugarDisplayContainer[index].getElementById(
        errorStatusLeadEle
      );
      if (fistBgNonPredictiveBG.currentbg === "E503") {
        errorCodes = "E503";
        errorCodesDesc = `Data source config error. Check settings.`;
      } else if (fistBgNonPredictiveBG.currentbg === "E500") {
        errorCodes = "E500";
        errorCodesDesc = `Data source config error. Check settings.`;
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
    }
  });
}
/**
] * @param {Object} data recived from the companion
 */
// function largeGraphDisplay(data) {
//   let graphContainer = singleOrMultipleDispaly.getElementsByClassName('graph');
//   let largeGraphDisplay = document.getElementById('largeGraphDisplay');
//   let largeGraph = document.getElementById('largeGraph');
//   graphContainer.forEach((ele, index) => {
//     graphContainer[index].onclick = function(evt) {
//       largeGraphDisplay.style.display = 'inline';
//       let bloodSugar = data.bloodSugars[index];
//       graph.update(bloodSugar.user.bgs,
//         data.settings.highThreshold,
//         data.settings.lowThreshold,
//         data.settings,
//         largeGraph
//       );
//     }
//   });
//   largeGraph.onclick = function(evt) {
//     largeGraphDisplay.style.display = 'none';
//   }
// }

/**
 * Update settings specific UI elements
 * @param {Object} settings the users settings
 */
function updateSettingSpecificDisplay(settings) {
  // Check if user has agreed to user agreement
  if (userAgreement.check(settings)) {
    document.getElementById("userAgreement").style.display = "none";

    let singleBG = document.getElementById("singleBG");
    let dualBG = document.getElementById("dualBG");
    let largeBG = document.getElementById("largeBG");
    let largeGraph = document.getElementById("largeGraph");

    if (settings.numOfDataSources == 2) {
      singleOrMultipleDispaly = document.getElementById("dualBG");
      singleBG.style.display = "none";
      dualBG.style.display = "inline";
      largeBG.style.display = "none";
      largeGraph.style.display = "none";
    } else if (settings.numOfDataSources == 3) {
      singleOrMultipleDispaly = document.getElementById("largeBG");
      singleBG.style.display = "none";
      dualBG.style.display = "none";
      largeBG.style.display = "inline";
      largeGraph.style.display = "none";
    } else if (settings.numOfDataSources == 4) {
      singleOrMultipleDispaly = document.getElementById("largeGraph");
      singleBG.style.display = "none";
      dualBG.style.display = "none";
      largeBG.style.display = "none";
      largeGraph.style.display = "inline";
    } else {
      singleOrMultipleDispaly = document.getElementById("singleBG");
      singleBG.style.display = "inline";
      dualBG.style.display = "none";
      largeBG.style.display = "none";
      largeGraph.style.display = "none";
    }

    actions.init(transfer, singleOrMultipleDispaly, settings);
    treatments.init(transfer, settings);
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

// function updateTimeDisplay() {
//   time.text = dateTime.getTime();
// }

function isOdd(n) {
  return Math.abs(n % 2) == 1;
}
