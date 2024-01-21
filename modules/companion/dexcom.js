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
import { localStorage } from "local-storage";

import Logs from "./logs.js";
const logs = new Logs();
const errorThreshold = 5;
let errors = 0
let timeout = localStorage.getItem("timeout")

const applicationId = "d8665ade-9673-4e27-9ff6-92db4ce13d13";
export default class dexcom {
  async login(dexcomUsername, dexcomPassword, subDomain) {
    timeout = localStorage.getItem("timeout")

    let body = {
      accountName: dexcomUsername,
      applicationId: applicationId,
      password: dexcomPassword,
    };
    if (timeout === null) {
      let data = await fetch(
        `https://${subDomain}.dexcom.com/ShareWebServices/Services/General/AuthenticatePublisherAccount`,
        {
          body: JSON.stringify(body),
          json: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "cache-control": "no-cache",
            agent: "Glance",
          },
          method: "post",
          rejectUnauthorized: false,
        }
      )
        .then(function (response) {
          if (response.status === 200) {
            errors = 0;
            return response.json();
          } else {
            // Adds a throttle on API calls to if PW or UN or wrong or API is down / having issues
            if (errors >= errorThreshold) {
              timeout = Date.now()
              localStorage.setItem("timeout", timeout);
            }
            errors++
            // Throw api Error
            throw response.json();
          }
        })
        .catch((e) => {
          console.error(e)
          return e;
        });
      if (!data?.Code) {
        return {
          accountId: data.replace(/['"]+/g, ""),
        };
      } else {
        return Promise.reject(data)
      }
    } else {
      let now = Date.now()
      let FIVE_MIN = 5 * 60 * 1000;
      if ((now - timeout) > FIVE_MIN) {
        // Reset stuff to allow API requests again
        timeout = null
        localStorage.removeItem("timeout")
        errors = 0
        throw { Code: "429", Message: "Retrying soon" }
      } else {
        const waitTimeMs = FIVE_MIN - (now - timeout);
        const min = Math.floor((waitTimeMs / 1000 / 60) << 0)
        const sec = Math.floor((waitTimeMs / 1000) % 60);
        throw { Code: "429", Message: "Server Error W8-" + min + ':' + sec }
      }
    }

  }

  async getSessionId(dexcomUsername, dexcomPassword, subDomain) {
    let accountId = await this.login(dexcomUsername, dexcomPassword, subDomain)
      .then((res) => {
        return res.accountId
      })
      .catch((e) => {
        throw e
      });

    let body = {
      password: dexcomPassword,
      applicationId: applicationId,
      accountId: accountId,
    };

    let url = `https://${subDomain}.dexcom.com/ShareWebServices/Services/General/LoginPublisherAccountById`;
    let sessionId = await fetch(url, {
      body: JSON.stringify(body),
      json: true,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "cache-control": "no-cache",
        agent: "Glance",
      },
      method: "post",
      rejectUnauthorized: false,
    })
      .then(function (response) {
        return response.text();
      })
      .then(function (data) {
        return data;
      })
      .catch((e) => { throw e });
    return sessionId;
  }

  async getData(sessionId, subDomain) {
    let url =
      `https://${subDomain}.dexcom.com/ShareWebServices/Services/Publisher/ReadPublisherLatestGlucoseValues?sessionId=${sessionId}&minutes=1440&maxCount=47`.replace(
        /"/g,
        ""
      );
    return await fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "cache-control": "no-cache",
        agent: "Glance",
      },
      method: "post",
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        if (data.length > 0) {
          return data;
        } else {
          throw { Code: "ND", Message: "Logged in: No Data from API" }
        }
      })

  }
}
