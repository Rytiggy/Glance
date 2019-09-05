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
  constructor(DISABLE_ALERTS, dismissHighFor, dismissLowFor) {
    this.DISABLE_HIGH_ALERTS = DISABLE_ALERTS;
    this.DISABLE_LOW_ALERTS = DISABLE_ALERTS;
    this.DISABLE_LOOPSTATUS_WARNING_ALERTS = DISABLE_ALERTS;
    this.DISABLE_DOUBLEDOWN_ALERTS = DISABLE_ALERTS;
    this.DISABLE_DOUBLEUP_ALERTS = DISABLE_ALERTS;
    this.DISABLE_STALEDATA_ALERTS = DISABLE_ALERTS;

    // this.dismissHighFor = dismissHighFor;
    // this.dismissLowFor = dismissLowFor;
  }

  check(data, bgs, errorLine, sgv, bg, settings, userName, alertContainer) {
    console.warn(this.DISABLE_HIGH_ALERTS + " " + this.DISABLE_LOW_ALERTS);
    const alertGraphContainer = alertContainer.getElementById("alertGraph");
    const alertUser = alertContainer.getElementById("alertUser");
    const alertTitle = alertContainer.getElementById("alertTitle");
    const alertLead = alertContainer.getElementById("alertLead");
    const alertArrows = alertContainer.getElementById("alertArrows");
    const dismiss = alertContainer.getElementById("dismiss");
    const bgAlertColor = alertContainer.getElementById("bgAlertColor");
    const currentBG = bg.currentbg;
    const loopstatus = bg.loopstatus;
    const staleData =
      parseInt(timeSenseLastSGV, 10) >= settings.staleDataAlertAfter; // Boolean true if  timeSenseLastSGV > 15
    const self = this;

    graph.update(
      bgs,
      data.settings.highThreshold,
      data.settings.lowThreshold,
      data.settings,
      alertGraphContainer
    );

    alertArrows.href = "../resources/img/arrows/" + bg.direction + ".png";
    alertArrows.style.display = "inline";

    console.log("app - Alerts - Check()");
    sgv.style.fill = "#75bd78";
    errorLine.style.fill = "#75bd78";
    alertLead.text = "Check Blood Sugar!";
    alertUser.text = userName;
    bgAlertColor.gradient.colors.c1 = "#99988e";
    alertTitle.style.fontSize = 30;
    alertTitle.x = document.getElementById("glance").width - 6;

    let timeSenseLastSGV = dateTime.getTimeSenseLastSGV(bg.datetime)[1];
    if (bg.sgv <= parseInt(settings.lowThreshold) && !staleData) {
      if (!settings.disableAlert) {
        if (!self.DISABLE_LOW_ALERTS) {
          if (settings.lowAlerts) {
            if (timeSenseLastSGV <= 8) {
              console.log("low BG");
              vibration.start("ring");
              alertContainer.style.display = "inline";
              alertTitle.style.display = "inline";
              alertTitle.text = currentBG;
            }
          }
        }
      }
      sgv.style.fill = "#de4430";
      alertTitle.style.fill = "#de4430";
      errorLine.style.fill = "#de4430";
      bgAlertColor.gradient.colors.c1 = "#cc5050";
      alertTitle.style.fontSize = 60;
      alertTitle.x = document.getElementById("glance").width - 38;
    }
    if (bg.sgv >= parseInt(settings.highThreshold) && !staleData) {
      if (!settings.disableAlert) {
        if (!self.DISABLE_HIGH_ALERTS) {
          if (settings.highAlerts) {
            if (timeSenseLastSGV <= 8) {
              console.log("high BG" + currentBG + alertContainer.style.display);
              vibration.start("ring");
              alertContainer.style.display = "inline";
              alertTitle.style.display = "inline";
              alertTitle.text = currentBG;
            }
          }
        }
      }
      sgv.style.fill = "orange";
      alertTitle.style.fill = "orange";
      errorLine.style.fill = "orange";
      bgAlertColor.gradient.colors.c1 = "#cc9450";

      if (bg.sgv >= parseInt(settings.highThreshold) + 35) {
        sgv.style.fill = "#de4430";
        alertTitle.style.fill = "#de4430";
        errorLine.style.fill = "#de4430";
        bgAlertColor.gradient.colors.c1 = "#cc5050";
      }
      alertTitle.style.fontSize = 60;
      alertTitle.x = document.getElementById("glance").width - 38;
    }

    /**
     * loopstatus
     */
    if (loopstatus === "Warning" && !staleData) {
      if (!settings.disableAlert) {
        if (!self.DISABLE_LOOPSTATUS_WARNING_ALERTS) {
          if (settings.loopstatus) {
            console.log("loopstatus");
            alertArrows.style.display = "none";
            alertTitle.style.fill = "#de4430";
            vibration.start("ring");
            alertContainer.style.display = "inline";
            alertTitle.style.display = "inline";
            alertTitle.text = loopstatus;
            alertLead.text = "Loop Status";
          }
        }
      }
    }

    // Check for rapid change in bg
    if (bg.direction === "DoubleDown" && !staleData) {
      if (!settings.disableAlert) {
        if (!self.DISABLE_DOUBLEDOWN_ALERTS) {
          if (settings.rapidFall) {
            alertArrows.style.display = "none";
            console.log("Double Down");
            alertTitle.style.fill = "#de4430";
            vibration.start("ring");
            alertContainer.style.display = "inline";
            alertTitle.style.display = "inline";
            alertTitle.text = "Rapid Fall!";
          }
        }
      }
    } else if (bg.direction === "DoubleUp" && !staleData) {
      if (!settings.disableAlert) {
        if (!self.DISABLE_DOUBLEUP_ALERTS) {
          if (settings.rapidRise) {
            alertArrows.style.display = "none";
            console.log("Double Up");
            alertTitle.style.fill = "#de4430";
            vibration.start("ring");
            alertContainer.style.display = "inline";
            alertTitle.style.display = "inline";
            alertTitle.text = "Rapid Rise!";
          }
        }
      }
    }

    // check if stale data
    if (staleData) {
      if (!settings.disableAlert) {
        if (!self.DISABLE_STALEDATA_ALERTS) {
          if (settings.staleData) {
            alertArrows.style.display = "none";
            alertTitle.style.fill = "#de4430";
            vibration.start("ring");
            alertContainer.style.display = "inline";
            alertTitle.style.display = "inline";
            alertTitle.text = "Stale data";
          }
        }
      }
    }

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

      if (bg.sgv >= parseInt(settings.highThreshold)) {
        // high
        self.DISABLE_HIGH_ALERTS = true;
        console.log("HIGH " + minutes);
        setTimeout(setHighAlertsFalse, minutes * 1000 * 60);
      } else if (bg.sgv <= parseInt(settings.lowThreshold)) {
        // low
        self.DISABLE_LOW_ALERTS = true;
        console.log("LOW " + minutes);
        setTimeout(setLowAlertsFalse, minutes * 1000 * 60);
      } else if (loopstatus === "Warning") {
        self.DISABLE_LOOPSTATUS_WARNING_ALERTS = true;
        console.log("Loop Status " + minutes);
        setTimeout(setLoopStatusAlertsFalse, minutes * 1000 * 60);
      } else if (bg.direction === "DoubleDown") {
        self.DISABLE_DOUBLEDOWN_ALERTS = true;
        console.log("Double Down " + minutes);
        setTimeout(setDoubleDownAlertsFalse, minutes * 1000 * 60);
      } else if (bg.direction === "DoubleUp") {
        self.DISABLE_DOUBLEDOWN_ALERTS = true;
        console.log("Double Up " + minutes);
        setTimeout(setDoubleUpAlertsFalse, minutes * 1000 * 60);
      } else {
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
      self.DISABLE_DOUBLEDOWN_ALERTS = false;
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
  }

  // check(bg, settings, timeSenseLastSGV, container) {
  // 	let popup = document.getElementById("alert");
  // 	let popupTitle = document.getElementById("popup-title");
  // 	let popupLeadText = document.getElementById('copy')
  // 	let alertArrows = document.getElementById("alertArrows");
  // 	let sgv = container.getElementById('sgv');
  // 	// let largeGraphsSgv = document.getElementById("largeGraphsSgv");
  // 	let self = this;
  // 	let errorLine = container.getElementById('errorLine');
  // 	let currentBG = bg.currentbg;
  // 	let loopstatus = bg.loopstatus;
  //   let staleData = parseInt(timeSenseLastSGV, 10) >= settings.staleDataAlertAfter; // Boolean true if  timeSenseLastSGV > 15

  // 	alertArrows.href = '../resources/img/arrows/' + bg.direction + '.png';
  // 	alertArrows.style.display = 'inline';
  // 	console.log('app - Alerts - Check()')
  // 	sgv.style.fill = "#75bd78";
  // 	// largeGraphsSgv.style.fill = "#75bd78";
  // 	errorLine.style.fill = "#75bd78";
  // 	// largeGraphErrorLine.style.fill ="#75bd78";
  // 	popupLeadText.text = 'Check Blood Sugar!';

  // 	let timeSenseLastSGV = dateTime.getTimeSenseLastSGV(bg.datetime)[1];
  //   if (bg.sgv <= parseInt(settings.lowThreshold) && !staleData) {
  // 		if (!settings.disableAlert) {
  // 			if (!this.DISABLE_ALERTS) {
  // 				if (settings.lowAlerts) {
  // 					if (timeSenseLastSGV <= 8) {
  // 						console.log('low BG')
  // 						vibration.start("ring");
  // 						popup.style.display = "inline";
  // 						popupTitle.style.display = "inline";
  // 						popupTitle.text = currentBG;
  // 						return true;
  // 					}
  // 				}
  // 			}
  // 		}
  // 		sgv.style.fill = "#de4430";
  // 		// largeGraphsSgv.style.fill = "#de4430";

  // 		popupTitle.style.fill = "#de4430";
  // 		errorLine.style.fill = "#de4430";
  // 		// largeGraphErrorLine.style.fill ="#de4430";

  // 	}
  // 	if (bg.sgv >= parseInt(settings.highThreshold) && !staleData) {
  // 		if (!settings.disableAlert) {
  // 			if (!this.DISABLE_ALERTS) {
  // 				if (settings.highAlerts) {
  // 					if (timeSenseLastSGV <= 8) {
  // 						console.log('high BG' + currentBG + popup.style.display)
  // 						vibration.start("ring");
  // 						popup.style.display = "inline";
  // 						popupTitle.style.display = "inline";
  // 						popupTitle.text = currentBG;
  // 						return true;
  // 					}
  // 				}
  // 			}
  // 		}
  // 		sgv.style.fill = "orange";
  // 		// largeGraphsSgv.style.fill = "orange";

  // 		popupTitle.style.fill = "orange";
  // 		errorLine.style.fill = "orange";
  // 		// largeGraphErrorLine.style.fill ="orange";
  // 		if (bg.sgv >= (parseInt(settings.highThreshold) + 35)) {
  // 			sgv.style.fill = "#de4430";
  // 			largeGraphsSgv.style.fill = "#de4430";
  // 			popupTitle.style.fill = "#de4430";
  // 			errorLine.style.fill = "#de4430";
  // 			// largeGraphErrorLine.style.fill ="#de4430";
  // 			return true;
  // 		}
  // 	}

  // 	/**
  // 	 * loopstatus
  // 	 */
  // 	if (loopstatus === 'Warning' && !staleData) {
  // 		if (!settings.disableAlert) {
  // 			if (!this.DISABLE_ALERTS) {
  // 				if (settings.loopstatus) {
  // 					console.log('loopstatus')
  // 					alertArrows.style.display = 'none';
  // 					popupTitle.style.fill = "#de4430";
  // 					vibration.start("ring");
  // 					popup.style.display = "inline";
  // 					popupTitle.style.display = "inline";
  // 					popupTitle.text = loopstatus;
  // 					popupLeadText.text = 'Loop Status';
  // 					return true;
  // 				}
  // 			}
  // 		}
  // 	}

  // 	// Check for rapid change in bg
  // 	if (bg.direction === 'DoubleDown' && !staleData) {
  // 		if (!settings.disableAlert) {
  // 			if (!this.DISABLE_ALERTS) {
  // 				if (settings.rapidFall) {
  // 					alertArrows.style.display = 'none';
  // 					console.log('Double Down')
  // 					popupTitle.style.fill = "#de4430";
  // 					vibration.start("ring");
  // 					popup.style.display = "inline";
  // 					popupTitle.style.display = "inline";
  // 					popupTitle.text = 'Rapid Fall!';
  // 					return true;
  // 				}
  // 			}
  // 		}
  // 	} else if (bg.direction === 'DoubleUp' && !staleData) {
  // 		if (!settings.disableAlert) {
  // 			if (!this.DISABLE_ALERTS) {
  // 				if (settings.rapidRise) {
  // 					alertArrows.style.display = 'none';
  // 					console.log('Double Up')
  // 					popupTitle.style.fill = "#de4430";
  // 					vibration.start("ring");
  // 					popup.style.display = "inline";
  // 					popupTitle.style.display = "inline";
  // 					popupTitle.text = 'Rapid Rise!';
  // 					return true;
  // 				}
  // 			}
  // 		}
  // 	}

  //   // check if stale data
  // 	if (staleData) {
  // 		if (!settings.disableAlert) {
  // 			if (!this.DISABLE_ALERTS) {
  // 				if (settings.staleData) {
  // 					alertArrows.style.display = 'none';
  // 					popupTitle.style.fill = "#de4430";
  // 					vibration.start("ring");
  // 					popup.style.display = "inline";
  // 					popupTitle.style.display = "inline";
  // 					popupTitle.text = 'Stale data';
  // 					return true;
  // 				}
  // 			}
  // 		}
  // 	}

  // 	let dismiss = document.getElementById("dismiss");
  // 	dismiss.onmouseup = function(evt) {
  // 		console.log("DISMISS");
  // 		popup.style.display = "none";
  // 		popupTitle.style.display = "none";
  // 		vibration.stop();
  // 		this.DISABLE_ALERTS = true;

  // 		if (bg.sgv >= parseInt(settings.highThreshold)) {
  // 		  console.log("HIGH " + self.dismissHighFor);
  // 		  setTimeout(disableAlertsFalse, (self.dismissHighFor*1000)*60);
  // 		} else {
  // 		  // 15 mins
  // 		  console.log("LOW " + self.dismissLowFor);

  // 		  setTimeout(disableAlertsFalse, (self.dismissLowFor*1000)*60);
  // 		}
  // 		}

  // 	  function disableAlertsFalse() {
  // 			self.DISABLE_ALERTS = false;
  // 	  };

  // 	return false;
  // }
  stop() {
    console.log("app - Alerts - stop()");
    vibration.stop();
  }
}
