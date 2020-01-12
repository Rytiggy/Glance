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
let settings = new Settings();
var store = settings.get();

import Transfer from "../modules/companion/transfer.js";
const transfer = new Transfer();

import Fetch from "../modules/companion/fetch.js";
const fetch = new Fetch();

import Standardize from "../modules/companion/standardize.js";
const standardize = new Standardize();

import * as logs from "../modules/companion/logs.js";

//FAB
import Dropbox from "../modules/companion/dropbox.js";
const dropbox = new Dropbox();

import Dexcom from "../modules/companion/dexcom.js";
const dexcom = new Dexcom();

import Database from "../modules/companion/database.js";
const database = new Database();

import * as predictions from "../modules/companion/predictions.js";

// Helper
const MILLISECONDS_PER_MINUTE = 1000 * 60;
// Wake the Companion after 5 minutes
me.wakeInterval = 5 * MILLISECONDS_PER_MINUTE;
if (me.launchReasons.wokenUp) {
  sendData();
} else {
  me.yield();
}

let dataReceivedFromWatch = null;
/**
 * Send the data to the watch
 */
async function sendData() {
  console.log("[Sending data] Preparing data to send.");
  // Get settings
  store = await settings.get(dataReceivedFromWatch);
  // login the user
  await database.login(store.email, store.password);

  // update database user logs
  database.update(store);

  // predictions
  if (store.localTreatments) {
    if (await database.isLoggedIn()) {
      console.log("[Sending data] Using cloud treatments.");
      // push to cloud
      await database.updateTreatments(store);
    } else {
      console.log("[Sending data] Using local treatments.");
      // save locally to phone
      predictions.updateTreatments();
    }
  }

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
    async function(values) {
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
            user: await standardize.bloodsugars(
              values[0],
              values[1],
              store,
              keysOne,
              "userOne",
              database
            )
          },
          {
            user:
              store.numOfDataSources == 2
                ? await standardize.bloodsugars(
                    values[2],
                    values[3],
                    store,
                    keysTwo,
                    "userTwo",
                    database
                  )
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
    // which user should we send the treatment to
    let treatmentUrl = null;
    if (evt.data.data.user == 1) {
      treatmentUrl = store.treatmentUrl;
    } else {
      treatmentUrl = store.treatmentUrlTwo;
    }
    let treatment = {
      enteredBy: "Glance",
      carbs: evt.data.data.carbs,
      insulin: evt.data.data.insulin
    };
    await logTreatment(treatmentUrl, evt.data.data.user, treatment);
    sendData();
  }
};

async function logTreatment(treatmentUrl, user, treatment) {
  // if the user has nightscout configured
  if (
    (!store.localTreatments && user == 1 && store.treatmentUrl) ||
    (user == 2 && store.treatmentUrlTwo)
  ) {
    console.log("post log treatment");
    await fetch.post(treatmentUrl, treatment);
  } else if (await database.isLoggedIn()) {
    database.addIOB(treatment.insulin, user);
    database.addCOB(treatment.carbs, user);
  } else {
    // save locally to phone
    predictions.addIOB(treatment.insulin, user);
    predictions.addCOB(treatment.carbs, user);
  }
}
// Listen for the onerror event
messaging.peerSocket.onerror = function(err) {};

settingsStorage.onchange = function(evt) {
  let data = JSON.parse(evt.newValue);

  if (evt.key === "authorizationCode") {
    // Settings page sent us an oAuth token
    dexcom.getAccessToken(data.name);
  }
  if (evt.key == "registerStatus" && data.name == "Creating Account") {
    console.log(evt);
    database.register(store.email, store.password, store.passwordTwo);
  }
  sendData();
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
setTimeout(sendData, 500);

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
