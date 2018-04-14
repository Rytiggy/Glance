// Import the messaging module
import * as messaging from "messaging";
import { encode } from 'cbor';
import { outbox } from "file-transfer";
import { settingsStorage } from "settings";
import { me } from "companion";
import { geolocation } from "geolocation";


// // default URL pointing at xDrip Plus endpoint
 var URL = null;
//WeatheyAPI connection
var API_KEY = null;
var ENDPOINT = null


// Fetch the weather from OpenWeather
function queryOpenWeather() {
  return fetch(getWeatherEndPoint() + "&APPID=" + getWeatherApiKey())
  .then(function (response) {
     return response.json()
      .then(function(data) {
        // We just want the current temperature
        var weather = {
          type:"weather",
          temperature: Math.round(data["main"]["temp"])
        }
        // Send the weather data to the device
        return weather;
        // returnData(weather);
      });
  })
  .catch(function (err) {
    console.log("Error fetching weather: " + err);
  });
}


function queryBGD() {
  let temp = getSgvURL()
  return fetch(temp)
  .then(function (response) {
      return response.json()
      .then(function(data) {
        let date = new Date();
        let currentBgDate = new Date(data[0].dateString);
        let diffMs = (date - currentBgDate); // milliseconds between now & today
 
        // Check sense last pull and see if time is over 15 mins 
        if(diffMs > 900000) {
          diffMs = false
        }else {
           if(diffMs > 300000) {
            diffMs = 300000
          } else {
            diffMs = Math.round(300000 - diffMs)
          }
          
        }
        let bloodSugars = []
        
        data.forEach(function(bg, index){
           bloodSugars.push({
             sgv: bg.sgv,
             delta: Math.round(bg.delta),
             nextPull: diffMs,
             units_hint: bg.units_hint

          })
        })   
         // Send the data to the device
        return bloodSugars.reverse();
      });
  })
  .catch(function (err) {
    console.log("Error fetching weather: " + err);
  });
}


// Send the weather data to the device
function returnData(data) {  
  const myFileInfo = encode(data);
  outbox.enqueue('file.txt', myFileInfo)
   
}

// Listen for messages from the device
messaging.peerSocket.onmessage = function(evt) {
  if (evt.data) {
   
    let weatherPromise = new Promise(function(resolve, reject) {
      resolve( queryOpenWeather() );
    });
    
    let BGDPromise = new Promise(function(resolve, reject) {
      resolve( queryBGD() );
    });
    
    Promise.all([weatherPromise, BGDPromise]).then(function(values) {
      let dataToSend = {
        'weather':values[0],
        'BGD':values[1],
        'settings': {
          'bgColor': getSettings('bgColor'),
          'highThreshold': getSettings('highThreshold').name,
          'lowThreshold': getSettings('lowThreshold').name
        }
      }
      returnData(dataToSend)
    });
  }
}

// Listen for the onerror event
messaging.peerSocket.onerror = function(err) {
  // Handle any errors
  console.log("Connection error: " + err.code + " - " + err.message);
}


//----------------------------------------------------------
//
// This section deals with settings
//
//----------------------------------------------------------
// settingsStorage.onchange = function(evt) {
//  console.log( getSettings(evt.key) )

// }

// getters 
function getSettings(key) {
  return JSON.parse(settingsStorage.getItem( key ));
}

function getSgvURL() {
  if(getSettings('endpoint').name){
    return getSettings('endpoint').name  
  } else {
    // Default xDrip web service 
    return  "http://127.0.0.1:17580/sgv.json"
  }
}

function getWeatherApiKey() {
  if(getSettings('owmAPI').name){
     return getSettings('owmAPI').name;
  } else {
    return false;
  }
}


function getWeatherEndPoint() {
  return "https://api.openweathermap.org/data/2.5/weather?q=" + getSettings("city").name + "&units=" +  getTempType();
}

function getTempType() {
   if(getSettings('tempType')){
     return 'imperial'
   } else {
      return 'metric'
   }
}

// TODO make this work Lat and Lon auto detect based on location. 
function locationSuccess(position) {
  return "lat=" + position.coords.latitude + "&lon=" + position.coords.longitude;
}

function locationError(error) {
  console.log("Error: " + error.code,
              "Message: " + error.message);
}
