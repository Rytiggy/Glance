import { localStorage } from "local-storage";
import Settings from "./settings.js";
let settings = new Settings();
var store = settings.get();

import * as algorithms from "../../resources/algorithms.js";

// INSULIN ON BOARD
export let addIOB = (iob, user) => {
  let treatments = getIOB();
  console.log(treatments);
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
  console.log(treatments);
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
  //iob
  let iob = JSON.parse(getIOB());
  if (iob) {
    iob.forEach((entry, index) => {
      // update treatment IOB / COB based on algorithm
      // update IOB
      algorithms.updateIOB(entry, store);
      if (checkForOldTreatment(entry)) {
        // Delete treatment if its 0
        iob.splice(index, 1);
      }
    });
    iob = JSON.stringify(iob);
    localStorage.setItem("iob", iob);
  }

  // cob
  let cob = JSON.parse(getCOB());
  if (cob) {
    cob.forEach((entry, index) => {
      // update treatment COB based on algorithm
      console.log(entry.cob);
      algorithms.updateCOB(entry, store);
      console.log(entry.cob);

      if (checkForOldTreatment(entry)) {
        // Delete treatment if its 0
        cob.splice(index, 1);
      }
    });
    cob = JSON.stringify(cob);
    localStorage.setItem("cob", cob);
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
  return {
    userOne: {
      iob: totalIob,
      cob: totalCob
    },
    userTwo: {
      iob: totalIobTwo,
      cob: totalCobTwo
    }
  };
};

// helpers
/**
 * Check if a treatments value is == to 0
 * @returns {boolean} if we should remove the treatment because its old
 */
function checkForOldTreatment(treatment) {
  if (treatment.iob) {
    console.log(treatment.createdAt);
    let dia_ms = parseFloat(store.dia) * 3600000;
    if (Date.now() >= treatment.createdAt + dia_ms) {
      return true;
    }
  }
  if (treatment.cob) {
    if (treatment.cob <= 0) {
      return true;
    }
  }
  return false;
}
