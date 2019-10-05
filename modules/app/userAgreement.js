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
import document from "document";
import Transfer from "./transfer.js";

let transfer = new Transfer();

export default class userAgreement {
  // Send data
  check(data) {
    const agreeToPrompt = document.getElementById("agreeToUserAgreement");

    agreeToPrompt.onclick = function(evt) {
      document.getElementById("userAgreement").style.display = "none";
      let dataToSend = {
        command: "agreedToUserAgreement",
        data: {
          userAgreement: true
        }
      };
      transfer.send(dataToSend);
      // hasAgreed = true;
    };

    return data.settings.userAgreement;
  }
}
