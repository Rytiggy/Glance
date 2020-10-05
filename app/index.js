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
// import { preferences, save, load } from "../modules/app/sharedPreferences";
import { memory } from "system";

const dateTime = new DateTime();
const batteryLevels = new BatteryLevels();
const graph = new Graph();
const userActivity = new UserActivity();
const alerts = new Alerts();
const errors = new Errors();
const transfer = new Transfer();

let main = document.getElementById("main");
let sgv = document.getElementById("sgv");
let rawbg = document.getElementById("rawbg");
let tempBasal = document.getElementById("tempBasal");
let largeGraphsSgv = document.getElementById("largeGraphsSgv");
let delta = document.getElementById("delta");
let largeGraphDelta = document.getElementById("largeGraphDelta");
let timeOfLastSgv = document.getElementById("timeOfLastSgv");
let largeGraphTimeOfLastSgv = document.getElementById(
  "largeGraphTimeOfLastSgv"
);
let largeGraphIob = document.getElementById("largeGraphIob");
let largeGraphCob = document.getElementById("largeGraphCob");
let iob = document.getElementById("iob");
let cob = document.getElementById("cob");

let dateElement = document.getElementById("date");
let timeElement = document.getElementById("time");
let largeGraphTime = document.getElementById("largeGraphTime");
let weather = document.getElementById("weather");
let arrows = document.getElementById("arrows");
let largeGraphArrows = document.getElementById("largeGraphArrows");
let alertArrows = document.getElementById("alertArrows");
let batteryLevel = document.getElementById("battery-level");
let steps = document.getElementById("steps");
let stepIcon = document.getElementById("stepIcon");
let heart = document.getElementById("heart");
let heartIcon = document.getElementById("heartIcon");
let bgColor = document.getElementById("bgColor");
let largeGraphBgColor = document.getElementById("largeGraphBgColor");
let batteryPercent = document.getElementById("batteryPercent");
let popup = document.getElementById("popup");
let dismiss = popup.getElementById("dismiss");
let errorText = document.getElementById("error");
let popupTitle = document.getElementById("popup-title");
let degreeIcon = document.getElementById("degreeIcon");
let goToLargeGraph = document.getElementById("goToLargeGraph");

let largeGraphLoopStatus = document.getElementById("largeGraphLoopStatus");
let largeGraphView = document.getElementById("largeGraphView");
let exitLargeGraph = document.getElementById("exitLargeGraph");

let largeGraphSyringe = document.getElementById("largeGraphSyringe");
let largeGraphHamburger = document.getElementById("largeGraphHamburger");
let syringe = document.getElementById("syringe");
let hamburger = document.getElementById("hamburger");
let predictedBg = document.getElementById("predictedBg");

let dismissHighFor = 120;
let dismissLowFor = 15;

let data = null;
let DISABLE_ALERTS = false;

// Data to send back to phone
let dataToSend = {
  heart: 0,
  steps: userActivity.get().steps,
};
dismiss.onclick = function (evt) {
  console.log("DISMISS");
  popup.style.display = "none";
  popupTitle.style.display = "none";
  vibration.stop();
  DISABLE_ALERTS = true;
  let currentBgFromBloodSugars = getFistBgNonpredictiveBG(data.bloodSugars.bgs);

  if (currentBgFromBloodSugars.sgv >= parseInt(data.settings.highThreshold)) {
    console.log("HIGH " + dismissHighFor);
    setTimeout(disableAlertsFalse, dismissHighFor * 1000 * 60);
  } else {
    // 15 mins
    console.log("LOW " + dismissLowFor);

    setTimeout(disableAlertsFalse, dismissLowFor * 1000 * 60);
  }
};

function disableAlertsFalse() {
  DISABLE_ALERTS = false;
}

sgv.text = "---";
rawbg.text = "";
delta.text = "";
largeGraphDelta.text = "";
iob.text = "0.0";
cob.text = "0.0";
largeGraphIob.text = "0.0";
largeGraphCob.text = "0.0";
dateElement.text = "";
timeOfLastSgv.text = "";
weather.text = "--";
steps.text = "--";
heart.text = "--";
batteryPercent.text = "%";
bgColor.gradient.colors.c1 = "#390263";
largeGraphBgColor.gradient.colors.c1 = "#390263";
errorText.text = "";
update();
setInterval(update, 10000);

timeElement.text = dateTime.getTime();
largeGraphTime.text = dateTime.getTime();
batteryLevel.width = batteryLevels.get().level;

inbox.onnewfile = () => {
  console.log("New file!");
  let fileName;
  do {
    // If there is a file, move it from staging into the application folder
    fileName = inbox.nextFile();
    if (fileName) {
      data = fs.readFileSync(fileName, "cbor");
      update();
    }
  } while (fileName);
};

