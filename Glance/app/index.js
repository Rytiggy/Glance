import * as messaging from "messaging";
import document from "document";
import { charger, battery } from "power";
import { HeartRateSensor } from "heart-rate";
import { today } from "user-activity";
import { inbox } from "file-transfer";
import fs from "fs";

import * as fs from "fs";


let heartRate = new HeartRateSensor();
let totalSeconds = 0;

let timeOut;
// Init 
setTime() 
setDate()
setBattery()
startMonitors() 

// The updater is used to update the screen every 1 SECONDS 
function updater() {
  setTime() 
  setDate()
  setBattery()
  startMonitors()
  addSecond()
}
setInterval(updater, 1000);

// The fiveMinUpdater is used to update the screen every 5 MINUTES 
function fiveMinUpdater() {
  fetchCompaionData();
  // fetchCompaionData('weather');
}

function setTime() {
  let timeNow = new Date();
  let hh = timeNow.getHours();  
  let mm = timeNow.getMinutes();
  let ss = timeNow.getSeconds();    
  let formatAMPM = (hh >= 12?'PM':'AM');
  hh = hh % 12 || 12;
  
  if(hh < 10) {
    hh = '0' + hh;
  }
    if(mm < 10) {
    mm = '0' + mm;
  }  
  document.getElementById("time").text = (hh + ':' + mm);
  
}

function setDate() { 
  let dateObj = new Date();
  let month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
  let date = ('0' + dateObj.getDate()).slice(-2);
  let year = dateObj.getFullYear();
  let shortDate = month + '/' + date  + '/' + year;
  document.getElementById("date").text = shortDate;
}

function setBattery() {
  document.getElementById("battery").text = (Math.floor(battery.chargeLevel) + "%");
  document.getElementById("battery-level").width =  (.3 * Math.floor(battery.chargeLevel))
}

function startMonitors() {  
  heartRate.start();
  let data = {
      heartRate: heartRate.heartRate ? heartRate.heartRate : 0
  };
  
   let stepCount = (today.local.steps || 0)+"";
  if(stepCount >= 999) {
    stepCount = stepCount.substring(0, 1);
    stepCount.trim();
    stepCount += "k"
  } else if(stepCount >= 9999) {
    stepCount = stepCount.substring(0, 2);
    stepCount.trim();
    stepCount += "k"
  }
   document.getElementById("heart").text = JSON.stringify(data.heartRate);
   document.getElementById("step").text = stepCount
}

//minutes sense last pull 
function addSecond() {
  ++totalSeconds;
  // document.getElementById("seconds").text = pad(totalSeconds % 60);
  document.getElementById("minutes").text = parseInt(totalSeconds / 60) + ' mins';
}

function setArrowDirection(delta) {
  let direction = document.getElementById("direction")
  let directionDot =  document.getElementById("direction-dot")
  
  let directionTwo = document.getElementById("direction-two")
  let directionTwoDot =  document.getElementById("direction-two-dot")

  // TODO find a better way to handle doulbe and single arrows
  if(delta <= 4 || delta >= -4){
    setDirection(.8, .9, .36, .36, .9, .36, direction, directionDot)
    setDirection(.8, .9, .36, .36, .9, .36, directionTwo, directionTwoDot)
  } 
 
  if(delta > 5) {
    setDirection(.89, .81, .31, .44, .89, .31, direction, directionDot)
    setDirection(.89, .81, .31, .44, .89, .31, directionTwo, directionTwoDot)
  }
  if(delta >= 7) {
    setDirection(.85, .85, .30, .43, .85, .30, direction, directionDot)
    setDirection(.85, .85, .30, .43, .85, .30,  directionTwo, directionTwoDot)
  }
  if(delta >= 10) {
    setDirection(.82, .82, .30, .43, .82, .3, direction, directionDot)
    setDirection(.88, .88, .30, .43, .88, .3, directionTwo, directionTwoDot)
  }
  
  if(delta < -5) {
    setDirection(.89, .81, .44, .31, .89, .44, direction, directionDot)
    setDirection(.89, .81, .44, .31, .89, .44, directionTwo, directionTwoDot)
  }
  if(delta <= -7) {
   setDirection(.85, .85, .30, .43, .85, .43, direction, directionDot)
   setDirection(.85, .85, .30, .43, .85, .43, directionTwo, directionTwoDot)
  }
  if(delta <= -10) {
    setDirection(.82, .82, .30, .43, .82, .43, direction, directionDot)
    setDirection(.88, .88, .30, .43, .88, .43, directionTwo, directionTwoDot)
  }
}

