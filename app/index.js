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
// import { preferences, save, load } from "../modules/app/sharedPreferences";
import { memory } from "system";

const dateTime = new DateTime();
const batteryLevels = new BatteryLevels();
const graph = new Graph();
const userActivity = new UserActivity();
const errors = new Errors();
const transfer = new Transfer();
var alerts = [];
var data = null;
var singleOrMultipleDispaly = document.getElementById('singleBG');
var time = singleOrMultipleDispaly.getElementById("time");
var batteryLevel = document.getElementById('batteryLevel');
var batteryPercent = document.getElementById('batteryPercent');

loadingScreen();
setInterval(updateDisplay(data), 10000);
inbox.onnewfile = () => {
  let fileName;
  do {
    fileName = inbox.nextFile();
    if (fileName) {
      data = fs.readFileSync(fileName, 'cbor');  
    }
  } while (fileName);
  updateDisplay(data);
};

/**
* Update watchface display
* @param {Object} data recived from the companion
*/
function updateDisplay(data) {
  if(data) {
    if(data.settings.numOfDataSources == 2) {
      singleOrMultipleDispaly = document.getElementById('dualBG');
      document.getElementById("dualBG").style.display = "inline";
      document.getElementById("singleBG").style.display = "none";
    } else {
      singleOrMultipleDispaly = document.getElementById('singleBG');
      document.getElementById("singleBG").style.display = "inline"; 
      document.getElementById("dualBG").style.display = "none";
    }
    time = singleOrMultipleDispaly.getElementById("time");

    time.text = dateTime.getTime(data.settings.timeFormat);
   
    checkDataState(data);
    updateAlerts(data);
    updateBloodSugarDisplay(data);
    updateStats(data);
    updateGraph(data);
    updateBgColor(data);
    updateHeader(data);  
  } else {
    console.warn('NO DATA');
    batteryLevel.width = batteryLevels.get().level;
    batteryPercent.text = '' + batteryLevels.get().percent + '%';
    updateTimeDisplay()
  }
}

function updateBloodSugarDisplay(data) {
  const BloodSugarDisplayContainer = singleOrMultipleDispaly.getElementsByClassName('bloodSugarDisplay');
  BloodSugarDisplayContainer.forEach((ele, index) => {
    const bloodSugar = data.bloodSugars[index];
    const delta = BloodSugarDisplayContainer[index].getElementById('delta'); 
    const sgv = BloodSugarDisplayContainer[index].getElementById('sgv'); 
    const errorLine = BloodSugarDisplayContainer[index].getElementById('errorLine'); 
    const timeOfLastSgv = BloodSugarDisplayContainer[index].getElementById('timeOfLastSgv'); 
    const arrows = BloodSugarDisplayContainer[index].getElementById('arrows');
    const fistBgNonPredictiveBG = getfistBgNonPredictiveBG(bloodSugar.user.bgs);
   
    let deltaText = fistBgNonPredictiveBG.bgdelta;
    // add Plus
    if (deltaText > 0) {
      deltaText = '+' + deltaText;
    }
    delta.text = deltaText  + ' ' + data.settings.glucoseUnits; 
    sgv.text = fistBgNonPredictiveBG.currentbg;
    timeOfLastSgv.text = dateTime.getTimeSenseLastSGV(fistBgNonPredictiveBG.datetime)[0];
    arrows.href = '../resources/img/arrows/'+fistBgNonPredictiveBG.direction+'.png';

    let timeSenseLastSGV = dateTime.getTimeSenseLastSGV(fistBgNonPredictiveBG.datetime)[1];
    errors.check(timeSenseLastSGV, sgv, errorLine);
  });
}

