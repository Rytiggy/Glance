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
import * as messaging from "messaging";
import { me } from "companion";

import Settings from "../modules/companion/settings.js";
const settings = new Settings();
var store = settings.get();

import Transfer from "../modules/companion/transfer.js";
const transfer = new Transfer();

import Fetch from "../modules/companion/fetch.js";
const fetch = new Fetch();

import Standardize from "../modules/companion/standardize.js";
const standardize = new Standardize();

// import Weather from "../modules/companion/weather.js";
// import * as weather from 'fitbit-weather/companion'

import Logs from "../modules/companion/logs.js";
const logs = new Logs();

//FAB
import Dropbox from "../modules/companion/dropbox.js";
const dropbox = new Dropbox();

import Dexcom from "../modules/companion/dexcom.js";
const dexcom = new Dexcom();

import Firebase from "../modules/companion/firebase.js";
const firebase = new Firebase();

// Helper
const MILLISECONDS_PER_MINUTE = 1000 * 60;
// Wake the Companion after 5 minutes
me.wakeInterval = 5 * MILLISECONDS_PER_MINUTE;
if (me.launchReasons.wokenUp) {
  logs.add("Companion woke up.");
} else {
  logs.add("Companion went to sleep.");
  me.yield();
}

let dataReceivedFromWatch = null;
/**
 * Send the data to the watch
 */
async function sendData() {
  // Get settings
  store = await settings.get(dataReceivedFromWatch);
  // update firebase user logs
  firebase.update(store);
  // send settings
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send({
      key: "settings",
      data: standardize.settings(store)
    });
  }
  // Get SGV data
  let bloodSugarData = await fetchBloodSugarData(
    "url",
    "extraDataUrl",
    "USAVSInternational",
    "dexcomUsername",
    "dexcomPassword",
    "dropboxToken",
    "yagiPatientName"
  );
  let bloodsugars = bloodSugarData.bloodsugars;
  let extraData = bloodSugarData.extraData;

  // Get second SGV data
  let bloodsugarsTwo = null;
  let extraDataTwo = null;
  if (store.numOfDataSources == 2) {
    let bloodSugarDataTwo = await fetchBloodSugarData(
      "urlTwo",
      "extraDataUrlTwo",
      "USAVSInternationalTwo",
      "dexcomUsernameTwo",
      "dexcomPasswordTwo",
      "dropboxTokenTwo",
      "yagiPatientNameTwo"
    );
    bloodsugarsTwo = bloodSugarDataTwo.bloodsugars;
    extraDataTwo = bloodSugarDataTwo.extraData;
  }

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
        ]
      };
      logs.add(dataToSend);
      transfer.send(dataToSend);
    }
  );
}

// Listen for messages from the device
messaging.peerSocket.onmessage = async function(evt) {
  if (evt.data.command === "refreshData") {
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
    sendData();
  }
};

// Listen for the onerror event
messaging.peerSocket.onerror = function(err) {};

settingsStorage.onchange = function(evt) {
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

/**
 * Fetch all the blood sugar data
 * @param {String} urlSettingKey a user setting key
 * @param {String} extraDataUrlSettingKey a user setting key
 * @param {String} dexcomRegionSettingKey a user setting key
 * @param {String} dexcomUsernameSettingKey a user setting key
 * @param {String} dexcomPasswordSettingKey a user setting key
 * @param {String} dropboxTokenSettingKey a user setting key
 * @param {String} yagiPatientNameSettingKey a user setting key
 * @returns {object} the blood sugar object and the extra data a
 */
async function fetchBloodSugarData(
  urlSettingKey,
  extraDataUrlSettingKey,
  dexcomRegionSettingKey,
  dexcomUsernameSettingKey,
  dexcomPasswordSettingKey,
  dropboxTokenSettingKey,
  yagiPatientNameSettingKey
) {
  // Get SGV data
  let bloodsugars = null;
  let extraData = null;
  if (store[urlSettingKey] === "dexcom") {
    let USAVSInternational = store[dexcomRegionSettingKey];
    let subDomain = "share2";
    if (USAVSInternational) {
      subDomain = "shareous1";
    }
    let sessionId = await dexcom.getSessionId(
      store[dexcomUsernameSettingKey],
      store[dexcomPasswordSettingKey],
      subDomain
    );
    // clear Dexcom password and username so they are not logged
    store[dexcomUsernameSettingKey] = null;
    store[dexcomPasswordSettingKey] = null;
    bloodsugars = await dexcom.getData(sessionId, subDomain);
  } else if (store[urlSettingKey] === "yagi") {
    //FAB
    if (store[dropboxTokenSettingKey]) {
      bloodsugars = await dropbox.getData(
        store[dropboxTokenSettingKey],
        store[yagiPatientNameSettingKey]
      );
    } else {
      bloodsugars = {
        error: {
          status: "500"
        }
      };
    }
  } else {
    bloodsugars = await fetch.get(store[urlSettingKey]);
    if (store[extraDataUrlSettingKey]) {
      extraData = await fetch.get(store[extraDataUrlSettingKey]);
    }
  }
  logs.add(store);
  logs.add(bloodsugars);
  logs.add(extraData);
  return {
    bloodsugars,
    extraData
  };
}
