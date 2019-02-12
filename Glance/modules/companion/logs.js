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



import { settingsStorage } from "settings";
import Sizeof from "./sizeof.js";

const sizeof = new Sizeof();

export default class logs {
  add(value) {
    console.log(value)
    let d = new Date(); 
    // console.error(sizeof.size(settingsStorage.getItem('logs')))
    if (settingsStorage.getItem('logs') && sizeof.size(settingsStorage.getItem('logs'))  > 130000) {
      settingsStorage.setItem('logs', JSON.stringify({"name":''}));   
    }

    if( settingsStorage.getItem('logs') && JSON.parse(settingsStorage.getItem('logs')).name ) {
      settingsStorage.setItem('logs', JSON.stringify({"name":( `${ d.getHours() } : ${ d.getMinutes() } ${ value } |,| ${JSON.parse(settingsStorage.getItem('logs')).name}`)}));   
    } else {// if there are no logs
      settingsStorage.setItem('logs', JSON.stringify({'name':( `${ d.getHours() } : ${ d.getMinutes() } ${ value } `)}));   
    }
  }
};
 