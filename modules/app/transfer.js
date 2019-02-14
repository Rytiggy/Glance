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



// Import the messaging module
import asap from "fitbit-asap/app"

asap.ondebug = (msg) => {
	console.log('--- FITBIT ASAP---', msg);
}

export default class transfer {
	// Send data
	send(data) {
		console.log('app - transfer - send')
		// Send a command to the companion
		asap.send({
			command: 'forceCompanionTransfer',
			data: data,
		});

	}
};


// Events

// // Listen for the onopen event
// messaging.peerSocket.onopen = function() {
//   // Fetch weather when the connection opens
//   fetchWeather();
// }

// Listen for messages from the companion
// messaging.peerSocket.onmessage = function(evt) {
//   if (evt.data) {
//   console.log("The temperature is: " + evt.data.temperature);
//   }
// }

// // Listen for the onerror event
// messaging.peerSocket.onerror = function(err) {
//   // Handle any errors
//   console.log("Connection error: " + err.code + " - " + err.message);
// }