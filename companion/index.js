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

const settings = new Settings();
const transfer = new Transfer();
const fetch = new Fetch();
const standardize = new Standardize();
const dexcom = new Dexcom();

// const weatherURL = new Weather();
const logs = new Logs();
const sizeof = new Sizeof();
let dataReceivedFromWatch = null;

async function sendData() {
  logs.add("companion - sendData: Version: 2.1.100");
  // Get settings
  const store = await settings.get(dataReceivedFromWatch);

  // Get SGV data
  let bloodsugars = null;
  let extraData = null;
  if (store.url === "dexcom") {
    let USAVSInternational = store.USAVSInternational;
    let subDomain = "share2";
    if (USAVSInternational) {
      subDomain = "shareous1";
    }

    let dexcomUsername = store.dexcomUsername
      ? store.dexcomUsername.replace(/\s+/g, "")
      : "";
    let dexcomPassword = store.dexcomPassword
      ? store.dexcomPassword.replace(/\s+/g, "")
      : "";
    let sessionId = await dexcom.getSessionId(
      dexcomUsername,
      dexcomPassword,
      subDomain
    );
    if (store.dexcomUsername && store.dexcomPassword) {
      bloodsugars = await dexcom.getData(sessionId, subDomain);
    } else {
      bloodsugars = {
        error: {
          status: "500",
        },
      };
    }
  } else {
    bloodsugars = await fetch.get(store.url);
    if (store.extraDataUrl) {
      extraData = await fetch.get(store.extraDataUrl);
    }
  }

  // Get weather data
  // let weather = await fetch.get(await weatherURL.get(store.tempType));
  Promise.all([bloodsugars, extraData]).then(function (values) {
    let dataToSend = {
      bloodSugars: standardize.bloodsugars(values[0], values[1], store),
      settings: standardize.settings(store),
      // weather: values[2].query.results.channel.item.condition,
    };
    logs.add(
      "Line 59: companion - sendData - DataToSend size: " +
        sizeof.size(dataToSend) +
        " bytes"
    );
    logs.add(
      "Line 60: companion - sendData - DataToSend: " +
        JSON.stringify(dataToSend)
    );
    transfer.send(dataToSend);
  });
}

// Listen for messages from the device
messaging.peerSocket.onmessage = function (evt) {
  if (evt.data.command === "forceCompanionTransfer") {
    logs.add("Line 58: companion - Watch to Companion Transfer request");
    // pass in data that was recieved from the watch
    console.log(JSON.stringify(evt.data.data));
    dataReceivedFromWatch = evt.data.data;
    sendData();
  }
};

// Listen for the onerror event
messaging.peerSocket.onerror = function (err) {
  // Handle any errors
  console.log("Connection error: " + err.code + " - " + err.message);
};

settingsStorage.onchange = function (evt) {
  logs.add("Line 70: companion - Settings changed send to watch");
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
  console.error("Started due to wake interval!");
  sendData();
} else {
  // Close the companion and wait to be awoken
  me.yield();
}
// wait 1 seconds before getting things started
setTimeout(sendData, 1000);
