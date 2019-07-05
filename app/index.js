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
import Graph from "../modules/app/bloodline.js"
import UserActivity from "../modules/app/userActivity.js"
import Alerts from "../modules/app/alerts.js"
import Errors from "../modules/app/errors.js"
import Transfer from "../modules/app/transfer.js"
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
  
  if(data.settings.numOfDataSources == 2) {
    singleOrMultipleDispaly = document.getElementById('dualBG');
    document.getElementById("dualBG").style.display = "inline";
    document.getElementById("singleBG").style.display = "none";
  } else {
    singleOrMultipleDispaly = document.getElementById('singleBG');
    document.getElementById("singleBG").style.display = "inline"; 
    document.getElementById("dualBG").style.display = "none";
  }

  updateBloodSugarDisplay(data);
  updateAlerts(data);
  updateStats(data);
  updateGraph(data);
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
    sgv.text = fistBgNonPredictiveBG.sgv;
    timeOfLastSgv.text = dateTime.getTimeSenseLastSGV(fistBgNonPredictiveBG.datetime)[0];
    arrows.href = '../resources/img/arrows/'+fistBgNonPredictiveBG.direction+'.png';

    let timeSenseLastSGV = dateTime.getTimeSenseLastSGV(fistBgNonPredictiveBG.datetime)[1];
    errors.check(timeSenseLastSGV, BloodSugarDisplayContainer[index]);
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
      console.log('New Alert Created');
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



    layoutOne.text = fistBgNonPredictiveBG[data.settings.layoutOne];
    layoutTwo.text = fistBgNonPredictiveBG[data.settings.layoutTwo];
    layoutThree.text = fistBgNonPredictiveBG[data.settings.layoutThree];
    // layoutThree.text = userActivity.get().steps;
    layoutFour.text = fistBgNonPredictiveBG[data.settings.layoutFour]; 
    // layoutFour.text = userActivity.get().heartRate;
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
let dataToSend = {
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

function updateBgsDisplay(currentBgFromBloodSugars, classes) {
  let sgv = document.getElementById(classes.sgv);
  let largeGraphsSgv = document.getElementById("largeGraphsSgv");
  let rawbg = document.getElementById(classes.rawbg);
  let tempBasal = document.getElementById(classes.tempBasal);
  let predictedBg = document.getElementById(classes.predictedBg);
  let timeOfLastSgv = document.getElementById(classes.timeOfLastSgv);
  let largeGraphTimeOfLastSgv = document.getElementById("largeGraphTimeOfLastSgv");
  let delta = document.getElementById(classes.delta);
  let largeGraphDelta = document.getElementById('largeGraphDelta');
  let largeGraphLoopStatus = document.getElementById("largeGraphLoopStatus");
  let arrows = document.getElementById(classes.arrows);
  let largeGraphArrows = document.getElementById("largeGraphArrows");

  let iob = document.getElementById(classes.iob);
  let cob = document.getElementById(classes.cob);
  let syringe = document.getElementById(classes.syringe);
  let hamburger = document.getElementById(classes.hamburger);
  let largeGraphIob = document.getElementById("largeGraphIob");
  let largeGraphCob = document.getElementById("largeGraphCob");
  let largeGraphSyringe = document.getElementById("largeGraphSyringe");
  let largeGraphHamburger = document.getElementById("largeGraphHamburger");
  let dataSourceName = document.getElementById(classes.dataSourceName);

  // Layout options
  if( currentBgFromBloodSugars[data.settings.layoutOne] && data.settings.layoutOne != 'iob' ){
    iob.text =  currentBgFromBloodSugars[data.settings.layoutOne];
    syringe.style.display = 'none';
    // iob.x  = 10;
  } else {
      iob.text = commas(userActivity.get().steps);
      syringe.style.display = 'inline';
      // iob.x  = 35;
    if(currentBgFromBloodSugars.iob && currentBgFromBloodSugars.iob != 0) {
      iob.text = currentBgFromBloodSugars.iob + '';
      largeGraphIob.text = currentBgFromBloodSugars.iob + '';
      syringe.style.display = "inline";
      largeGraphSyringe.style.display = "inline";
    } else {
      iob.text = '';
      largeGraphIob.text = '';
      syringe.style.display = "none";
      largeGraphSyringe.style.display = "none";
    }

  }    
  
  if( currentBgFromBloodSugars[data.settings.layoutTwo] && data.settings.layoutTwo != 'cob' ){
    cob.text =  currentBgFromBloodSugars[data.settings.layoutTwo];
    hamburger.style.display = 'none';
    // cob.x  = 10;
  } else {
    cob.text = userActivity.get().heartRate;
    hamburger.style.display = 'inline';
    // cob.x  = 35;
    if(currentBgFromBloodSugars.cob && currentBgFromBloodSugars.cob != 0) {
      cob.text = currentBgFromBloodSugars.cob + '';  
      largeGraphCob.text = currentBgFromBloodSugars.cob + '';  
      hamburger.style.display = "inline";
      largeGraphHamburger.style.display = "inline";
    } else {
      cob.text = '';
      largeGraphCob.text = '';
      hamburger.style.display = "none";
      largeGraphHamburger.style.display = "none";
    }
  }
  
  if( currentBgFromBloodSugars[data.settings.layoutThree] && data.settings.layoutThree != 'steps' ){
    steps.text =  currentBgFromBloodSugars[data.settings.layoutThree];
    stepIcon.style.display = 'none';
    steps.x  = 10;
  } else {
    steps.text = commas(userActivity.get().steps);
    stepIcon.style.display = 'inline';
    steps.x  = 35;
  }    
  
  if( currentBgFromBloodSugars[data.settings.layoutFour] && data.settings.layoutFour != 'heart' ){
    heart.text =  currentBgFromBloodSugars[data.settings.layoutFour];
    heartIcon.style.display = 'none';
    heart.x  = 10;
  } else {
    heart.text = userActivity.get().heartRate;
    heartIcon.style.display = 'inline';
    heart.x  = 35;
  }

  //
  sgv.text = currentBgFromBloodSugars.currentbg;   
  largeGraphsSgv.text = currentBgFromBloodSugars.currentbg; 
  if (currentBgFromBloodSugars.rawbg) {
    rawbg.text = currentBgFromBloodSugars.rawbg + ' ';
  } else {
    rawbg.text = '';
  }
  
  if (currentBgFromBloodSugars.tempbasal) {
    tempBasal.text =  currentBgFromBloodSugars.tempbasal;
  } else {
    tempBasal.text =  '';
  }
  
   if (currentBgFromBloodSugars.predictedbg) {
    predictedBg.text =  currentBgFromBloodSugars.predictedbg;
  } else {
    predictedBg.text =  '';
  }
  
  timeOfLastSgv.text = dateTime.getTimeSenseLastSGV(currentBgFromBloodSugars.datetime)[0];
  largeGraphTimeOfLastSgv.text = dateTime.getTimeSenseLastSGV(currentBgFromBloodSugars.datetime)[0];
    
  
  let timeSenseLastSGV = dateTime.getTimeSenseLastSGV(currentBgFromBloodSugars.datetime)[1];
  // if DISABLE_ALERTS is true check if user is in range 
  if(DISABLE_ALERTS && data.settings.resetAlertDismissal) {
    if( parseInt(timeSenseLastSGV, 10) < data.settings.staleDataAlertAfter && currentBgFromBloodSugars.direction != 'DoubleDown' && currentBgFromBloodSugars.direction != 'DoubleUp' && currentBgFromBloodSugars.loopstatus != 'Warning') { // Dont reset alerts for LOS, DoubleUp, doubleDown, Warning
      if (currentBgFromBloodSugars.sgv > parseInt(data.settings.lowThreshold) && currentBgFromBloodSugars.sgv < parseInt(data.settings.highThreshold)) { // if the BG is between the threshold 
        console.error('here', DISABLE_ALERTS,  parseInt(timeSenseLastSGV, 10))
        disableAlertsFalse()
      }
    }
  }
    
  let deltaText = currentBgFromBloodSugars.bgdelta 
  // add Plus
  if (deltaText > 0) {
    deltaText = '+' + deltaText;
  }

  delta.text = deltaText  +' '+ data.settings.glucoseUnits; 
  largeGraphDelta.text = deltaText  +' '+ data.settings.glucoseUnits;
  largeGraphLoopStatus.text = currentBgFromBloodSugars.loopstatus;
  
  arrows.href = '../resources/img/arrows/'+currentBgFromBloodSugars.direction+'.png'
  largeGraphArrows.href = '../resources/img/arrows/'+currentBgFromBloodSugars.direction+'.png';
  
  graph.update(data[classes.bloodSugars].bgs,
               data.settings.highThreshold,
               data.settings.lowThreshold,
               data.settings,
               classes
              );
  dataSourceName.text = data.settings[classes.dataSourceName];


  let didAlert = alerts.check(currentBgFromBloodSugars, data.settings, DISABLE_ALERTS, timeSenseLastSGV, classes);
  console.error(didAlert)
  if(didAlert) {
    let alertGraphClasses = {
      bloodSugars:'bloodSugars',
      sgv:'sgv',
      rawbg: 'rawbg',
      tempBasal: 'tempBasal',
      predictedBg:'predictedBg',
      timeOfLastSgv: 'timeOfLastSgv',
      delta: 'delta',
      arrows: 'arrows',
      errorLine: 'errorLine',
      iob: 'iob',
      cob: 'cob', 
      syringe: 'syringe',
      hamburger: 'hamburger',
      high: 'high',
      low: 'low',
      highLine: 'highLine',
      meanLine: 'meanLine',
      lowLine: 'lowLine',
      graphPoints: 'graphPoints',
      dataSourceName: 'dataSourceName',
      graphContainer: 'alertGraph'
    }  


    graph.update(data[classes.bloodSugars].bgs,
      data.settings.highThreshold,
      data.settings.lowThreshold,
      data.settings,
      alertGraphClasses
     );
  }
  errors.check(timeSenseLastSGV, classes);
}

function updateTimeDisplay(classes) {
  timeElement.text = dateTime.getTime();
  largeGraphTime.text = dateTime.getTime();
}

