import * as messaging from "messaging";
import document from "document";
import { charger, battery } from "power";
import { HeartRateSensor } from "heart-rate";
import { today } from "user-activity";
import { inbox } from "file-transfer";
import fs from "fs";
import * as fs from "fs";
import { vibration } from "haptics";

import Graph from "graph.js"

let heartRate = new HeartRateSensor();
let totalSeconds = 0;
let timeFormat = false;

let high = document.getElementById("high");
let middle = document.getElementById("middle");
let low = document.getElementById("low");

let docGraph = document.getElementById("docGraph");
let myGraph = new Graph(docGraph);

let showAlertModal = true;

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
setInterval(updater, 5000);

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
  if(!timeFormat) {
    let formatAMPM = (hh >= 12?'PM':'AM');
    hh = hh % 12 || 12;

    if(hh < 10) {
      hh = '0' + hh;
    } 
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

  if(stepCount >= 999 && stepCount <= 9999) {
    stepCount = stepCount.substring(0, 1);
    stepCount.trim();
    stepCount += "k"
  } 
  if(stepCount >= 9999) {
    stepCount = stepCount.substring(0, 2);
    stepCount.trim();
    stepCount += "k"
  }
   document.getElementById("heart").text = JSON.stringify(data.heartRate);
   document.getElementById("step").text = stepCount
}

//minutes sense last pull 
function addSecond() {
  totalSeconds += 5;
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
    setDirection(.8, .9, .44, .44, .9, .44, direction, directionDot)
    setDirection(.8, .9, .44, .44, .9, .44, directionTwo, directionTwoDot)
  } 
 
  if(delta > 5) {
    setDirection(.89, .81, .39, .52, .89, .39, direction, directionDot)
    setDirection(.89, .81, .39, .52, .89, .39, directionTwo, directionTwoDot)
  }
  if(delta >= 7) {
    setDirection(.85, .85, .38, .51, .85, .38, direction, directionDot)
    setDirection(.85, .85, .38, .51, .85, .38,  directionTwo, directionTwoDot)
  }
  if(delta >= 10) {
    setDirection(.82, .82, .38, .51, .82, .38, direction, directionDot)
    setDirection(.90, .90, .38, .51, .90, .38, directionTwo, directionTwoDot)
  }
  
  if(delta < -5) {
    setDirection(.89, .81, .52, .39, .89, .52, direction, directionDot)
    setDirection(.89, .81, .52, .39, .89, .52, directionTwo, directionTwoDot)
  }
  if(delta <= -7) {
   setDirection(.85, .85, .38, .51, .85, .51, direction, directionDot)
   setDirection(.85, .85, .38, .51, .85, .51, directionTwo, directionTwoDot)
  }
  if(delta <= -10) {
    setDirection(.82, .82, .38, .51, .82, .51, direction, directionDot)
    setDirection(.90, .90, .38, .51, .90, .51, directionTwo, directionTwoDot)
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

// converts mmoL to  mg/dL 
function  mgdl( bg ) {
    let mgdlBG = Math.round( (bg * 18) / 10 ) * 10;
  return mgdlBG;
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
  setArrowDirection(data.delta)
  // Temp fix for Spike endpoint 
  // Next pull does not get caculated right
   if(data.nextPull === null) {
    data.nextPull = 300000
   }
  
  if(data.nextPull) {
    if(data.units_hint === 'mmol') {
      data.sgv = mmol( data.sgv ) 
      data.delta = mmol( data.delta ) 
    }
    
    document.getElementById("bg").text = data.sgv
    document.getElementById("delta").text = data.delta + ' ' + data.units_hint
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
    setTimeout(fiveMinUpdater, 900000)    
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
      const CONST_COUNT = data.BGD.length - 1;
      let count = CONST_COUNT;
      
      document.getElementById("bg").style.fill="white"
      
      // High || Low alert  
       // data.BGD[count].sgv = 50
       // data.BGD[count].delta = -4
      let sgv = data.BGD[count].sgv;
      
      if( data.BGD[CONST_COUNT].units_hint == 'mmol' ){
        sgv = mmol(sgv)
      }
      
      if(!(data.settings.disableAlert)) {
        if( sgv >=  data.settings.highThreshold) {
          if((data.BGD[count].delta > 0)){
            console.log('BG HIGH') 
            startVibration("nudge", 3000, sgv)
            document.getElementById("bg").style.fill="#e2574c"
          } else {
            console.log('BG still HIGH, But you are going down') 
            showAlertModal = true;
          }
        }

        if(sgv <=  data.settings.lowThreshold) {
           if((data.BGD[count].delta < 0)){
              console.log('BG LOW') 

              startVibration("nudge", 3000, sgv)
              document.getElementById("bg").style.fill="#e2574c"
             } else {
            console.log('BG still LOW, But you are going UP') 
            showAlertModal = true;
          }
        }
      }
      //End High || Low alert      
    
      processOneBg(data.BGD[count])
      
      
      timeFormat = data.settings.timeFormat
      let highThreshold = data.settings.highThreshold
      let lowThreshold =  data.settings.lowThreshold

      if(data.BGD[count].units_hint === "mmol") {
        highThreshold = mgdl( data.settings.highThreshold )
        lowThreshold = mgdl( data.settings.lowThreshold )
      }
   //   settings(data.settings, data.BGD[count].units_hint)

      
      // Added by NiVZ    
      let ymin = 999;
      let ymax = 0;
      
      data.BGD.forEach(function(bg, index) {
        if (bg.sgv < ymin) { ymin = bg.sgv; }
        if (bg.sgv > ymax) { ymax = bg.sgv; }
      })
      
      ymin -=20;
      ymax +=20;
      
      ymin = Math.floor((ymin/10))*10;
      ymax = Math.floor(((ymax+9)/10))*10;
            
      ymin = ymin < 40 ? ymin : 40;
      ymax = ymax < 210 ? 210 : ymax;
      
      high.text = ymax;
      middle.text = Math.floor(ymin + ((ymax-ymin) *0.5));
      low.text = ymin;
      
      //If mmol is requested format
      if( data.BGD[CONST_COUNT].units_hint == 'mmol' ){
        
        high.text = mmol(ymax);
        middle.text = mmol(Math.floor(ymin + ((ymax-ymin) *0.5)));
        low.text = mmol(ymin = ymin < 0 ? 0 : ymin);
        data.BGD[CONST_COUNT].sgv = mgdl(data.BGD[CONST_COUNT].sgv)
      }
      
      
      // Set the graph scale
      myGraph.setYRange(ymin, ymax);
      // Update the graph
      myGraph.update(data.BGD);  
      
      processWeatherData(data.weather)
    }
  } while (fileName);
};


