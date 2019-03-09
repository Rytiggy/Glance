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




import { charger, battery } from "power";

export default class batteryLevels { 
  get() {
    console.log('app - batteryLevels - get()')
    let percent = Math.floor(battery.chargeLevel)
    let level = .3 * percent;
    let color = '#75bd78';
    if(percent <= 30 && percent >= 15) {
      color = 'orange';
    } else if( percent <= 15) {
      color = 'red';
    }
    return {
      percent: percent,
      level: level,
      color: color,
    }
  }
};