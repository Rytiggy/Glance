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

export default class bloodline {
  update(user, high, low, settings, graphContainer) {
    let bloodsugars = user.bgs;
    let predictedBloodsugars = user.predicted;

    graphContainer.style.display = "inline";
    const highNumber = graphContainer.getElementById("high");
    const lowNumber = graphContainer.getElementById("low");
    const highLine = graphContainer.getElementById("highLine");
    const meanLine = graphContainer.getElementById("meanLine");
    const lowLine = graphContainer.getElementById("lowLine");
    const graphPoints = graphContainer
      .getElementsByClassName("graphPoints")
      .reverse();
    let isMmol = settings.glucoseUnits === "mmol";
    let ymin = low;
    let ymax = high;
    let height = 100;

    let sgvArray = bloodsugars.filter(bg => bg !== "LOS");
    const currentHighestBg = Math.max(...sgvArray);
    const currentLowBg = Math.min(...sgvArray);
    if (currentHighestBg >= 400) {
      ymax = 340;
    }
    if (currentHighestBg >= 350 && currentHighestBg < 400) {
      ymax = 300;
    }
    if (currentHighestBg >= 300 && currentHighestBg < 350) {
      ymax = 270;
    }
    if (currentHighestBg >= 250 && currentHighestBg < 300) {
      ymax = 260;
    }
    if (currentHighestBg >= 220 && currentHighestBg < 250) {
      ymax = 220;
      if (high >= 220) {
        ymax = 250;
      }
    }
    if (currentHighestBg >= 160 && currentHighestBg < 220) {
      ymax = 180;
      if (high >= 220) {
        ymax = 240;
      }
    }
    if (currentLowBg < 60) {
      ymin = 60;
    }
    if (currentLowBg < 50) {
      ymin = 50;
    }
    if (currentLowBg < 40) {
      ymin = 40;
    }

    let highY =
      height -
      height * (Math.round(((high - ymin) / (ymax - ymin)) * 100) / 100);
    let lowY =
      height -
      height * (Math.round(((low - ymin) / (ymax - ymin)) * 100) / 100);
    highLine.y1 = highY;
    highLine.y2 = highY;
    meanLine.y1 = (highY + lowY) / 2;
    meanLine.y2 = (highY + lowY) / 2;
    lowLine.y1 = lowY;
    lowLine.y2 = lowY;

    highNumber.y = highY;
    lowNumber.y = lowY;

    let tempHigh = high;
    let tempLow = low;
    if (isMmol) {
      tempHigh = mmol(tempHigh);
      tempLow = mmol(tempLow);
    }

    highNumber.text = tempHigh;
    lowNumber.text = tempLow;

    graphPoints.forEach((point, index) => {
      try {
        let bg = bloodsugars[index];
        if (bloodsugars[index] === undefined || bloodsugars[index] === "LOS") {
          graphPoints[index].style.opacity = 0;
        } else {
          graphPoints[index].style.opacity = 1;
          let pointY =
            height -
            height * (Math.round(((bg - ymin) / (ymax - ymin)) * 100) / 100);
          graphPoints[index].cy = pointY;
          graphPoints[index].style.fill = "#708090"; // gray
          //  - check sgv point is in range if not change color
          if (predictedBloodsugars[index] == bg) {
            graphPoints[index].style.fill = "#f76ac5"; // pink
            // graphPoints[index].r = 3;
          } else if (parseInt(bg, 10) <= low) {
            graphPoints[index].style.fill = "#de4430"; //red
          } else if (parseInt(bg, 10) >= high) {
            graphPoints[index].style.fill = "orange"; // orange
            if (parseInt(bg, 10) >= parseInt(high) + 35) {
              graphPoints[index].style.fill = "#de4430"; // red
            }
          } else {
            graphPoints[index].style.fill = "#75bd78"; // green
          }
        }
      } catch (e) {
        console.log(e);
      }
    });
  }
}

// converts a mg/dL to mmoL
function mmol(bg, roundToHundredths) {
  let mmolBG = (Math.round((bg / 18) * 10) / 10).toFixed(1);
  return mmolBG;
}

// converts mmoL to  mg/dL
function mgdl(bg) {
  let mgdlBG = Math.round(bg * 18.018).toFixed(0);
  return mgdlBG;
}
