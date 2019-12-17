import document from "document";

import { inbox } from "file-transfer";
import fs from "fs";
import * as messaging from "messaging";
import { memory } from "system";
import clock from "clock";
import { display } from "display";
clock.granularity = "minutes";

import Transfer from "../../modules/app/transfer.js";
const transfer = new Transfer();

import DateTime from "../../modules/app/dateTime.js";
const dateTime = new DateTime();

import Errors from "../../modules/app/errors.js";
const errors = new Errors();

import BatteryLevels from "../../modules/app/batteryLevels.js";
const batteryLevels = new BatteryLevels();

import Graph from "../../modules/app/bloodline.js";
const graph = new Graph();

import UserActivity from "../../modules/app/userActivity.js";
const userActivity = new UserActivity();

import Alerts from "../../modules/app/alerts.js";

let views;
var data = { bloodSugars: null, settings: null };

export function init(_views, datalame) {
  views = _views;
  mounted(datalame);
}

/**
 * When this view is mounted, setup elements and events.
 */
function mounted(datalame) {
  console.log("home mounted");

  var dataToSend = {
    command: "refreshData",
    data: {
      heart: 0,
      steps: userActivity.get().steps
    }
  };

  clock.ontick = evt => {
    if (data.settings) {
      // request new data
      transfer.send(dataToSend);
    }
  };
  // when the screen is off add a interval to keep fetching data
  let refreshInterval = null;
  display.onchange = function() {
    if (display.on) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    } else {
      refreshInterval = setInterval(function() {
        transfer.send(dataToSend);
      }, 120000);
    }
  };

  // messaging.peerSocket.onmessage = function(evt) {
  //   if (evt.data) {
  //     if (evt.data.key == "settings") {
  //       console.log("settings");
  //       // update the settings to the data object
  //       console.log(JSON.stringify(evt.data.data));
  //       data.settings = evt.data.data;
  //       updateSettingSpecificDisplay(data.settings);
  //     }
  //   }
  // };

  // when new data is received from the watch
  inbox.onnewfile = () => {
    let fileName;
    do {
      fileName = inbox.nextFile();
      if (fileName) {
        data = fs.readFileSync(fileName, "cbor");
        updateBloodSugarDisplay(data.bloodSugars, data.settings);
        updateGraph(data.bloodSugars, data.settings);
        updateStats(data.bloodSugars, data.settings);
        // checkDataState(data.bloodSugars);
        updateAlerts(data.bloodSugars, data.settings);
        console.log("JS memory: " + memory.js.used + "/" + memory.js.total);
      }
    } while (fileName);
  };
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

  let bloodSugar = bloodSugars[0];
  let delta = document.getElementById(deltaEle);
  let sgv = document.getElementById(sgvEle);
  let errorLine = document.getElementById(errorLineEle);
  let timeOfLastSgv = document.getElementById(timeOfLastSgvEle);
  let arrows = document.getElementById(arrowsEle);

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
    "../../resources/img/arrows/" + fistBgNonPredictiveBG.direction + ".png";

  let timeSenseLastSGV = dateTime.getTimeSenseLastSGV(
    fistBgNonPredictiveBG.datetime
  )[1];
  errors.check(timeSenseLastSGV, sgv, errorLine);
}

/**
 * Update alert display
 * @param {Object} bloodSugars recived from the companion
 * @param {Object} settings recived from the companion
 */
var alerts = [];
function updateAlerts(bloodSugars, settings) {
  let sgvEle = "sgv";
  let errorLineEle = "errorLine";
  if (settings.numOfDataSources == 3) {
    // if its the large display
    sgvEle = "largeSgv";
    errorLineEle = "largeErrorLine";
  }
  let alertContainer = document.getElementsByClassName("alertContainer");
  let BloodSugarDisplayContainer = document.getElementsByClassName(
    "bloodSugarDisplay"
  );

  BloodSugarDisplayContainer.forEach((ele, index) => {
    let bloodSugar = bloodSugars[index];
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
  });
}

