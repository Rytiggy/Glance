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
import * as logs from "./logs.js";

export default class dexcom {
  async getSessionId(dexcomUsername, dexcomPassword, subDomain) {
    let body = {
      accountName: dexcomUsername,
      applicationId: "d8665ade-9673-4e27-9ff6-92db4ce13d13",
      password: dexcomPassword
    };
    return await fetch(
      `https://${subDomain}.dexcom.com/ShareWebServices/Services/General/LoginPublisherAccountByName`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        method: "post",
        body: JSON.stringify(body)
      }
    )
      .then(function(response) {
        return response.text();
      })
      .then(function(data) {
        return data;
      })
      .catch(error => {
        logs.add(error);
      });
  }

  async getData(sessionId, subDomain) {
    let url = `https://${subDomain}.dexcom.com/ShareWebServices/Services/Publisher/ReadPublisherLatestGlucoseValues?sessionId=${sessionId}&minutes=1440&maxCount=47`.replace(
      /"/g,
      ""
    );
    return await fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      method: "post"
    })
      .then(handleResponse)
      .then(function(data) {
        return data;
      })
      .catch(error => {
        logs.add(error);
        // not found
        if (!error.status) {
          error.status = "404";
        }
        let errorMsg = {
          text: "Error with companion - fetch - get()",
          error: error
        };
        return errorMsg;
      });
  }
}

// Helper functions
function handleResponse(response) {
  let contentType = response.headers.get("content-type");
  if (contentType.includes("application/json")) {
    return handleJSONResponse(response);
  } else if (contentType.includes("text/html")) {
    return handleTextResponse(response);
  } else {
    // Other response types as necessary. I haven't found a need for them yet though.
    throw new Error(`Sorry, content-type ${contentType} not supported`);
  }
}

function handleJSONResponse(response) {
  return response.json().then(json => {
    if (response.ok) {
      return json;
    } else {
      return Promise.reject(
        Object.assign({}, json, {
          status: response.status,
          statusText: response.statusText
        })
      );
    }
  });
}
// This doesnt work
function handleTextResponse(response) {
  return response.text().then(text => {
    if (response.ok) {
      return JSON.parse(text);
    } else {
      return Promise.reject({
        status: response.status,
        statusText: response.statusText,
        err: text
      });
    }
  });
}
