import { settingsStorage } from "settings";
import { me as companion } from "companion";
import { localStorage } from "local-storage";
import { device } from "peer";
import Fetch from "./fetch.js";
const fetch = new Fetch();
import config from "../../resources/config.js";
import * as logs from "./logs.js";

import firebase from "firebase";
import "firebase/database";

import * as predictions from "./predictions.js";
import * as algorithms from "../../resources/algorithms.js";

export default class database {
  constructor() {
    // Initialize firebase from settings
    firebase.initializeApp(config.firebaseConfig);
    this.database = firebase.database();
  }
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
    console.log("[Login] Trying to login Glance user.");
    if (email.length > 0 || password.length > 0) {
      await firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(response => {
          // console.log(response);
          settingsStorage.setItem(
            "status",
            JSON.stringify({ name: "connected" })
          );
          console.log("[Login] Connected");
        })
        .catch(async error => {
          settingsStorage.setItem(
            "status",
            JSON.stringify({ name: error.message })
          );
          await firebase.auth().signOut();
          console.warn(`[Login] ${error.message}`);
        });
    } else {
      console.warn(`[Login] No email or password.`);
      settingsStorage.setItem("status", JSON.stringify({ name: "" }));
      await firebase.auth().signOut();
    }
  }

  async register(email, password, passwordTwo) {
    if (email.length > 0 && password.length > 0 && password == passwordTwo) {
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(response => {
          settingsStorage.setItem(
            "registerStatus",
            JSON.stringify({ name: "Successfully created Glance account." })
          );
        })
        .catch(function(error) {
          // Handle Errors here.
          settingsStorage.setItem(
            "registerStatus",
            JSON.stringify({ name: error.message })
          );
        });
    } else {
      settingsStorage.setItem(
        "registerStatus",
        JSON.stringify({ name: "Passwords do not match!" })
      );
    }
  }

  async isLoggedIn() {
    var user;

    await firebase.auth().onAuthStateChanged(function(u) {
      if (u) {
        console.log("[Login Check] User is logged in...");
        user = true;
        // User is signed in.
      } else {
        console.log("[Login Check] No user found...");
        user = false;
        // No user is signed in.
      }
    });
    return user;
  }
  // Setters
  async addIOB(iob, user) {
    var userId = firebase.auth().currentUser.uid;
    var userRef = this.database.ref(`treatments/${userId}`);
    var iobRef = userRef.child("iob");
    iobRef.push().set({
      createdAt: Math.floor(Date.now()),
      user,
      iob,
      startIob: iob
    });
  }
  async addCOB(cob, user) {
    var userId = firebase.auth().currentUser.uid;
    var userRef = this.database.ref(`treatments/${userId}`);
    var cobRef = userRef.child("cob");
    cobRef.push().set({
      createdAt: Math.floor(Date.now()),
      user,
      cob,
      startCob: cob
    });
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

    // TODO: round to 2nd place here
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
    var userId = firebase.auth().currentUser.uid;
    return await this.database
      .ref(`treatments/${userId}/iob`)
      .once("value")
      .then(function(snapshot) {
        var userIOB = snapshot.val();
        return userIOB;
      });
  }
  async getCOB() {
    var userId = firebase.auth().currentUser.uid;
    return await this.database
      .ref(`treatments/${userId}/cob`)
      .once("value")
      .then(function(snapshot) {
        var userCOB = snapshot.val();
        return userCOB;
        //(snapshot.val() && snapshot.val().username) || 'Anonymous';
        // ...
      });
  }

  updateTreatments = async settings => {
    console.log("[Treatments] Updating treatments.");
    var userId = firebase.auth().currentUser.uid;

    //iob
    let iob = await this.getIOB();
    console.log("[Treatments] Computing IOB");
    if (iob) {
      let iobKeys = Object.keys(iob);
      iob = Object.values(iob);
      iob.forEach((entry, index) => {
        // update treatment IOB / COB based on algorithm
        // update IOB
        entry = algorithms.updateIOB(entry, settings);
        var userRef = this.database.ref(`treatments/${userId}/iob`);
        var iobRef = userRef.child(iobKeys[index]);
        if (predictions.checkForOldTreatment(entry)) {
          console.log(`[Treatments] Old treatment remove #${index}`);
          // Delete treatment if its 0
          iobRef.remove();
        } else {
          console.log(`[Treatments] update decayed treatment #${index}`);
          iobRef.set(entry);
        }
      });
    }

    // cob
    let cob = await this.getCOB();
    console.log("[Treatments] Computing COB.");
    if (cob) {
      let cobKeys = Object.keys(cob);
      cob = Object.values(cob);
      cob.forEach((entry, index) => {
        // update treatment COB based on algorithm
        entry = algorithms.updateCOB(entry, settings);
        var cobRef = this.database.ref(
          `treatments/${userId}/cob/${cobKeys[index]}`
        );
        if (predictions.checkForOldTreatment(entry)) {
          console.log(`[Treatments] Old treatment remove #${index}`);
          // Delete treatment if its 0
          cobRef.remove();
        } else {
          console.log(`[Treatments] update decayed treatment #${index}`);
          cobRef.set(entry);
        }
      });
    }
  };
}
