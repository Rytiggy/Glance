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
import Sizeof from "./sizeof.js";

const sizeof = new Sizeof();

export let add = value => {
  // check if value is an object and stringify
  if (typeof value == "object") {
    value = JSON.stringify(value);
  }

  let logsStorage = settingsStorage.getItem("logs");
  // if there are logs and they are larger then 130000 bytes clear them out
  if (logsStorage && sizeof.size(logsStorage) > 130000) {
    settingsStorage.setItem("logs", JSON.stringify({ name: "[]" }));
    logsStorage = settingsStorage.getItem("logs");
  }

  if (logsStorage) {
    try {
      let logStorageObject = JSON.parse(JSON.parse(logsStorage).name);

      if (logStorageObject) {
        logStorageObject.unshift(`${Date.now()} : ${value}`);
        let updatedLogs = JSON.stringify({
          name: JSON.stringify(logStorageObject)
        });
        settingsStorage.setItem("logs", updatedLogs);
      }
    } catch (e) {
      settingsStorage.setItem("logs", JSON.stringify({ name: "[]" }));
    }
  }
};
