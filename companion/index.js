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

import { settingsStorage } from "settings";

import Settings from "../modules/companion/settings.js";
import Transfer from "../modules/companion/transfer.js";
import Fetch from "../modules/companion/fetch.js";
import Standardize from "../modules/companion/standardize.js";
// import Weather from "../modules/companion/weather.js";
import Logs from "../modules/companion/logs.js";
import Sizeof from "../modules/companion/sizeof.js";
import Dexcom from "../modules/companion/dexcom.js";

import * as messaging from "messaging";
import { me } from "companion";
// import * as weather from 'fitbit-weather/companion'

//FAB
import Dropbox from "../modules/companion/dropbox.js";

const settings = new Settings();
var store = settings.get();

const transfer = new Transfer();
const fetch = new Fetch();
const standardize = new Standardize();
const dexcom = new Dexcom();

//FAB
const dropbox = new Dropbox();

// const weatherURL = new Weather();
const logs = new Logs();
const sizeof = new Sizeof();
let dataReceivedFromWatch = null;
// weather.setup({ provider : weather.Providers.openweathermap, apiKey : '070d27a069823ebe69e5246f91d6f301' })

// send settings over web sockets while we are getting data from the data source
// function sendSettings() {
//   logs.add("Sending Settings: over messaging");
//   const store = settings.get(dataReceivedFromWatch);

//   if (messaging.peerSocket.readyState == 0) {
//     // Send a command to the app
//     messaging.peerSocket.send(standardize.settings(store));
//   }
// }
// sendSettings();
async function sendData() {
  // Get settings
  store = await settings.get(dataReceivedFromWatch);

  // Get SGV data
  let bloodsugars = null;
  let extraData = null;
  if (store.url === "dexcom") {
    let USAVSInternational = store.USAVSInternational;
    let subDomain = "share2";
    if (USAVSInternational) {
      subDomain = "shareous1";
    }
    let sessionId = await dexcom.getSessionId(
      store.dexcomUsername,
      store.dexcomPassword,
      subDomain
    );
    bloodsugars = await dexcom.getData(sessionId, subDomain);
  } else if (store.url === "yagi") {
    //FAB
    if (store.dropboxToken) {
      bloodsugars = await dropbox.getData(
        store.dropboxToken,
        store.yagiPatientName
      );
    } else {
      bloodsugars = {
        error: {
          status: "500"
        }
      };
    }
  } else {
    bloodsugars = await fetch.get(store.url);
    if (store.extraDataUrl) {
      extraData = await fetch.get(store.extraDataUrl);
    }
  }

  // Get second SGV data
  let bloodsugarsTwo = null;
  let extraDataTwo = null;
  if (store.numOfDataSources == 2) {
    if (store.urlTwo === "dexcom") {
      let USAVSInternationalTwo = store.USAVSInternationalTwo;
      let subDomainTwo = "share2";
      if (USAVSInternationalTwo) {
        subDomainTwo = "shareous1";
      }
      let sessionIdTwo = await dexcom.getSessionId(
        store.dexcomUsernameTwo,
        store.dexcomPasswordTwo,
        subDomainTwo
      );
      bloodsugarsTwo = await dexcom.getData(sessionIdTwo, subDomainTwo);
    } else if (store.urlTwo === "yagi") {
      //FAB
      if (store.dropboxTokenTwo) {
        bloodsugarsTwo = await dropbox.getData(
          store.dropboxTokenTwo,
          store.yagiPatientNameTwo
        );
      } else {
        bloodsugarsTwo = {
          error: {
            status: "500"
          }
        };
      }
    } else {
      bloodsugarsTwo = await fetch.get(store.urlTwo);
      if (store.extraDataUrlTwo) {
        extraDataTwo = await fetch.get(store.extraDataUrlTwo);
      }
    }
  }

  logs.add("bloodsugars: " + JSON.stringify(bloodsugars));
  logs.add("extraData: " + JSON.stringify(extraData));
  logs.add("bloodsugarsTwo: " + JSON.stringify(bloodsugarsTwo));
  logs.add("extraDataTwo: " + JSON.stringify(extraDataTwo));

  // Get weather data
  // let weather = await fetch.get(await weatherURL.get(store.tempType));

  Promise.all([bloodsugars, extraData, bloodsugarsTwo, extraDataTwo]).then(
    function(values) {
      let keysOne = {
        dexcomUsername: "dexcomUsername",
        dexcomPassword: "dexcomPassword",
        dataSource: "dataSource",
        //FAB
        dropboxToken: "dropboxToken",
        yagiPatientName: "yagiPatientName"
      };
      let keysTwo = {
        dexcomUsername: "dexcomUsernameTwo",
        dexcomPassword: "dexcomPasswordTwo",
        dataSource: "dataSourceTwo",
        //FAB
        dropboxToken: "dropboxTokenTwo",
        yagiPatientName: "yagiPatientNameTwo"
      };
      let dataToSend = {
        bloodSugars: [
          {
            user: standardize.bloodsugars(values[0], values[1], store, keysOne)
          },
          {
            user:
              store.numOfDataSources == 2
                ? standardize.bloodsugars(values[2], values[3], store, keysTwo)
                : null
          }
        ],
        settings: standardize.settings(store)
      };
      logs.add("DataToSend size: " + sizeof.size(dataToSend) + " bytes");
      logs.add("DataToSend: " + JSON.stringify(dataToSend));
      transfer.send(dataToSend);
    }
  );
}

// Listen for messages from the device
messaging.peerSocket.onmessage = async function(evt) {
  if (evt.data.command === "refreshData") {
    logs.add("Watch for Companion Transfer request");
    console.log("refresh data");
    // pass in data that was recieved from the watch
    dataReceivedFromWatch = evt.data.data;
    sendData();
  } else if (evt.data.command === "agreedToUserAgreement") {
    settings.setToggle("userAgreement", true);
    sendData();
  } else if (evt.data.command === "postTreatment") {
    console.log("postTreatment", evt.data);
    // which user should we send the treatment to
    let treatmentUrl = store.treatmentUrl;
    if (evt.data.data.user == 1) {
      treatmentUrl = store.treatmentUrl;
    } else {
      treatmentUrl = store.treatmentUrlTwo;
    }
    let data = await fetch.post(treatmentUrl, {
      enteredBy: "Glance",
      carbs: evt.data.data.carbs,
      insulin: evt.data.data.insulin
    });
    console.log(data);

    // pass in data that was recieved from the watch
    // dataReceivedFromWatch = evt.data.data;
    //
    sendData();
  }
};

// Listen for the onerror event
messaging.peerSocket.onerror = function(err) {
  logs.add("Connection error: " + err.code + " - " + err.message);
};

settingsStorage.onchange = function(evt) {
  logs.add("Settings changed send data to watch");
  sendData();
  if (evt.key === "authorizationCode") {
    // Settings page sent us an oAuth token
    let data = JSON.parse(evt.newValue);
    dexcom.getAccessToken(data.name);
  }
};

const MINUTE = 1000 * 60;
me.wakeInterval = 5 * MINUTE;

if (me.launchReasons.wokenUp) {
  // The companion started due to a periodic timer
  sendData();
} else {
  // Close the companion and wait to be awoken
  me.yield();
}
// wait 1 seconds before getting things started
setTimeout(sendData, 1000);
