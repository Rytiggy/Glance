import { localStorage } from "local-storage";
import Settings from "./settings.js";
let settings = new Settings();
var store = settings.get();
import * as logs from "./logs.js";

import * as algorithms from "../../resources/algorithms.js";

// INSULIN ON BOARD
export let addIOB = (iob, user) => {
  let treatments = getIOB();
  logs.add(`[Treatments] ${treatments}`);
  if (!treatments) {
    treatments = [];
  } else {
    treatments = JSON.parse(treatments);
  }
  let treatment = {
    createdAt: Math.floor(Date.now()),
    user,
    iob,
    startIob: iob
  };
  treatments.push(treatment);
  treatments = JSON.stringify(treatments);
  localStorage.setItem("iob", treatments);
};

export let getIOB = () => {
  return localStorage.getItem("iob");
};

// CARBS ON BOARD
export let addCOB = (cob, user) => {
  let treatments = getCOB();
  logs.add(`[Treatments] ${treatments}`);
  if (!treatments) {
    treatments = [];
  } else {
    treatments = JSON.parse(treatments);
  }
  let treatment = {
    createdAt: Date.now(),
    user,
    cob,
    startCob: cob
  };
  treatments.push(treatment);
  treatments = JSON.stringify(treatments);
  localStorage.setItem("cob", treatments);
};

export let getCOB = () => {
  return localStorage.getItem("cob");
};

export let updateTreatments = () => {
  logs.add("[Treatments] Updating treatments.");
  //iob
  let iob = JSON.parse(getIOB());
  if (iob) {
    logs.add("[Treatments] computing iob");
    iob.forEach((entry, index) => {
      // update treatment IOB / COB based on algorithm
      // update IOB
      algorithms.updateIOB(entry, store);
      if (checkForOldTreatment(entry)) {
        // Delete treatment if its 0
        iob.splice(index, 1);
        logs.add(`[Treatments] Old treatment remove #${index}`);
      }
    });
    iob = JSON.stringify(iob);
    logs.add(`[Treatments] update decayed treatments`);
    localStorage.setItem("iob", iob);
  }

  // cob
  let cob = JSON.parse(getCOB());
  if (cob) {
    cob.forEach((entry, index) => {
      // update treatment COB based on algorithm
      logs.add(entry.cob);
      algorithms.updateCOB(entry, store);

      if (checkForOldTreatment(entry)) {
        // Delete treatment if its 0
        cob.splice(index, 1);
        logs.add(`[Treatments] Old treatment remove #${index}`);
      }
    });
    cob = JSON.stringify(cob);
    localStorage.setItem("cob", cob);
    logs.add(`[Treatments] update decayed treatment`);
  }
};

/**
 * Sum up the total treatments
 */
export let getTotalTreatments = () => {
  let iob = JSON.parse(getIOB());
  let totalIob = 0;
  let totalIobTwo = 0;
  if (iob) {
    iob.forEach(value => {
      if (value.user == 1) {
        totalIob += value.iob;
      } else if (value.user == 2) {
        totalIobTwo += value.iob;
      }
    });
  }

  let cob = JSON.parse(getCOB());
  let totalCob = 0;
  let totalCobTwo = 0;
  if (cob) {
    cob.forEach(value => {
      if (value.user == 1) {
        totalCob += value.cob;
      } else if (value.user == 2) {
        totalCobTwo += value.cob;
      }
    });
  }

  // TODO: round to 2nd place here
  return {
    userOne: {
      iob: Math.ceil(totalIob * 100) / 100,
      cob: Math.ceil(totalCob * 100) / 100
    },
    userTwo: {
      iob: Math.ceil(totalIobTwo * 100) / 100,
      cob: Math.ceil(totalCobTwo * 100) / 100
    }
  };
};

// helpers
/**
 * Check if a treatments value is == to 0
 * @returns {boolean} if we should remove the treatment because its old
 */
export let checkForOldTreatment = treatment => {
  store = settings.get();
  if (typeof treatment.iob !== "undefined") {
    logs.add("[Predictions] Checking for old IOB.");
    let dia_ms = parseFloat(store.dia) * 3600000;
    if (treatment.iob <= 0 || Date.now() >= treatment.createdAt + dia_ms) {
      logs.add("[Predictions] Found old IOB");
      return true;
    }
  }
  if (typeof treatment.cob !== "undefined") {
    logs.add("[Predictions] Checking for old COB.");
    if (treatment.cob <= 0) {
      logs.add("[Predictions] Found old COB");
      return true;
    }
  }
  logs.add("[Predictions] Active treatment.");
  return false;
};
