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
import asap from 'fitbit-asap/companion';
import sizeof from 'object-sizeof';
import { peerSocket } from "messaging";

export default class transfer {
	// Send data to the watchface
	send(data) {
		let dataSize = sizeof(data);
		let maxSize = peerSocket.MAX_MESSAGE_SIZE;
		logs.add('Line 19: companion - transfer - send()')
		if (dataSize <= maxSize) {
			logs.add(` --> Data size is ${dataSize} / ${maxSize}, Sending through asap messaging.`);
			asap.send({
				command: "file",
				data: data
			});
		} else {
			logs.add(` --> Data size is ${dataSize} / ${maxSize}, Sending through file transfer.`);
			outbox.enqueue("payload.json", encode(data));
		}
	}
}