//----------------------------------------------------------
//
// Plotting the graph
//
//----------------------------------------------------------
// let appHeight =  document.getElementById("app").height;
// //let graphPoints = document.getElementsByClassName('graph-point'); 
// let bgArray = []
// // Takes in a bg, dom element
// function plotPoint(bloodSugar , domElement, highThreshold) {  
//   domElement.cy = (.85 - Math.pow(0.05, 2)*(bloodSugar - 90)) * appHeight;
  
//   //TODO this should set the color of the graph 
//   if(bloodSugar > highThreshold ) {
//     console.log('Hight' + JSON.stringify(domElement))
//     domElement.style.fill = 'red'
//   }
// }

// function returnPoint(bloodSugar) {
//   return (.85 - Math.pow(0.05, 2)*(bloodSugar - 90)) * appHeight;
// }

// // Listen for the onerror event
// messaging.peerSocket.onerror = function(err) {
//   // Handle any errors
//   console.log("Connection error: " + err.code + " - " + err.message);
// }


//----------------------------------------------------------
//
// Settings
//
//----------------------------------------------------------
function settings(settings, unitsHint){   

  
 // console.log(settings.disableAlert)
  //   //document.getElementById("high").y = returnPoint(highThreshold)
  //   document.getElementById("high").text = settings.highThreshold

  //   //document.getElementById("middle").y = (returnPoint(highThreshold) + returnPoint(lowThreshold)) / 2
  //   document.getElementById("middle").text = ( parseInt(settings.highThreshold) + parseInt(settings.lowThreshold ))/2

  //   //document.getElementById("low").y =  returnPoint(lowThreshold)
  //   document.getElementById("low").text = settings.lowThreshold
}



//----------------------------------------------------------
//
// Deals with Vibrations 
//
//----------------------------------------------------------
let vibrationTimeout; 

function startVibration(type, length, message) {
  if(showAlertModal){
    showAlert(message) 
    vibration.start(type);
    if(length){
       vibrationTimeout = setTimeout(function(){ startVibration(type, length, message) }, length);
    }
  }
  
}

function stopVibration() {
  vibration.stop();
  clearTimeout(vibrationTimeout);
}
//----------------------------------------------------------
//
// Alerts
//
//----------------------------------------------------------
let myPopup = document.getElementById("popup");
let btnLeft = myPopup.getElementById("btnLeft");
let btnRight = myPopup.getElementById("btnRight");
let alertHeader = document.getElementById("alertHeader");


function showAlert(message) {
  console.log('ALERT BG')
  console.log(message) 
  alertHeader.text = message
  myPopup.style.display = "inline";
 
}

btnLeft.onclick = function(evt) {
  console.log("Mute");
  // TODO This needs to mute it for 15 mins
  myPopup.style.display = "none";
  stopVibration()
   showAlertModal = false;
}

btnRight.onclick = function(evt) {
  console.log("Snooze");
  myPopup.style.display = "none";
  stopVibration()
}



//----------------------------------------------------------
//
// Action listeners 
//
//----------------------------------------------------------

document.getElementById("status-image").onclick = (e) => {
  fiveMinUpdater()
}
 
// document.getElementById("alertBtn").onclick = (e) => {
//   stopVibration()
// }


