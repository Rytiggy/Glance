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
import { vibration } from "haptics";
import Transfer from "./transfer.js";

import DateTime from "./dateTime.js";

const transfer = new Transfer();

let sgv = document.getElementById("sgv");
let largeGraphsSgv = document.getElementById("largeGraphsSgv");
let errorLine = document.getElementById("errorLine");
// let largeGraphErrorLine = document.getElementById("largeGraphErrorLine");
let popup = document.getElementById("popup");
let alertHeader = document.getElementById("alertHeader");
let dismiss = popup.getElementById("dismiss");
let popupTitle = document.getElementById("popup-title");
let alertArrows = document.getElementById("alertArrows");
let popupLeadText = popup.getElementById("popup-title");

const dateTime = new DateTime();

export default class alerts {
  check(bg, settings, DISABLE_ALERTS, timeSenseLastSGV) {
    let currentBG = bg.currentbg;
    let loopstatus = bg.loopstatus;
    let staleData =
      parseInt(timeSenseLastSGV, 10) >= settings.staleDataAlertAfter; // Boolean true if  timeSenseLastSGV > 15

    alertArrows.href = "../resources/img/arrows/" + bg.direction + ".png";
    alertArrows.style.display = "inline";
    console.log("app - Alerts - Check()");
    sgv.style.fill = "#75bd78";
    largeGraphsSgv.style.fill = "#75bd78";
    errorLine.style.fill = "#75bd78";
    // largeGraphErrorLine.style.fill ="#75bd78";
    popupLeadText.text = "Check Blood Sugar!";

    let timeSenseLastSGV = dateTime.getTimeSenseLastSGV(bg.datetime)[1];
    if (bg.sgv <= parseInt(settings.lowThreshold) && !staleData) {
      if (!settings.disableAlert) {
        if (!DISABLE_ALERTS) {
          if (settings.lowAlerts) {
            if (timeSenseLastSGV <= 8) {
              console.log("low BG");
              vibration.start("ring");
              popup.style.display = "inline";
              popupTitle.style.display = "inline";
              popupTitle.text = currentBG;
            }
          }
        }
      }
      sgv.style.fill = "#de4430";
      largeGraphsSgv.style.fill = "#de4430";

      popupTitle.style.fill = "#de4430";
      errorLine.style.fill = "#de4430";
      // largeGraphErrorLine.style.fill ="#de4430";
    }
    if (bg.sgv >= parseInt(settings.highThreshold) && !staleData) {
      if (!settings.disableAlert) {
        if (!DISABLE_ALERTS) {
          if (settings.highAlerts) {
            if (timeSenseLastSGV <= 8) {
              console.log("high BG");
              vibration.start("ring");
              popup.style.display = "inline";
              popupTitle.style.display = "inline";
              popupTitle.text = currentBG;
            }
          }
        }
      }
      sgv.style.fill = "orange";
      largeGraphsSgv.style.fill = "orange";

      popupTitle.style.fill = "orange";
      errorLine.style.fill = "orange";
      // largeGraphErrorLine.style.fill ="orange";
      if (bg.sgv >= parseInt(settings.highThreshold) + 35) {
        sgv.style.fill = "#de4430";
        largeGraphsSgv.style.fill = "#de4430";
        popupTitle.style.fill = "#de4430";
        errorLine.style.fill = "#de4430";
        // largeGraphErrorLine.style.fill ="#de4430";
      }
    }

    /**
     * loopstatus
     */
    if (loopstatus === "Warning" && !staleData) {
      if (!settings.disableAlert) {
        if (!DISABLE_ALERTS) {
          if (settings.loopstatus) {
            console.log("loopstatus");
            alertArrows.style.display = "none";
            popupTitle.style.fill = "#de4430";
            vibration.start("ring");
            popup.style.display = "inline";
            popupTitle.style.display = "inline";
            popupTitle.text = loopstatus;
            popupLeadText.text = "Loop Status";
          }
        }
      }
    }

    // Check for rapid change in bg
    if (bg.direction === "DoubleDown" && !staleData) {
      if (!settings.disableAlert) {
        if (!DISABLE_ALERTS) {
          if (settings.rapidFall) {
            alertArrows.style.display = "none";
            console.log("Double Down");
            popupTitle.style.fill = "#de4430";
            vibration.start("ring");
            popup.style.display = "inline";
            popupTitle.style.display = "inline";
            popupTitle.text = "Rapid Fall!";
          }
        }
      }
    } else if (bg.direction === "DoubleUp" && !staleData) {
      if (!settings.disableAlert) {
        if (!DISABLE_ALERTS) {
          if (settings.rapidRise) {
            alertArrows.style.display = "none";
            console.log("Double Up");
            popupTitle.style.fill = "#de4430";
            vibration.start("ring");
            popup.style.display = "inline";
            popupTitle.style.display = "inline";
            popupTitle.text = "Rapid Rise!";
          }
        }
      }
    }

    // check if stale data
    if (staleData) {
      if (!settings.disableAlert) {
        if (!DISABLE_ALERTS) {
          if (settings.staleData) {
            alertArrows.style.display = "none";
            popupTitle.style.fill = "#de4430";
            vibration.start("ring");
            popup.style.display = "inline";
            popupTitle.style.display = "inline";
            popupTitle.text = "Stale data";
          }
        }
      }
    }
  }
  stop() {
    console.log("app - Alerts - stop()");
    vibration.stop();
  }
}
