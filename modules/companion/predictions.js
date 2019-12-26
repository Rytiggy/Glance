import { localStorage } from "local-storage";

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
    iob
  };
  treatments.push(treatment);
  treatments = JSON.stringify(treatments);
  localStorage.setItem("iob", treatments);
};

export let getIOB = () => {
  return localStorage.getItem("iob");
};

// CARBS ON BOARD
export let addCOB = value => {
  let treatments = getCOB();
  console.log(treatments);
  if (!treatments) {
    treatments = [];
  } else {
    treatments = JSON.parse(treatments);
  }
  let treatment = {
    createdAt: Math.floor(Date.now()),
    user,
    cob
  };
  treatments.push(treatment);
  treatments = JSON.stringify(treatments);
  localStorage.setItem("cob", treatments);
};

export let getCOB = () => {
  return localStorage.getItem("cob");
};

export let checkTreatments = () => {
  let iob = JSON.parse(getIOB());
  console.log(iob);
  if (iob) {
    iob.forEach((entry, index) => {
      if (checkForOldTreatment(entry.iob)) {
        // Delete treatment if its 0
        iob.splice(index, 1);
      } else {
        // update treatment IOB / COB based on algorithm
      }
    });
  }
  let cob = JSON.parse(getCOB());
  console.log(cob);
  if (cob) {
    cob.forEach((entry, index) => {
      if (checkForOldTreatment(entry.cob)) {
        // Delete treatment if its 0
        cob.splice(index, 1);
      } else {
        // update treatment COB based on algorithm
      }
    });
  }
};

// helpers
/**
 * Check if a treatments value is == to 0
 * @returns {boolean} if we should remove the treatment because its old
 */
function checkForOldTreatment(treatment) {
  if (treatment <= 0) {
    return true;
  }
  return false;
}
