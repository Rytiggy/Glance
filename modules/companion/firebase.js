import { settingsStorage } from "settings";
import { me as companion } from "companion";
import { device } from "peer";
import Fetch from "./fetch.js";
const fetch = new Fetch();
import config from "../../resources/config.js";

export default class firebase {
  async update(settings) {
    // check to see if there is a token
    if (config.firebase_token.length > 0) {
      // get the uuid or create a new one
      let didCreateNewUuid = false;
      let uuid = null;
      if (settingsStorage.getItem("uuid")) {
        didCreateNewUuid = false;
        uuid = JSON.parse(settingsStorage.getItem("uuid")).name;
      } else if (!uuid) {
        didCreateNewUuid = true;
        uuid = Math.random()
          .toString(36)
          .substr(2, 9)
          .toUpperCase();
        settingsStorage.setItem("uuid", JSON.stringify({ name: uuid }));
      }
      let url = `https://fitbitglance.firebaseio.com/${config.build}/${uuid}.json?auth=${config.firebase_token}`;
      let data = {};
      if (didCreateNewUuid) {
        // new record
        data["uuid"] = uuid;
        data["createdAt"] = Math.floor(Date.now() / 1000);
        data["updatedAt"] = Math.floor(Date.now() / 1000);
        data["userAgreement"] = settings.userAgreement;
        data["dataSource"] = settings.dataSource;
        data["phoneType"] = companion.host.os.name;
        data["device"] = device.modelName;
        data["version"] = config.version;
        // data["buildId"] = me.buildId;
      } else {
        // old record so we need to get the data first
        data = await fetch.get(url);
        // if the record doesn't exist
        if (!data) {
          data = {};
          data["createdAt"] = Math.floor(Date.now() / 1000);
        }
        data["uuid"] = uuid;
        data["updatedAt"] = Math.floor(Date.now() / 1000);
        data["userAgreement"] = settings.userAgreement;
        data["dataSource"] = settings.dataSource;
        data["phoneType"] = companion.host.os.name;
        data["device"] = device.modelName;
        data["version"] = config.version;

        // data.buildId = me.buildId;
      }
      // update the record
      await fetch.put(url, data);
    }
  }
}