function updateAlerts(data) {
  const alertContainer = singleOrMultipleDispaly.getElementsByClassName('alertContainer');
  const BloodSugarDisplayContainer = singleOrMultipleDispaly.getElementsByClassName('bloodSugarDisplay');
  
  BloodSugarDisplayContainer.forEach((ele, index) => {
    const bloodSugar = data.bloodSugars[index];
    const sgv = BloodSugarDisplayContainer[index].getElementById('sgv'); 
    const errorLine = BloodSugarDisplayContainer[index].getElementById('errorLine'); 
    const fistBgNonPredictiveBG = getfistBgNonPredictiveBG(bloodSugar.user.bgs);

    let userName = null;
		if(index == 0) {
      userName = 	data.settings.dataSourceName;
    } else {
      userName = 	data.settings.dataSourceNameTwo;
    }

    if(typeof alerts[index] === 'undefined') {
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

function updateStats(data) {
  const statsContainer = singleOrMultipleDispaly.getElementsByClassName('stats');
  statsContainer.forEach((ele, index) => {
    const bloodSugar = data.bloodSugars[index];
    const fistBgNonPredictiveBG = getfistBgNonPredictiveBG(bloodSugar.user.bgs);
    const layoutOne = statsContainer[index].getElementById('layoutOne');
    const layoutTwo = statsContainer[index].getElementById('layoutTwo'); 
    const layoutThree = statsContainer[index].getElementById('layoutThree'); 
    const layoutFour = statsContainer[index].getElementById('layoutFour'); 
    const layoutFive = statsContainer[index].getElementById('layoutFive'); 


    
    let userName = null;
		if(index == 0) {
      userName = 	data.settings.dataSourceName;
    } else {
      userName = 	data.settings.dataSourceNameTwo;
    }
    layoutOne.text = userName;

    if(fistBgNonPredictiveBG[data.settings.layoutTwo]){
      layoutTwo.text =  fistBgNonPredictiveBG[data.settings.layoutOne];
    } else {
      layoutTwo.text = '';
    }

    if(fistBgNonPredictiveBG[data.settings.layoutTwo]){
      layoutThree.text =  fistBgNonPredictiveBG[data.settings.layoutTwo];
    } else {
      layoutThree.text = '';
    }

    if(fistBgNonPredictiveBG[data.settings.layoutThree]){
      layoutFour.text =  fistBgNonPredictiveBG[data.settings.layoutThree];
    } else {
      layoutFour.text = commas(userActivity.get().steps);
    }

    if(fistBgNonPredictiveBG[data.settings.layoutFour]){
      layoutFive.text =  fistBgNonPredictiveBG[data.settings.layoutFour];
    } else {
      layoutFive.text = userActivity.get().heartRate;
    } 
  });
}

function updateGraph(data) {
  const graphContainer = singleOrMultipleDispaly.getElementsByClassName('graph');
  graphContainer.forEach((ele, index) => {
    const bloodSugar = data.bloodSugars[index];
    graph.update(bloodSugar.user.bgs,
      data.settings.highThreshold,
      data.settings.lowThreshold,
      data.settings,
      graphContainer[index]
     );
  });
}

function updateBgColor(data) {
  const bgColor = singleOrMultipleDispaly.getElementsByClassName('bgColor');
  bgColor.forEach((ele, index) => {
    if(isOdd(index)) {
      bgColor[index].gradient.colors.c1 = data.settings.bgColorTwo;
      bgColor[index].gradient.colors.c2 = data.settings.bgColor;
    } else {
      bgColor[index].gradient.colors.c1 = data.settings.bgColor;
      bgColor[index].gradient.colors.c2 = data.settings.bgColorTwo;
    }
  });
}

function updateHeader(data) {
  const date = document.getElementById('date');

  batteryLevel.width = batteryLevels.get().level;
  batteryLevel.style.fill = batteryLevels.get().color;
  batteryPercent.text = batteryLevels.get().percent + '%';
  date.text = dateTime.getDate(data.settings.dateFormat, data.settings.enableDOW);
}

function loadingScreen() {
  let spinner = document.getElementById("spinner");
  const status = document.getElementById('loadingStatus');
  const statusLead = document.getElementById('loadingStatusLead');
  // Start the spinner
  spinner.state = "enabled";
  status.text = 'Syncing with Phone';


  let checkConnection = function() {
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      status.text = 'Phone connected!';
      clearInterval(checkConnectionInterval);
    }
    if (messaging.peerSocket.readyState === messaging.peerSocket.CLOSED) {
      status.text = 'Phone unreachable';
      statusLead.text = 'Try restarting the watch';
    }
  }
  var checkConnectionInterval = setInterval(checkConnection, 5000);

  messaging.peerSocket.onerror = function(err) {
    console.log("Connection error: " + err.code + " - " + err.message);
    status.text = ("Connection error: " + err.code + " - " + err.message);
  }
}

// Validate data is not in error state
function checkDataState(data) {
  var loadingScreenContainer = document.getElementById("loadingScreen");
  const status = document.getElementById('loadingStatus');
  const statusLead = document.getElementById('loadingStatusLead');
  const BloodSugarDisplayContainer = singleOrMultipleDispaly.getElementsByClassName('bloodSugarDisplay');
  
  var errorCodes = [];
  var errorCodesDesc = [];

  BloodSugarDisplayContainer.forEach((ele, index) => {
    const bloodSugar = data.bloodSugars[index];
    const fistBgNonPredictiveBG = getfistBgNonPredictiveBG(bloodSugar.user.bgs);
      console.log(fistBgNonPredictiveBG.currentbg )
      let userId = index + 1;
      if(fistBgNonPredictiveBG.currentbg === "E503") {
        errorCodes.push("E503");
        errorCodesDesc.push(`User${userId}: Check data source`);
      } else if(fistBgNonPredictiveBG.currentbg === "E500") {
        errorCodes.push("E500");
        errorCodesDesc.push(`User${userId}: Data source configuration error`);
      } else if(fistBgNonPredictiveBG.currentbg === "E404") {
        errorCodes.push("E404");
        errorCodesDesc.push(`User${userId}: No Data source found`);
      } 
      
      if(errorCodes.length > 0) {
        status.text = errorCodes.toString();
        statusLead.text = errorCodesDesc.toString();
        loadingScreenContainer.style.display = "inline";
      } else {
        loadingScreenContainer.style.display = "none";
      }
      


  });
}

function commas(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
/**
* Get Fist BG that is not a predictive BG
* @param {Array} bgs
* @returns {Array}
*/
function getfistBgNonPredictiveBG(bgs){
  return bgs.filter((bg) => {
    if(bg.bgdelta || bg.bgdelta === 0) {
      return true;
    }
  })[0];
}

function setTextColor(color){
  let domElemets = ['iob', 'cob', 'heart', 'steps', 'batteryPercent', 'date', 'delta', 'timeOfLastSgv', 'time', 'high', 'low', 'largeGraphHigh', 'largeGraphLow', 'largeGraphDelta', 'largeGraphTimeOfLastSgv', 'largeGraphIob', 'largeGraphCob', 'predictedBg', 'largeGraphTime', 'largeGraphLoopStatus', 'tempBasal'];
  domElemets.forEach(ele => {
    document.getElementById(ele).style.fill = color
  })
}
var dataToSend = {
  heart: 0,
  steps: userActivity.get().steps,
};
// Request data every 5 mins from companion 
setTimeout(function() {
    transfer.send(dataToSend);
}, 1500);
setInterval(  function() {
     transfer.send(dataToSend);
}, 180000);

function updateTimeDisplay(classes) {
  time.text = dateTime.getTime();
}

function isOdd(n) {
  return Math.abs(n % 2) == 1;
}