function update() {
  console.log("app - update()");
  console.warn("JS memory: " + memory.js.used + "/" + memory.js.total);
  let heartrate = userActivity.get().heartRate;
  if (!heartrate) {
    heartrate = 0;
  }
  // Data to send back to phone
  dataToSend = {
    heart: heartrate,
    steps: userActivity.get().steps,
  };

  if (data) {
    console.warn("GOT DATA");
    batteryLevel.width = batteryLevels.get().level;
    batteryLevel.style.fill = batteryLevels.get().color;
    batteryPercent.text = "" + batteryLevels.get().percent + "%";
    timeElement.text = dateTime.getTime(data.settings.timeFormat);
    largeGraphTime.text = dateTime.getTime(data.settings.timeFormat);

    dismissHighFor = data.settings.dismissHighFor;
    dismissLowFor = data.settings.dismissLowFor;
    weather.text = ""; // data.weather.temp;
    degreeIcon.style.display = "none";

    // colors
    bgColor.gradient.colors.c1 = data.settings.bgColor;
    bgColor.gradient.colors.c2 = data.settings.bgColorTwo;

    largeGraphBgColor.gradient.colors.c1 = data.settings.bgColor;
    largeGraphBgColor.gradient.colors.c2 = data.settings.bgColorTwo;

    setTextColor(data.settings.textColor);
    // bloodsugars
    let currentBgFromBloodSugars = getFistBgNonpredictiveBG(
      data.bloodSugars.bgs
    );

    // Layout options
    if (
      currentBgFromBloodSugars[data.settings.layoutOne] &&
      data.settings.layoutOne != "iob"
    ) {
      iob.text = currentBgFromBloodSugars[data.settings.layoutOne];
      syringe.style.display = "none";
      iob.x = 10;
    } else {
      iob.text = commas(userActivity.get().steps);
      syringe.style.display = "inline";
      iob.x = 35;
      if (currentBgFromBloodSugars.iob && currentBgFromBloodSugars.iob != 0) {
        iob.text = currentBgFromBloodSugars.iob + "";
        largeGraphIob.text = currentBgFromBloodSugars.iob + "";
        syringe.style.display = "inline";
        largeGraphSyringe.style.display = "inline";
      } else {
        iob.text = "";
        largeGraphIob.text = "";
        syringe.style.display = "none";
        largeGraphSyringe.style.display = "none";
      }
    }

    if (
      currentBgFromBloodSugars[data.settings.layoutTwo] &&
      data.settings.layoutTwo != "cob"
    ) {
      cob.text = currentBgFromBloodSugars[data.settings.layoutTwo];
      hamburger.style.display = "none";
      cob.x = 10;
    } else {
      cob.text = userActivity.get().heartRate;
      hamburger.style.display = "inline";
      cob.x = 35;
      if (currentBgFromBloodSugars.cob && currentBgFromBloodSugars.cob != 0) {
        cob.text = currentBgFromBloodSugars.cob + "";
        largeGraphCob.text = currentBgFromBloodSugars.cob + "";
        hamburger.style.display = "inline";
        largeGraphHamburger.style.display = "inline";
      } else {
        cob.text = "";
        largeGraphCob.text = "";
        hamburger.style.display = "none";
        largeGraphHamburger.style.display = "none";
      }
    }

    if (
      currentBgFromBloodSugars[data.settings.layoutThree] &&
      data.settings.layoutThree != "steps"
    ) {
      steps.text = currentBgFromBloodSugars[data.settings.layoutThree];
      stepIcon.style.display = "none";
      steps.x = 10;
    } else {
      steps.text = commas(userActivity.get().steps);
      stepIcon.style.display = "inline";
      steps.x = 35;
    }

    if (
      currentBgFromBloodSugars[data.settings.layoutFour] &&
      data.settings.layoutFour != "heart"
    ) {
      heart.text = currentBgFromBloodSugars[data.settings.layoutFour];
      heartIcon.style.display = "none";
      heart.x = 10;
    } else {
      heart.text = userActivity.get().heartRate;
      heartIcon.style.display = "inline";
      heart.x = 35;
    }

    sgv.text = currentBgFromBloodSugars.currentbg;
    largeGraphsSgv.text = currentBgFromBloodSugars.currentbg;
    if (currentBgFromBloodSugars.rawbg) {
      rawbg.text = currentBgFromBloodSugars.rawbg + " ";
    } else {
      rawbg.text = "";
    }

    if (currentBgFromBloodSugars.tempbasal) {
      tempBasal.text = currentBgFromBloodSugars.tempbasal;
    } else {
      tempBasal.text = "";
    }

    if (currentBgFromBloodSugars.predictedbg) {
      predictedBg.text = currentBgFromBloodSugars.predictedbg;
    } else {
      predictedBg.text = "";
    }

    timeOfLastSgv.text = dateTime.getTimeSenseLastSGV(
      currentBgFromBloodSugars.datetime
    )[0];
    largeGraphTimeOfLastSgv.text = dateTime.getTimeSenseLastSGV(
      currentBgFromBloodSugars.datetime
    )[0];

    dateElement.text = dateTime.getDate(
      data.settings.dateFormat,
      data.settings.enableDOW
    );

    let timeSenseLastSGV = dateTime.getTimeSenseLastSGV(
      currentBgFromBloodSugars.datetime
    )[1];
    // if DISABLE_ALERTS is true check if user is in range
    if (DISABLE_ALERTS && data.settings.resetAlertDismissal) {
      if (
        parseInt(timeSenseLastSGV, 10) < data.settings.staleDataAlertAfter &&
        currentBgFromBloodSugars.direction != "DoubleDown" &&
        currentBgFromBloodSugars.direction != "DoubleUp" &&
        currentBgFromBloodSugars.loopstatus != "Warning"
      ) {
        // Dont reset alerts for LOS, DoubleUp, doubleDown, Warning
        if (
          currentBgFromBloodSugars.sgv > parseInt(data.settings.lowThreshold) &&
          currentBgFromBloodSugars.sgv < parseInt(data.settings.highThreshold)
        ) {
          // if the BG is between the threshold
          console.error("here", DISABLE_ALERTS, parseInt(timeSenseLastSGV, 10));
          disableAlertsFalse();
        }
      }
    }

    alerts.check(
      currentBgFromBloodSugars,
      data.settings,
      DISABLE_ALERTS,
      timeSenseLastSGV
    );

    errors.check(timeSenseLastSGV, currentBgFromBloodSugars.currentbg);
    let deltaText = currentBgFromBloodSugars.bgdelta;
    // add Plus
    if (deltaText > 0) {
      deltaText = "+" + deltaText;
    }
    delta.text = deltaText + " " + data.settings.glucoseUnits;
    largeGraphDelta.text = deltaText + " " + data.settings.glucoseUnits;
    largeGraphLoopStatus.text = ""; // currentBgFromBloodSugars.loopstatus;

    arrows.href =
      "../resources/img/arrows/" + currentBgFromBloodSugars.direction + ".png";
    largeGraphArrows.href =
      "../resources/img/arrows/" + currentBgFromBloodSugars.direction + ".png";

    graph.update(
      data.bloodSugars.bgs,
      data.settings.highThreshold,
      data.settings.lowThreshold,
      data.settings
    );

    if (data.settings.largeGraph) {
      goToLargeGraph.style.display = "inline";
    } else {
      goToLargeGraph.style.display = "none";
    }
    // if (data.settings.treatments) {
    //   goToTreatment.style.display = "inline";
    // } else {
    //   goToTreatment.style.display = "none";
    // }
  } else {
    console.warn("NO DATA");
    steps.text = commas(userActivity.get().steps);
    heart.text = userActivity.get().heartRate;
    batteryLevel.width = batteryLevels.get().level;
    batteryPercent.text = "" + batteryLevels.get().percent + "%";

    timeElement.text = dateTime.getTime();
    largeGraphTime.text = dateTime.getTime();

    dateElement.text = dateTime.getDate();
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
function getFistBgNonpredictiveBG(bgs) {
  return bgs.filter((bg) => {
    if (bg.bgdelta || bg.bgdelta === 0) {
      return true;
    }
  })[0];
}

function setTextColor(color) {
  let domElemets = [
    "iob",
    "cob",
    "heart",
    "steps",
    "batteryPercent",
    "date",
    "delta",
    "timeOfLastSgv",
    "time",
    "high",
    "low",
    "largeGraphHigh",
    "largeGraphLow",
    "largeGraphDelta",
    "largeGraphTimeOfLastSgv",
    "largeGraphIob",
    "largeGraphCob",
    "predictedBg",
    "largeGraphTime",
    "largeGraphLoopStatus",
    "tempBasal",
  ];
  domElemets.forEach((ele) => {
    document.getElementById(ele).style.fill = color;
  });
}

goToLargeGraph.onclick = (e) => {
  console.log("goToLargeGraph Activated!");
  vibration.start("bump");
  largeGraphView.style.display = "inline";
  main.style.display = "none";
};

exitLargeGraph.onclick = (e) => {
  console.log("exitLargeGraph Activated!");
  vibration.start("bump");
  largeGraphView.style.display = "none";
  main.style.display = "inline";
};

timeElement.onclick = (e) => {
  console.log("FORCE Activated!");
  transfer.send(dataToSend);
  vibration.start("bump");
  arrows.href = "../resources/img/arrows/loading.png";
  largeGraphArrows.href = "../resources/img/arrows/loading.png";
  alertArrows.href = "../resources/img/arrows/loading.png";
};

// wait 2 seconds
setTimeout(function () {
  transfer.send(dataToSend);
}, 1500);
setInterval(function () {
  transfer.send(dataToSend);
}, 180000);

//<div>Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div><div>Icons made by <a href="https://www.flaticon.com/authors/designerz-base" title="Designerz Base">Designerz Base</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div><div>Icons made by <a href="https://www.flaticon.com/authors/twitter" title="Twitter">Twitter</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
