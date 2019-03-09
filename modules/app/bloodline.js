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



import { me as device } from "device";
import document from "document";

let highNumber = document.getElementById("high");
let lowNumber = document.getElementById("low");
let largeGraphHigh = document.getElementById("largeGraphHigh");
let largeGraphLow = document.getElementById("largeGraphLow");

let meanNumber = document.getElementsByClassName("mean");
let highLine = document.getElementsByClassName("highLine");
let meanLine = document.getElementsByClassName("meanLine");
let lowLine = document.getElementsByClassName("lowLine");

let graphPoints = document.getElementsByClassName("graphPoints");
let largeGraphGraphPoints = document.getElementsByClassName("largeGraphGraphPoints");
    
export default class bloodline { 
  update(bloodsugars, high, low, settings) {
    let isMmol = settings.glucoseUnits === 'mmol';
    
    console.log('app - bloodline - update()')
    let reverseBloodsugars = bloodsugars.reverse();
   
    let predictedValues = reverseBloodsugars.filter((bg) => {
      if (bg.p) {
        return bg;      
      }
    });
    let smallReverseBloodsugars = reverseBloodsugars.filter((bg,index) => {
      // bg.p loop = 18 40 ar2 = 5 28
      if(!settings.enableSmallGraphPrediction && !(bg.p) && index >= (reverseBloodsugars.length - (predictedValues.length + 24)) ) {
        return bg;
      } else if (index >= (reverseBloodsugars.length - 24)) {
        return bg; 
      }
    });
    
    let ymin = low;
    let ymax = high;
    let height = 100;
    // map all sgv to an array then filter out LOS values
    let sgvArray = reverseBloodsugars.map(bg => bg.sgv).filter(bg => bg !== 'LOS');  
    const currentHighestBg = Math.max(...sgvArray);
    const currentLowBg = Math.min(...sgvArray);
    if(currentHighestBg >= 400) {
      ymax = 340;
    }
    if(currentHighestBg >= 350 && currentHighestBg < 400) {
      ymax = 300;
    }
    if(currentHighestBg >= 300 && currentHighestBg < 350) {
      ymax = 270;
    }
    if(currentHighestBg >= 250 && currentHighestBg < 300) {
      ymax = 260;
    }
    if(currentHighestBg >= 220 && currentHighestBg < 250) {
      ymax = 220;
      if( high >= 220) {
        ymax = 250;
      }
    }   
    if(currentHighestBg >= 160 && currentHighestBg < 220) {
      ymax = 180;
       if( high >= 220) {
         ymax = 240;
       }
    }     
    if(currentLowBg < 60) {
      ymin = 60;
    }
    if(currentLowBg < 50) {
      ymin = 50;
    }
    if(currentLowBg < 40) {
      ymin = 40;
    }
    
    let highY = (height - (height * (Math.round(((high - ymin) / (ymax - ymin)) * 100) / 100)));
    let lowY = (height - (height * (Math.round(((low - ymin) / (ymax - ymin)) * 100) / 100)));
    highLine[0].y1 = highY;
    highLine[0].y2 = highY;
    meanLine[0].y1 = (highY + lowY)/2;
    meanLine[0].y2 = (highY + lowY)/2;
    lowLine[0].y1 = lowY;
    lowLine[0].y2 = lowY;
    
    highLine[1].y1 = highY;
    highLine[1].y2 = highY;
    meanLine[1].y1 = (highY + lowY)/2;
    meanLine[1].y2 = (highY + lowY)/2;
    lowLine[1].y1 = lowY;
    lowLine[1].y2 = lowY;
    
    highNumber.y = highY;
    lowNumber.y = lowY; 
    
    largeGraphHigh.y = highY;
    largeGraphLow.y = lowY; 
    
    let tempHigh = high;
    let tempLow = low; 
    let tempMean = (high + low)/2;
    if (isMmol) {
      tempHigh =  mmol(tempHigh);
      tempLow =  mmol(tempLow);
    }
    
    highNumber.text = tempHigh;
    lowNumber.text = tempLow;
    largeGraphHigh.text = tempHigh;
    largeGraphLow.text = tempLow;

    // loop over bloodsugars and plot graph points
    // 22 loops
    graphPoints.forEach((point, index) => {
      try {
        let bg = smallReverseBloodsugars[index];
        if(smallReverseBloodsugars[index].sgv === 'LOS') {
          graphPoints[index].style.opacity = 0;
        } else {
          graphPoints[index].style.opacity = 1;
          let pointY = (height - (height * (Math.round(((bg.sgv - ymin) / (ymax - ymin)) * 100) / 100)));
          //  - TODO: compare time of current sgv to time of last sgv and make sure its equal 5m if not add spacing
          graphPoints[index].cy = pointY;
          graphPoints[index].style.fill = "#708090"; // gray
          //  - check sgv point is in range if not change color 
          if(bg.p) {
            graphPoints[index].style.fill = "#f76ac5"; // pink   
            // graphPoints[index].r = 3;
          } else if (parseInt(bg.sgv, 10) <= low){
            graphPoints[index].style.fill = "#de4430"; //red
          } else if ( parseInt(bg.sgv, 10) >= high) {
            graphPoints[index].style.fill = "orange"; // orange 
            if ( parseInt(bg.sgv, 10) >=  (parseInt(high) + 35)) {
               graphPoints[index].style.fill = "#de4430"; // red 
            }
          } else {
            graphPoints[index].style.fill = "#75bd78"; // green 
          } 
        }
      } catch(e) {
        console.error(e)
      }


    });  
    
    // 47 loops 
    for (let index = 0; index < reverseBloodsugars.length; index++) {
      if(reverseBloodsugars[index].sgv === 'LOS') {
        largeGraphGraphPoints[index].style.opacity = 0;
      } else {
        largeGraphGraphPoints[index].style.opacity = 1;
        let pointY = (height - (height * (Math.round(((reverseBloodsugars[index].sgv - ymin) / (ymax - ymin)) * 100) / 100)));
        //  - TODO: compare time of current sgv to time of last sgv and make sure its equal 5m if not add spacing
        largeGraphGraphPoints[index].cy = pointY;
        largeGraphGraphPoints[index].style.fill = "#708090"; // gray
        //  - check sgv point is in range if not change color 
        if(reverseBloodsugars[index].p) {
          largeGraphGraphPoints[index].style.fill = "#f76ac5"; // pink   
        } else if (parseInt(reverseBloodsugars[index].sgv, 10) <= low){
          //- INFO: largeGraphGraphPoints has to be at the 22 index becase it is ALL the points on both graphs combined
          largeGraphGraphPoints[index].style.fill = "#de4430"; //red
        } else if ( parseInt(reverseBloodsugars[index].sgv, 10) >= high) {
          largeGraphGraphPoints[index].style.fill = "orange"; // orange 
          if ( parseInt(reverseBloodsugars[index].sgv, 10) >=  (parseInt(high) + 35)) {
             largeGraphGraphPoints[index].style.fill = "#de4430"; // red 
          }
        } else {
          largeGraphGraphPoints[index].style.fill = "#75bd78"; // green 
        }
      }
    }     
    reverseBloodsugars.reverse();
  }
};

// converts a mg/dL to mmoL
function mmol(bg , roundToHundredths) {
   let mmolBG = (Math.round((bg / 18) * 10) / 10).toFixed(1); 
  return mmolBG;
}

// converts mmoL to  mg/dL 
function  mgdl( bg ) {
  let mgdlBG =(Math.round(bg * 18.018).toFixed(0));
  return mgdlBG;
}
