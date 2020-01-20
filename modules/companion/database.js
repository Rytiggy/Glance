import { settingsStorage } from "settings";
import { me as companion } from "companion";
import { localStorage } from "local-storage";
import { device } from "peer";
import Fetch from "./fetch.js";
const fetch = new Fetch();
import config from "../../resources/config.js";
import * as logs from "./logs.js";
import * as predictions from "./predictions.js";
import * as algorithms from "../../resources/algorithms.js";

export default class database {
  async update(settings) {
    logs.add(
      `dataSource: ${settings.dataSource} dataSourceTwo: ${settings.dataSourceTwo} PhoneType: ${companion.host.os.name} modelName: ${device.modelName} version: ${config.version} build: ${config.build}`
    );
    // check to see if there is a token
    if (config.firebase_token.length > 0) {
      // ----------------------------------------hr---min--sec--ms
      let halfADayAgo = Math.floor((Date.now() - 12 * 60 * 60 * 1000) / 1000);
      let localStorageUpdatedAt = localStorage.getItem("updatedAt");
      // check if they have update their user data within the last half day
      if (!localStorageUpdatedAt || localStorageUpdatedAt <= halfADayAgo) {
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
        let url = `${config.baseUrl}/${config.build}/${uuid}.json?auth=${config.firebase_token}`;
        let data = {};
        if (didCreateNewUuid) {
          // new record
          data["uuid"] = uuid;
          data["createdAt"] = Math.floor(Date.now() / 1000);
          data["updatedAt"] = Math.floor(Date.now() / 1000);
          data["userAgreement"] = settings.userAgreement;
          data["dataSource"] = settings.dataSource;
          data["dataSourceTwo"] = settings.dataSourceTwo;
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
          data["dataSourceTwo"] = settings.dataSourceTwo;
          data["phoneType"] = companion.host.os.name;
          data["device"] = device.modelName;
          data["version"] = config.version;

          // data.buildId = me.buildId;
        }
        localStorage.setItem("updatedAt", data["updatedAt"]);
        // update the record
        await fetch.put(url, data);
      }
    }
  }
  // Login the user to their account
  async login(email, password) {
    logs.add("[Login] Trying to login Glance user.");
    if (email.length > 0 && password.length > 0) {
      try {
        let url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${config.apiKey}`;
        let data = {
          email,
          password,
          returnSecureToken: true
        };
        let response = await fetch.post(url, data);
        if (response.error) {
          // ERROR
          let error = response.error;
          settingsStorage.setItem(
            "status",
            JSON.stringify({ name: error.message })
          );
          localStorage.setItem("localId", null);
          logs.add(`[Login] ${error.message}`);
        } else {
          settingsStorage.setItem(
            "status",
            JSON.stringify({ name: "connected" })
          );
          localStorage.setItem("localId", response.localId);
          logs.add("[Login] Connected");
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      logs.add(
        `[Login] Email and/or password are blank. Using local treatments.`
      );
      settingsStorage.setItem("status", JSON.stringify({ name: "" }));
      localStorage.setItem("localId", null);
    }
  }

  async register(email, password, passwordTwo) {
    if (email.length > 0 && password.length > 0 && password == passwordTwo) {
      let url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${config.apiKey}`;
      let data = {
        email,
        password,
        returnSecureToken: true
      };
      let response = await fetch.post(url, data);
      if (response.error) {
        let error = response.error;
        settingsStorage.setItem(
          "registerStatus",
          JSON.stringify({ name: error.message })
        );
      } else {
        settingsStorage.setItem(
          "registerStatus",
          JSON.stringify({ name: "Successfully created Glance account." })
        );
      }
    } else {
      settingsStorage.setItem(
        "registerStatus",
        JSON.stringify({ name: "Passwords do not match!" })
      );
    }
  }

  async isLoggedIn() {
    var user;
    if (localStorage.getItem("localId")) {
      user = true;
    } else {
      user = false;
    }
    return user;
  }
  // Setters
  async addIOB(iob, user) {
    let userId = localStorage.getItem("localId");
    let url = `${config.baseUrl}/treatments/${userId}/iob.json?auth=${config.firebase_token}`;
    let data = {
      createdAt: Math.floor(Date.now()),
      user,
      iob,
      startIob: iob
    };
    await fetch.post(url, data);
  }

  async addCOB(cob, user) {
    let userId = localStorage.getItem("localId");
    let url = `${config.baseUrl}/treatments/${userId}/cob.json?auth=${config.firebase_token}`;
    let data = {
      createdAt: Math.floor(Date.now()),
      user,
      cob,
      startCob: cob
    };
    await fetch.post(url, data);
  }

  /**
   * Sum up the total treatments
   */
  async getTotalTreatments() {
    let iob = await this.getIOB();
    let totalIob = 0;
    let totalIobTwo = 0;
    if (iob) {
      iob = Object.values(iob);
      iob.forEach(value => {
        if (value.user == 1) {
          totalIob += value.iob;
        } else if (value.user == 2) {
          totalIobTwo += value.iob;
        }
      });
    }

    let cob = await this.getCOB();
    let totalCob = 0;
    let totalCobTwo = 0;
    if (cob) {
      cob = Object.values(cob);
      cob.forEach(value => {
        if (value.user == 1) {
          totalCob += value.cob;
        } else if (value.user == 2) {
          totalCobTwo += value.cob;
        }
      });
    }

    return {
      userOne: {
        iob: Math.ceil(totalIob * 100) / 100,
        cob: Math.ceil(totalCob * 100) / 100
      },
      userTwo: {
        iob: Math.ceil(totalIobTwo * 100) / 100,
        cob: Math.ceil(totalCobTwo * 100) / 100
      }
    };
  }

  // Getters
  async getIOB() {
    let userId = localStorage.getItem("localId");
    let url = `${config.baseUrl}/treatments/${userId}/iob.json?auth=${config.firebase_token}`;
    return await fetch.get(url);
  }
  async getCOB() {
    let userId = localStorage.getItem("localId");
    let url = `${config.baseUrl}/treatments/${userId}/cob.json?auth=${config.firebase_token}`;
    return await fetch.get(url);
  }

  updateTreatments = async settings => {
    logs.add("[Treatments] Updating treatments.");
    //iob
    let iob = await this.getIOB();
    console.log(iob);
    logs.add("[Treatments] Computing IOB");
    if (iob) {
      let iobKeys = Object.keys(iob);
      iob = Object.values(iob);
      iob.forEach(async (entry, index) => {
        let key = iobKeys[index];
        let userId = localStorage.getItem("localId");
        let url = `${config.baseUrl}/treatments/${userId}/iob/${key}.json?auth=${config.firebase_token}`;
        entry = algorithms.updateIOB(entry, settings);
        if (predictions.checkForOldTreatment(entry)) {
          logs.add(`[Treatments] Old treatment remove #${index}`);
          // Delete treatment if its 0
          // iobRef.remove();
          await fetch.delete(url);
        } else {
          logs.add(`[Treatments] update decayed treatment #${index}`);
          await fetch.put(url, entry);
        }
      });
    }

    // cob
    let cob = await this.getCOB();
    logs.add("[Treatments] Computing COB.");
    if (cob) {
      let cobKeys = Object.keys(cob);
      cob = Object.values(cob);
      cob.forEach(async (entry, index) => {
        let key = cobKeys[index];
        let userId = localStorage.getItem("localId");
        let url = `${config.baseUrl}/treatments/${userId}/cob/${key}.json?auth=${config.firebase_token}`;
        entry = algorithms.updateIOB(entry, settings);
        if (predictions.checkForOldTreatment(entry)) {
          logs.add(`[Treatments] Old treatment remove #${index}`);
          // Delete treatment if its 0
          // iobRef.remove();
          await fetch.delete(url);
        } else {
          logs.add(`[Treatments] update decayed treatment #${index}`);
          await fetch.put(url, entry);
        }
      });
    }
  };
}
