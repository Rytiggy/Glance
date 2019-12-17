import { inbox } from "file-transfer";
import fs from "fs";

var data = { bloodSugars: null, settings: null };

export default {
  fetch: () => {
    messaging.peerSocket.onmessage = function(evt) {
      if (evt.data) {
        if (evt.data.key == "settings") {
          // update the settings to the data object
          data.settings = evt.data.data;
          console.log("settings");
        }
      }
    };
    inbox.onnewfile = () => {
      let fileName;
      do {
        fileName = inbox.nextFile();
        if (fileName) {
          data.bloodSugars = fs.readFileSync(fileName, "cbor").bloodSugars;
          console.log("file");
        }
      } while (fileName);
    };
  }
};