/**
 * Update settings specific UI elements
 * @param {Object} settings the users settings
 */
function updateSettingSpecificDisplay(settings) {
  var time = document.getElementById("time");
  // Check if user has agreed to user agreement
  // if (userAgreement.check(settings)) {
  // document.getElementById("userAgreement").style.display = "none";
  // console.log("JS memory: " + memory.js.used + "/" + memory.js.total);
  // let singleBG = document.getElementById("singleBG");
  // let dualBG = document.getElementById("dualBG");
  // let largeBG = document.getElementById("largeBG");
  // if (settings.numOfDataSources == 2) {
  //   singleOrMultipleDispaly = document.getElementById("dualBG");
  //   singleBG.style.display = "none";
  //   dualBG.style.display = "inline";
  //   largeBG.style.display = "none";
  // } else if (settings.numOfDataSources == 3) {
  //   singleOrMultipleDispaly = document.getElementById("largeBG");
  //   singleBG.style.display = "none";
  //   dualBG.style.display = "none";
  //   largeBG.style.display = "inline";
  // } else {
  //   singleOrMultipleDispaly = document.getElementById("singleBG");
  //   singleBG.style.display = "inline";
  //   dualBG.style.display = "none";
  //   largeBG.style.display = "none";
  // }
  // actions.init(transfer, singleOrMultipleDispaly, settings);
  // treatments.init(transfer, settings);
  time.text = dateTime.getTime();
  updateBgColor(settings.bgColor, settings.bgColorTwo); // settings only
  setTextColor(settings.textColor); //settings only
  updateHeader(settings.dateFormat, settings.enableDOW); // settings only
  // } else {
  //   // user has not agreed to user agreement
  //   document.getElementById("userAgreement").style.display = "inline";
  // }
}
/**
 * Update header display
 * @param {string} dateFormat recived from the companion
 * @param {string} enableDOW recived from the companion
 */
function updateHeader(dateFormat, enableDOW) {
  var batteryLevel = document.getElementById("batteryLevel");
  var batteryPercent = document.getElementById("batteryPercent");

  // if (data.settings.numOfDataSources != 2) {
  let date = document.getElementById("date");
  batteryLevel = document.getElementById("batteryLevel");
  batteryPercent = document.getElementById("batteryPercent");
  batteryLevel.width = batteryLevels.get().level;
  batteryLevel.style.fill = batteryLevels.get().color;
  batteryPercent.text = batteryLevels.get().percent + "%";
  date.text = dateTime.getDate(dateFormat, enableDOW);
  // }
}
/**
 * update text elements on the page
 * @param {string} color
 */
function setTextColor(color) {
  let settingsTextColor = document.getElementsByClassName("settingsTextColor");
  settingsTextColor.forEach((ele, index) => {
    ele.style.fill = color;
  });
}

/**
 * Update bg color
 * @param {string} bgColorOne hex color recived from the companion
 * @param {string} bgColorTwo hex color two recived from the companion
 */
function updateBgColor(bgColorOne, bgColorTwo) {
  let bgColor = document.getElementsByClassName("bgColor");
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
 * Update graph display
 * @param {Object} bloodSugars recived from the companion
 * @param {Object} settings recived from the companion
 */
function updateGraph(bloodSugars, settings) {
  let graphContainer = document.getElementsByClassName("graph");
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
 * Update stats display
 * @param {Object} bloodSugars recived from the companion
 * @param {Object} settings recived from the companion
 */
function updateStats(bloodSugars, settings) {
  let statsContainer = document.getElementsByClassName("stats");
  statsContainer.forEach((ele, index) => {
    let bloodSugar = bloodSugars[index];
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
 * Helper functions
 */

/**
 * check if a numer is odd
 * @param {number} n the number you want to check if is odd
 * @returns {boolean} true of odd
 */
function isOdd(n) {
  return Math.abs(n % 2) == 1;
}

function commas(value) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
