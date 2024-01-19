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
import Logs from "./logs.js";
const logs = new Logs();

const applicationId = "d8665ade-9673-4e27-9ff6-92db4ce13d13";
export default class dexcom {
  async login(dexcomUsername, dexcomPassword, subDomain) {
    let body = {
      accountName: dexcomUsername,
      applicationId: applicationId,
      password: dexcomPassword,
    };
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
        return response.json();
      })
      .catch((e) => {
        return e;
      });
    console.log("Debug 3 accountId", data.Code);
    if (!data?.Code) {
      return {
        accountId: data.replace(/['"]+/g, ""),
      };
    } else {
      return Promise.reject(data)
    }
  }

  async getSessionId(dexcomUsername, dexcomPassword, subDomain) {
    // TODO: add failure logic
    let accountId = await this.login(dexcomUsername, dexcomPassword, subDomain)
      .then((res) => {
        console.log("Debug: 4", res);
        return res.accountId
      })
      .catch((e) => {
        console.error("Debug: 4", e);
        return Promise.reject(e)
      });
    let body = {
      password: dexcomPassword,
      applicationId: applicationId,
      accountId: accountId,
    };
    console.log("Debug: accountId", accountId);
    console.log(applicationId, dexcomPassword);
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
      .catch((e) => console.error("dexcom error", e));

    console.log(sessionId);
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
        return data;
      })
      .catch((e) => console.error(e));
  }
}
