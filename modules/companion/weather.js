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
    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;
    return `https://api.openweathermap.org/data/2.5/forecast/hourly?lat=${latitude}&lon=${longitude}&appid=070d27a069823ebe69e5246f91d6f301`;
    // return `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=070d27a069823ebe69e5246f91d6f301`;
  }
}

function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    geolocation.getCurrentPosition(resolve, reject, options);
  });
}
