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



import { geolocation } from "geolocation";

export default class weather {
  async get(tempType) {
    console.log('companion - weather - get()')
    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;
    let query = 'select item.condition from weather.forecast where woeid in (SELECT woeid FROM geo.places WHERE text="('+ latitude + "," +longitude+')") and u="'+tempType+'"';
    let endPointURL = "https://query.yahooapis.com/v1/public/yql?q=" +escape(query)  + "&format=json";    
    return endPointURL;  
  };
};


function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    geolocation.getCurrentPosition(resolve, reject, options);
  });
};