import document from "document";
import Transfer from "../../modules/app/transfer.js";
let transfer = new Transfer();

let views;

export function init(_views, data) {
  views = _views;
  console.log("userAgreement init()");
  mounted(data);
}

/**
 * When this view is mounted, setup elements and events.
 */
function mounted(data) {
  let agreeToUserAgreement = document.getElementById("agreeToUserAgreement");
  agreeToUserAgreement.addEventListener("click", clickHandler(data));
}

/**
 * Sample button click with navigation.
 */
function clickHandler(data) {
  console.log("userAgreement Button Clicked!");
  let dataToSend = {
    command: "agreedToUserAgreement",
    data: {
      userAgreement: true
    }
  };
  transfer.send(dataToSend);
  /* Navigate to another screen */
  views.navigate("smallBG", data);
}
