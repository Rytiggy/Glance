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
import Graph from "./bloodline.js";

const graph = new Graph();
const transfer = new Transfer();
const dateTime = new DateTime();

export default class alerts {
  constructor(DISABLE_ALERTS) {
    this.DISABLE_HIGH_ALERTS = DISABLE_ALERTS;
    this.DISABLE_LOW_ALERTS = DISABLE_ALERTS;
    this.DISABLE_LOOPSTATUS_WARNING_ALERTS = DISABLE_ALERTS;
    this.DISABLE_DOUBLEDOWN_ALERTS = DISABLE_ALERTS;
    this.DISABLE_DOUBLEUP_ALERTS = DISABLE_ALERTS;
    this.DISABLE_STALEDATA_ALERTS = DISABLE_ALERTS;
  }

  check(data, bgs, errorLine, sgv, bg, settings, userName, alertContainer) {
    const alertGraphContainer = alertContainer.getElementById("alertGraph");
    const alertUser = alertContainer.getElementById("alertUser");
    const alertTitle = alertContainer.getElementById("alertTitle");
    const alertLead = alertContainer.getElementById("alertLead");
    const alertArrows = alertContainer.getElementById("alertArrows");
    const dismiss = alertContainer.getElementById("dismiss");
    const bgAlertColor = alertContainer.getElementById("bgAlertColor");
    const currentBG = bg.currentbg;
    const loopstatus = bg.loopstatus;
    let timeSinceLastSGV = dateTime.getTimeSenseLastSGV(bg.datetime)[1];
    const staleData =
      parseInt(timeSinceLastSGV, 10) >= settings.staleDataAlertAfter; // Boolean true if  timeSenseLastSGV > 15
    const self = this;
    graph.update(
      bgs,
      data.settings.highThreshold,
      data.settings.lowThreshold,
      data.settings,
      alertGraphContainer
    );

    console.log(
      this.DISABLE_HIGH_ALERTS +
        " " +
        this.DISABLE_LOW_ALERTS +
        " " +
        this.DISABLE_LOOPSTATUS_WARNING_ALERTS +
        " " +
        this.DISABLE_DOUBLEDOWN_ALERTS +
        " " +
        this.DISABLE_STALEDATA_ALERTS
    );
    alertArrows.href = "../resources/img/arrows/" + bg.direction + ".png";
    alertArrows.style.display = "inline";

    let sgvColor = "#75bd78";
    let errorLineColor = "#75bd78";
    alertLead.text = "Check Blood Sugar!";
    alertUser.text = userName;
    bgAlertColor.gradient.colors.c1 = "#99988e";
    alertTitle.style.fontSize = 45;
    alertTitle.x = document.getElementById("glance").width - 6;

    /**
     * Checks if the users BG is less then their low threshold
     */
    if (bg.sgv <= parseInt(settings.lowThreshold) && !staleData) {
      if (!self.DISABLE_LOW_ALERTS && !settings.disableAlert) {
        if (settings.lowAlerts) {
          setAlertDurationValues([15, 30, 60, 5]);
          console.log("low BG");
          vibration.start("ring");
          alertContainer.style.display = "inline";
          alertTitle.style.display = "inline";
          alertTitle.text = currentBG;
        }
      }
      sgvColor = "#de4430";
      sgvColor = "#de4430";
      errorLineColor = "#de4430";
      bgAlertColor.gradient.colors.c1 = "#cc5050";
      alertTitle.style.fontSize = 60;
      alertTitle.x = document.getElementById("glance").width - 38;
    } else if (bg.sgv >= parseInt(settings.highThreshold) && !staleData) {
      /**
       * Checks if the users BG is greater then their high threshold
       */
      if (!self.DISABLE_HIGH_ALERTS && !settings.disableAlert) {
        if (settings.highAlerts) {
          console.log("high BG" + currentBG + alertContainer.style.display);
          vibration.start("ring");
          setAlertDurationValues([60, 120, 240, 30]);
          alertContainer.style.display = "inline";
          alertTitle.style.display = "inline";
          alertTitle.text = currentBG;
        }
      }
      sgv.style.fill = "orange";
      sgvColor = "orange";
      errorLineColor = "orange";
      bgAlertColor.gradient.colors.c1 = "#cc9450";

      if (bg.sgv >= parseInt(settings.highThreshold) + 35) {
        sgv.style.fill = "#de4430";
        sgvColor = "#de4430";
        errorLineColor = "#de4430";
        bgAlertColor.gradient.colors.c1 = "#cc5050";
      }
      alertTitle.style.fontSize = 60;
      alertTitle.x = document.getElementById("glance").width - 38;
    } else if (loopstatus === "Warning" && !staleData) {
      /**
       * check if the loopstatus is in warrning state
       */
      if (!self.DISABLE_LOOPSTATUS_WARNING_ALERTS && !settings.disableAlert) {
        if (settings.loopstatus) {
          console.log("loopstatus");
          setAlertDurationValues([60, 120, 240, 30]);
          alertArrows.style.display = "none";
          sgvColor = "#de4430";
          vibration.start("ring");
          alertContainer.style.display = "inline";
          alertTitle.style.display = "inline";
          alertTitle.text = loopstatus;
          alertLead.text = "Loop Status";
          alertTitle.style.fontSize = 45;
          alertTitle.x = document.getElementById("glance").width - 6;
        }
      }
    } else if (bg.direction === "DoubleDown" && !staleData) {
      /**
       * Check for rapid change in bg
       */
      if (!self.DISABLE_DOUBLEDOWN_ALERTS && !settings.disableAlert) {
        if (settings.rapidFall) {
          alertArrows.style.display = "none";
          console.log("Double Down");
          setAlertDurationValues([15, 30, 60, 5]);
          sgvColor = "#de4430";
          vibration.start("ring");
          alertContainer.style.display = "inline";
          alertTitle.style.display = "inline";
          alertTitle.text = "Rapid Fall!";
          alertTitle.style.fontSize = 45;
          alertTitle.x = document.getElementById("glance").width - 6;
        }
      }
    } else if (bg.direction === "DoubleUp" && !staleData) {
      if (!self.DISABLE_DOUBLEUP_ALERTS && !settings.disableAlert) {
        if (settings.rapidRise) {
          alertArrows.style.display = "none";
          setAlertDurationValues([15, 30, 60, 5]);
          console.log("Double Up");
          sgvColor = "#de4430";
          vibration.start("ring");
          alertContainer.style.display = "inline";
          alertTitle.style.display = "inline";
          alertTitle.text = "Rapid Rise!";
          alertTitle.style.fontSize = 45;
          alertTitle.x = document.getElementById("glance").width - 6;
        }
      }
    } else if (staleData) {
      console.warn(staleData);
      /**
       * Check if stale data
       */
      if (!self.DISABLE_STALEDATA_ALERTS && !settings.disableAlert) {
        if (settings.staleData) {
          setAlertDurationValues([60, 120, 240, 30]);
          alertArrows.style.display = "none";
          sgvColor = "#de4430";
          vibration.start("ring");
          alertContainer.style.display = "inline";
          alertTitle.style.display = "inline";
          alertTitle.text = "Stale data";
          alertTitle.style.fontSize = 45;
          alertTitle.x = document.getElementById("glance").width - 6;
        }
      }
    }

    alertTitle.style.fill = sgvColor;
    errorLine.style.fill = errorLineColor;
    sgv.style.fill = sgvColor;

    dismiss.onclick = function(evt) {
      console.log("DISMISS");
      alertContainer.style.display = "none";
      alertTitle.style.display = "none";
      vibration.stop();
      //get value from tumbler
      let tumbler = document.getElementById("tumbler");
      let selectedIndex = tumbler.value;
      let selectedItem = tumbler.getElementById("item" + selectedIndex);
      let selectedValue = selectedItem.getElementById("content").text;
      let minutes = parseInt(selectedValue, 10);

      if (
        bg.sgv >= parseInt(settings.highThreshold) &&
        !self.DISABLE_HIGH_ALERTS &&
        !staleData
      ) {
        self.DISABLE_HIGH_ALERTS = true;
        console.log("HIGH " + minutes);
        setTimeout(setHighAlertsFalse, minutes * 1000 * 60);
      } else if (
        bg.sgv <= parseInt(settings.lowThreshold) &&
        !self.DISABLE_LOW_ALERTS &&
        !staleData
      ) {
        self.DISABLE_LOW_ALERTS = true;
        console.log("LOW " + minutes);
        setTimeout(setLowAlertsFalse, minutes * 1000 * 60);
      } else if (
        loopstatus === "Warning" &&
        !self.DISABLE_LOOPSTATUS_WARNING_ALERTS &&
        !staleData
      ) {
        self.DISABLE_LOOPSTATUS_WARNING_ALERTS = true;
        console.log("Loop Status " + minutes);
        setTimeout(setLoopStatusAlertsFalse, minutes * 1000 * 60);
      } else if (
        bg.direction === "DoubleDown" &&
        !self.DISABLE_DOUBLEDOWN_ALERTS &&
        !staleData
      ) {
        self.DISABLE_DOUBLEDOWN_ALERTS = true;
        console.log("Double Down " + minutes);
        setTimeout(setDoubleDownAlertsFalse, minutes * 1000 * 60);
      } else if (
        bg.direction === "DoubleUp" &&
        !self.DISABLE_DOUBLEUP_ALERTS &&
        !staleData
      ) {
        self.DISABLE_DOUBLEUP_ALERTS = true;
        console.log("Double Up " + minutes);
        setTimeout(setDoubleUpAlertsFalse, minutes * 1000 * 60);
      } else if (staleData && !self.DISABLE_STALEDATA_ALERTS) {
        self.DISABLE_STALEDATA_ALERTS = true;
        console.log("Stale Data" + minutes);
        setTimeout(setStaleDataAlertsFalse, minutes * 1000 * 60);
      }
    };
    function setHighAlertsFalse() {
      self.DISABLE_HIGH_ALERTS = false;
    }
    function setLowAlertsFalse() {
      self.DISABLE_LOW_ALERTS = false;
    }
    function setLoopStatusAlertsFalse() {
      self.DISABLE_LOOPSTATUS_WARNING_ALERTS = false;
    }
    function setDoubleDownAlertsFalse() {
      self.DISABLE_DOUBLEDOWN_ALERTS = false;
    }
    function setDoubleUpAlertsFalse() {
      self.DISABLE_DOUBLEUP_ALERTS = false;
    }
    function setStaleDataAlertsFalse() {
      self.DISABLE_STALEDATA_ALERTS = false;
    }

    // high or low or other
    function setAlertDurationValues(durations) {
      let tumbler = document.getElementById("tumbler");
      durations.forEach((time, index) => {
        let selectedItem = tumbler.getElementById("item" + index);
        selectedItem.getElementById("content").text = time + " min";
      });
    }
  }

  stop() {
    console.log("app - Alerts - stop()");
    vibration.stop();
  }
}
