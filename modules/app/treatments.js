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
import { vibration } from "haptics";

let treatmentsScreen = document.getElementById("treatmentsScreen");
let reviewTreatment = document.getElementById("reviewTreatment");
let cancelReviewTreatment = document.getElementById("cancelReviewTreatment");

let submitTreatment = document.getElementById("submitTreatment");
let cancelSubmitTreatment = document.getElementById("cancelSubmitTreatment");

let treatmentIobBtnSubtract = document.getElementById(
  "treatmentIobBtnSubtract"
);
let treatmentIobBtnPlus = document.getElementById("treatmentIobBtnPlus");
let treatmentIob = document.getElementById("treatmentIob");

let treatmentCobBtnSubtract = document.getElementById(
  "treatmentCobBtnSubtract"
);
let treatmentCobBtnPlus = document.getElementById("treatmentCobBtnPlus");
let treatmentCob = document.getElementById("treatmentCob");
let treatmentReview = document.getElementById("treatmentReview");
let treatmentReviewText = document.getElementById("treatmentReviewText");
let btnUser1 = document.getElementById("btn-user1");
let btnUser2 = document.getElementById("btn-user2");
let actionsContainer = document.getElementById("actions");
let homeContainer = document.getElementById("home");

export default class treatments {
  init(transfer, settings) {
    if (settings.numOfDataSources == 2) {
      if (settings.dataSource == "nightscout" && settings.treatmentUrl) {
        btnUser1.value = 1;
        btnUser1.style.display = "inline";
      } else {
        btnUser1.style.display = "none";
      }
      if (settings.dataSourceTwo == "nightscout" && settings.treatmentUrlTwo) {
        btnUser2.value = 1;
        btnUser2.style.display = "inline";
      } else {
        btnUser2.style.display = "none";
      }
    } else {
      btnUser1.style.display = "none";
      btnUser2.style.display = "none";
    }

    reviewTreatment.onclick = evt => {
      console.log("review Treatment");
      vibration.start("bump");

      treatmentReviewText.text = `Log ${treatmentIob.text} IOB and ${treatmentCob.text} COB.`;
      treatmentReview.style.display = "inline";
    };

    submitTreatment.onclick = evt => {
      console.log("submit Treatment");
      vibration.start("bump");
      let user = 1;
      if (btnUser1.value == 1) {
        user = 1;
      } else {
        user = 2;
      }
      transfer.send({
        command: "postTreatment",
        data: {
          carbs: parseFloat(treatmentCob.text),
          insulin: parseFloat(treatmentIob.text),
          user: user
        }
      });
      actionsContainer.style.display = "none";
      treatmentReview.style.display = "none";
      treatmentsScreen.style.display = "none";
      homeContainer.style.display = "inline";

      treatmentIob.text = 0;
      treatmentCob.text = 0;
    };

    cancelReviewTreatment.onclick = evt => {
      console.log("cancel review Treatment");
      vibration.start("bump");
      actionsContainer.style.display = "none";
      homeContainer.style.display = "inline";
      treatmentReview.style.display = "none";
      treatmentsScreen.style.display = "none";
      treatmentIob.text = 0;
      treatmentCob.text = 0;
    };

    cancelSubmitTreatment.onclick = evt => {
      console.log("cancel submit Treatment");
      vibration.start("bump");
      actionsContainer.style.display = "none";
      homeContainer.style.display = "inline";
      treatmentReview.style.display = "none";
      treatmentsScreen.style.display = "none";
      treatmentIob.text = 0;
      treatmentCob.text = 0;
    };

    treatmentIobBtnSubtract.onclick = evt => {
      vibration.start("bump");
      let value = parseFloat(treatmentIob.text) - 0.25;
      if (value < 0) {
        value = 0;
      }
      treatmentIob.text = value;
    };
    treatmentIobBtnPlus.onclick = evt => {
      vibration.start("bump");
      treatmentIob.text = parseFloat(treatmentIob.text) + 1;
    };

    treatmentCobBtnSubtract.onclick = evt => {
      vibration.start("bump");
      let value = parseInt(treatmentCob.text) - 1;
      if (value < 0) {
        value = 0;
      }
      treatmentCob.text = value;
    };
    treatmentCobBtnPlus.onclick = evt => {
      vibration.start("bump");
      treatmentCob.text = parseInt(treatmentCob.text) + 5;
    };
  }
}
