import document from "document";
import { vibration } from "haptics";
/**
 * Init the actions page
 * @param {notsure} transfer module used for sending data back to the phone
 */
export let init = (transfer, singleOrMultipleDispaly, settings) => {
  let logTreatmentBtn = document.getElementById("logTreatmentBtn");
  let actionsContainer = document.getElementById("actions");
  let homeContainer = document.getElementById("home");

  let arrowsEle = "arrows";
  if (settings.numOfDataSources == 3) {
    // if its the large display
    arrowsEle = "largeArrows";
  }

  if (settings.allowUserTwoTreatments || settings.localTreatments) {
    logTreatmentBtn.style.display = "inline";
  } else {
    logTreatmentBtn.style.display = "none";
  }
  /**
   * Try to refresh the data
   */
  let refreshData = document.getElementById("refreshDataBtn");
  refreshData.onclick = evt => {
    console.log("Refresh data");
    var dataToSend = {
      command: "refreshData"
    };
    transfer.send(dataToSend);
    vibration.start("bump");
    actionsContainer.style.display = "none";
    homeContainer.style.display = "inline";

    const BloodSugarDisplayContainer = singleOrMultipleDispaly.getElementsByClassName(
      "bloodSugarDisplay"
    );
    BloodSugarDisplayContainer.forEach((container, index) => {
      container.getElementById(arrowsEle).href =
        "../resources/img/arrows/loading.png";
    });
  };

  /**
   * Go to Action
   */
  let goToActions = singleOrMultipleDispaly.getElementById("goToActions");
  goToActions.onclick = evt => {
    vibration.start("bump");
    actionsContainer.style.display = "inline";
    homeContainer.style.display = "none";
  };

  /**
   * Go Home on click
   */
  let goHome = document.getElementById("goHomeBtn");
  goHome.onclick = evt => {
    console.log("goHome");
    vibration.start("bump");
    actionsContainer.style.display = "none";
    homeContainer.style.display = "inline";
  };

  /**
   * Go Home on click
   */
  let treatmentsScreen = document.getElementById("treatmentsScreen");
  logTreatmentBtn.onclick = evt => {
    console.log("logTreatment");
    treatmentsScreen.style.display = "inline";
    vibration.start("bump");
  };
};