//Takes in  % of device you want to take in and the direction lines x1 x2 y1 y2 as well as thedirection dots cx cy
function setDirection(x1, x2, y1, y2, cx, cy, direction, directionDot) {
    let appWidth =  document.getElementById("app").width
    let appHeight =  document.getElementById("app").height

    direction.x1 = x1 * appWidth;
    direction.x2 = x2 * appWidth;
   
    direction.y1 =  y1 * appHeight;
    direction.y2 = y2 * appHeight;
    
    directionDot.cx =  cx * appWidth;
    directionDot.cy = cy * appHeight;
}

// converts a mg/dL to mmoL
function mmol( bg ) {
    let mmolBG = Math.round( (0.0555 * bg) * 10 ) / 10;
  return mmolBG;
}

// set the image of the status image 
function setStatusImage(status) {
    document.getElementById("status-image").href = "img/" + status
}
//----------------------------------------------------------
//
// This section deals with getting data from the compaion app 
//
//----------------------------------------------------------
// Request data from the companion
function fetchCompaionData(cmd) {
  setStatusImage('refresh.png')
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send a command to the companion
    messaging.peerSocket.send({
      command: cmd
    });
  }
}

// Display the weather data received from the companion
function processWeatherData(data) {
  console.log("The temperature is: " + JSON.stringify(data));
  if(data) {
    document.getElementById("temp").text = data.temperature
  }
}

// Display the  data received from the companion
function processOneBg(data) {
  console.log("bg is: " + JSON.stringify(data));
  if(data.nextPull) {
    if(data.units_hint === 'mmol') {
      data.sgv = mmol( data.sgv ) 
      data.delta = mmol( data.delta ) 
    }
    
    document.getElementById("bg").text = data.sgv
    document.getElementById("delta").text = data.delta + ' ' + data.units_hint
    setArrowDirection(data.delta)
    totalSeconds = 0;
    setStatusImage('checked.png')
    clearTimeout(timeOut);
    timeOut = setTimeout(fiveMinUpdater, data.nextPull) 
   
  } else {
    document.getElementById("bg").text = '???'
    document.getElementById("delta").text = 'no data'
    setArrowDirection(0)
    setStatusImage('warrning.png')
    // call function every 10 or 15 mins to check again and see if the data is there   
   // setTimeout(fiveMinUpdater, 900000)    
  }
}

// Listen for the onopen event
messaging.peerSocket.onopen = function() {
  fetchCompaionData();
}


// Event occurs when new file(s) are received
inbox.onnewfile = () => {
  let fileName;
  do {
    // If there is a file, move it from staging into the application folder
    fileName = inbox.nextFile();
    if (fileName) {
     
      const data = fs.readFileSync('file.txt', 'cbor');  
      
      let count = data.BGD.length - 1;
      processOneBg(data.BGD[23])
      data.BGD.forEach(function(bg, index) {
        plotPoint(bg.sgv, graphPoints[count], data.settings.highThreshold)
        count--;
      })
      
      processWeatherData(data.weather)
      settings(data.settings)
    }
  } while (fileName);
};


//----------------------------------------------------------
//
// Plotting the graph
//
//----------------------------------------------------------
let appHeight =  document.getElementById("app").height;
let graphPoints = document.getElementsByClassName('graph-point'); 
let bgArray = []
// Takes in a bg, dom element
function plotPoint(bloodSugar , domElement, highThreshold) {  
  domElement.cy = (.85 - Math.pow(0.05, 2)*(bloodSugar - 90)) * appHeight;
  
  //TODO this should set the color of the graph 
  // if(bloodSugar > highThreshold ) {
  //   console.log('Hight' + JSON.stringify(domElement))
  //   domElement.fill = 'red'
  // }
}

function returnPoint(bloodSugar) {
  return (.85 - Math.pow(0.05, 2)*(bloodSugar - 90)) * appHeight;
}

// Listen for the onerror event
messaging.peerSocket.onerror = function(err) {
  // Handle any errors
  console.log("Connection error: " + err.code + " - " + err.message);
}


//----------------------------------------------------------
//
// Settings
//
//----------------------------------------------------------
function settings(settings){
   document.getElementById("high").y = returnPoint(settings.highThreshold)
   document.getElementById("high").text = settings.highThreshold

   document.getElementById("middle").y = ((returnPoint(settings.highThreshold) + returnPoint(settings.lowThreshold)) / 2)
   document.getElementById("middle").text = ( parseInt(settings.highThreshold) + parseInt(settings.lowThreshold ))/2
  
   document.getElementById("low").y = returnPoint(settings.lowThreshold)
   document.getElementById("low").text = settings.lowThreshold

}

//----------------------------------------------------------
//
// Action listeners 
//
//----------------------------------------------------------

 document.getElementById("status-image").onclick = (e) => {
  fiveMinUpdater()
}

