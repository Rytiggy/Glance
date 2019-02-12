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


export default class messaging {
  //Fetch data from an API endpoint and return a promise
  async get(url) {
    const trimmedURL = url.replace(/ /g,"");
    logs.add('Line 16: companion - fetch - get() ' + trimmedURL)
    return await fetch(trimmedURL)
      .then(handleResponse)
      .then((data) => {
        logs.add(`Line 28: companion - fetch - get() Data Okay return`)
        return data;
      }).catch((error) => {
        // not found
        if(!error.status) {
          error.status = '404'
        }
        logs.add(`Line 35 ERROR companion - fetch - get() ${JSON.stringify(error)}`)
        let errorMsg = {
          text: 'Line 38: Error with companion - fetch - get()',
          error: error,
          url: trimmedURL,
        }
        return errorMsg;
      });
  };
};

function handleResponse (response) {
  let contentType = response.headers.get('content-type')
  if (contentType.includes('application/json')) {
    return handleJSONResponse(response)
  } else if (contentType.includes('text/html')) {
    return handleTextResponse(response)
  } else {
    // Other response types as necessary. I haven't found a need for them yet though.
    throw new Error(`Sorry, content-type ${contentType} not supported`)
  }
}

function handleJSONResponse (response) {
  return response.json()
    .then(json => {
      // console.error(JSON.stringify(json))

      if (response.ok) {
         logs.add(`Line 83 companion - fetch - handleJSONResponse() response.ok`)
        return json
      } else {
        return Promise.reject(Object.assign({}, json, {
          status: response.status,
          statusText: response.statusText
        }))
      }
    })
}
// This doesnt work
function handleTextResponse (response) {
  return response.text()
    .then(text => {
      if (response.ok) {
        logs.add(`Line 98 companion - fetch - handleTextResponse() response.ok`)
        return JSON.parse(text)
      } else {
        return Promise.reject({
          status: response.status,
          statusText: response.statusText,
          err: text
        })
      }
    })
  }