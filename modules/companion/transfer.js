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
 // This module handles all messaging protocols
import { outbox } from "file-transfer";
import { encode } from 'cbor';
import * as messaging from "messaging";

export default class transfer { 
  // Send data to the watchface
  send(data) {
   logs.add('Line 19: companion - transfer - send()')
   outbox.enqueue("responce2.json", encode(data));
  }
};
