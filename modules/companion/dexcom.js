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

export default class dexcom {
  
  async getSessionId(dexcomUsername, dexcomPassword, subDomain) {
    console.error(dexcomUsername, dexcomPassword, subDomain);
    let body =   {
      accountName : dexcomUsername,
      applicationId :"d8665ade-9673-4e27-9ff6-92db4ce13d13",
      password : dexcomPassword
    }
    return await fetch(`https://${subDomain}.dexcom.com/ShareWebServices/Services/General/LoginPublisherAccountByName`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'post',
      body: JSON.stringify(body)
    }).then(function(response) {
      console.log(response)
      return response.text();
    }).then(function(data) {
      return data;
    })
    
  }
  
  async getData(sessionId, subDomain) {
    let url = (`https://${subDomain}.dexcom.com/ShareWebServices/Services/Publisher/ReadPublisherLatestGlucoseValues?sessionId=${sessionId}&minutes=1440&maxCount=47`.replace(/"/g, ""));
    return await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'post',
    }).then(function(response) {
      return response.json();
    }).then(function(data) {
      console.log(data)
      return data;
    });
  }

};

