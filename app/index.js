import { init } from "./views";
import * as messaging from "messaging";

/**
 * Definition for each view in the resources/views folder, and the associated
 * JavaScript module is lazily loaded alongside its view.
 */
let views = init(
  [
    ["smallBG", () => import("./views/home")],
    ["largeBG", () => import("./views/home")],
    ["dualBG", () => import("./views/home")],
    ["userAgreement", () => import("./views/userAgreement")],
    ["actions", () => import("./views/actions")]
  ],

  "./resources/views/"
);

// var dataToSend = {
//   command: "refreshData",
//   data: {
//     heart: 0,
//     steps: userActivity.get().steps
//   }
// };

// clock.ontick = evt => {
//   if (data.settings) {
//     // request new data
//     transfer.send(dataToSend);
//   }
// };
// // when the screen is off add a interval to keep fetching data
// let refreshInterval = null;
// display.onchange = function() {
//   if (display.on) {
//     clearInterval(refreshInterval);
//     refreshInterval = null;
//   } else {
//     refreshInterval = setInterval(function() {
//       transfer.send(dataToSend);
//     }, 120000);
//   }
// };

var data = { bloodSugars: null, settings: null };

// Listen for messages from the companion
messaging.peerSocket.onmessage = function(evt) {
  if (evt.data) {
    if (evt.data.key == "settings") {
      console.log("settings");
      // update the settings to the data object
      data.settings = evt.data.data;
      if (data.settings.userAgreement) {
        if (data.settings.numOfDataSources == 3) {
          views.navigate("largeBG", data);
        } else if (data.settings.numOfDataSources == 2) {
          views.navigate("dualBG", data);
        } else {
          views.navigate("smallBG", data);
        }
      } else {
        views.navigate("userAgreement", data);
      }
    }
  }
};

// // when new data is received from the watch
// inbox.onnewfile = () => {
//   let fileName;
//   do {
//     fileName = inbox.nextFile();
//     if (fileName) {
//       data.bloodSugars = fs.readFileSync(fileName, "cbor").bloodSugars;
//       console.log("JS memory: " + memory.js.used + "/" + memory.js.total);
//     }
//   } while (fileName);
// };
