//FAB
/*
 * Copyright (C) 2019 Fabrizio Casellato - DeeBee.it - All Rights Reserved
 *
 * Permissions of this strong copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights.
 *
 * https://github.com/Rytiggy/Glance/blob/master/LICENSE
 * ------------------------------------------------
 *
 * You are free to modify the code but please leave the copyright in the header.
 *
 * ------------------------------------------------ //
 */
import Logs from "./logs.js";
const logs = new Logs();

var bgs_day = [];
var object_count = 0;
const MAX_BG_FETCHED = 48;
let bgs = "";
var max_datetime = 0;
var prev_datetime = 0;
let ret_json_dummy;

//how_many_days = 0 --> today, 1--> yesterday, ...
//return "/glucose/201806/15/" (15 Jun 2018)
function get_path_last_days(how_many_days) {
  var d = new Date();
  var d_prev = new Date(d.valueOf() - 1000 * 60 * 60 * 24 * how_many_days); //Sottraggo tot giorni
  var prev_data_path =
    d_prev.getFullYear() +
    ("0" + (parseInt(d_prev.getMonth()) + 1)).slice(-2) +
    "/" +
    ("0" + d_prev.getDate()).slice(-2) +
    "/";
  return "/glucose/" + prev_data_path;
}

async function get_data_has_more(
  dropbox_token,
  dbx_cursor,
  yagi_patient_name,
  day_nr
) {
  bgs_day[day_nr] = "";
  bgs = "";
  prev_datetime = 0;

  let body = {
    cursor: dbx_cursor
  };

  var myBearer = "Bearer " + dropbox_token;

  return await fetch(
    `https://api.dropboxapi.com/2/files/list_folder/continue`,
    {
      headers: {
        Authorization: myBearer, //'Bearer ' . dropbox_token,
        "Content-Type": "application/json"
      },
      method: "post",
      body: JSON.stringify(body)
    }
  )
    .then(function(response) {
      let resp = response.text();
      return resp;
    })
    .then(function(data) {
      var json_response = JSON.parse(data);

      for (var prop in json_response) {
        var item = json_response[prop]; //all the elements
        var tot_objs = item.length;
        var delta;
        for (var elem in item) {
          let row = [];
          var item_sub = item[elem];
          var path_file_name = item_sub["path_display"]; //item_sub["path_lower"];
          if (item_sub[".tag"] == "file" && path_file_name != undefined) {
            //I remove the path and leave only the name of the file
            //  /glucose/201806/15/16/20180615-165211;1;xdrip;1603091400;66;fortyfivedown;1;-7.863.glu
            // -> 20180615-165211;1;xdrip;1603091400;66;fortyfivedown;1;-7.863.glu
            var file_name = path_file_name.substring(22);
            var col = file_name.replace(/\.[^/.]+$/, "").split(";"); //the replace() removes the extension

            row.versione = col[1];
            if (row.versione == "5") {
              row.data_hour = col[0];
              row.data_type = col[2];
              if (row.data_type == "GLU") {
                row.arrow_value = col[8];
                row.bg_sensor = Number(col[6]);
                row.data_source_type = col[4];
                row.patient = col[11];
                row.timestamp = col[12];
                row.datetime = col[15];
                row.delta = Math.round(col[10]);
                row.trend == "";
                if (row.arrow_value == "Flat") row.trend = 4;
                if (row.arrow_value == "FortyFiveUp") row.trend = 3;
                if (row.arrow_value == "FortyFiveDown") row.trend = 5;
                if (row.arrow_value == "SingleUp") row.trend = 2;
                if (row.arrow_value == "SingleDown") row.trend = 6;
                if (row.arrow_value == "DoubleUp") row.trend = 1;
                if (row.arrow_value == "DoubleDown") row.trend = 7;
              } else if (row.data_type == "CHO") {
                //cho = Number(rec_value);
              } else if (row.data_type == "INS") {
                //insuline = Number(rec_value);
              } else if (row.data_type == "MET") {
                row.bg_meter = Number(col[6]);
                row.patient = col[7];
              }
            }

            //element structure: {"sgv":"123","trend":4,"direction":"Flat","datetime":1567158462000}
            //FIRST element: {"sgv":"200","trend":4,"direction":"Flat","datetime":1567172261000,"bgdelta":2
            //               ,"battery":"62","iob":"0.58","bwp":"0.10","bwpo":136,"cob":0.1}
            if (
              row.bg_sensor != undefined &&
              row.data_type == "GLU" &&
              (yagi_patient_name == null ||
                yagi_patient_name + "" == "" ||
                (yagi_patient_name + "").toLowerCase() ==
                  (row.patient + "").toLowerCase()) &&
              row.datetime > prev_datetime //the datetime must be after the previous
            ) {
              //Add points with no data every hole of 5 minutes
              for (
                var i = 1;
                max_datetime > 0 &&
                i < MAX_BG_FETCHED &&
                i < (row.datetime - max_datetime) / (5 * 61 * 1000);
                i++
              ) {
                //a little more then 5 minutes

                bgs_day[day_nr] = '{"sgv":""},' + bgs_day[day_nr];
              }

              bgs_day[day_nr] =
                "{" +
                '"sgv":"' +
                row.bg_sensor +
                '","trend":' +
                row.trend +
                ',"direction":"' +
                row.arrow_value +
                '","datetime":' +
                row.datetime +
                "%DELTA%" +
                "}" +
                "," +
                bgs_day[day_nr];

              delta = row.delta;
              if (row.datetime > max_datetime) {
                max_datetime = row.datetime;
              }
              prev_datetime = row.datetime;
              object_count++;
            } else {
            }
          }
        }
      }

      //If present, I remove the last comma
      if (bgs_day[day_nr].slice(-1) == ",") {
        bgs_day[day_nr] = bgs_day[day_nr].substring(
          0,
          bgs_day[day_nr].length - 1
        );
      }

      //At the first occurrence I also add the delta
      bgs_day[day_nr] = bgs_day[day_nr].replace(
        "%DELTA%",
        ', "bgdelta":' + delta
      );
      //To the I hide gates the TAG
      bgs_day[day_nr] = bgs_day[day_nr].split("%DELTA%").join("");
    })
    .catch(error => {
      logs.add(error);
    });
}

async function getData_first(dropbox_token, days_back) {
  let body = {
    path: get_path_last_days(days_back),
    recursive: true
  };

  var myBearer = "Bearer " + dropbox_token;

  return await fetch(`https://api.dropboxapi.com/2/files/list_folder`, {
    headers: {
      Authorization: myBearer, //'Bearer ' . dropbox_token,%DELTA%
      "Content-Type": "application/json"
    },
    method: "post",
    body: JSON.stringify(body)
  })
    .then(function(response) {
      let resp = response.text();
      return resp;
    })
    .then(function(data) {
      var json_response = JSON.parse(data);
      for (var prop in json_response) {
        var item = json_response[prop]; //all the elements
        var tot_objs = item.length;
        for (var elem in item) {
          var item_sub = item[elem];
          var path_file_name = item_sub["path_display"];
          if (item_sub[".tag"] == "file" && path_file_name != undefined) {
            //I remove the path and leave only the name of the file
            //  /glucose/201806/15/16/20180615-165211;1;xdrip;1603091400;66;fortyfivedown;1;-7.863.glu
            // -> 20180615-165211;1;xdrip;1603091400;66;fortyfivedown;1;-7.863.glu
            var file_name = path_file_name.substring(22);
          }
        }
      }

      //If there are still records to load, I continue to make requests bees cycling
      //otherwise, I'm going to render the layout
      if (data.indexOf('"has_more": true') == -1) {
        return null;
      } else {
        return json_response["cursor"];
      }
    })
    .catch(error => {
      logs.add(error);
    });
}

export default class dropbox {
  async getData(dropbox_token, yagi_patient_name) {
    max_datetime = 0;
    //current_date = (new Date()).getTime();
    ret_json_dummy = {
      bgs: [
        {
          sgv: "120",
          bgdelta: 0,
          iob: 0,
          cob: 0,
          datetime: new Date().getTime(),
          direction: "warning",
          currentbg: "",
          rawbg: "",
          tempbasal: "",
          loopstatus: ""
        },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" },
        { sgv: "120" }
      ]
    };

    /*
      if (1==0 && (new Date()).getTime() - this.last_fetch_datetime < 10000) { //less than 10 seconds
        //return JSON.parse('{"status":[{"now":'
        //                  +(new Date()).getTime()
        //                  +'}],"bgs":['
        //                  + '{"sgv":"100","trend":null,"direction":"","datetime":1567500658000, "bgdelta":1.000}'
        //                  +'],"cals":[]}');
        return ret_json_dummy
      }
	  */

    this.last_fetch_datetime = new Date().getTime();

    bgs_day[0] = ""; //today
    bgs_day[1] = ""; //yesterday
    let data_remapped = null;
    let dbx_cursor = await getData_first(dropbox_token, 0);
    await get_data_has_more(dropbox_token, dbx_cursor, yagi_patient_name, 0);

    //if too few svg, read also yesterday
    if (object_count < MAX_BG_FETCHED) {
      let dbx_cursor = await getData_first(dropbox_token, 1);
      await get_data_has_more(dropbox_token, dbx_cursor, yagi_patient_name, 1);
    }
    //if merging 2 days, I put a comma to concatenate
    //let bgs = '';
    if (bgs_day[0].length > 0 && bgs_day[1].length == 0) {
      bgs = bgs_day[0];
    } else if (bgs_day[0].length > 0 && bgs_day[1].length > 0) {
      bgs = bgs_day[0] + "," + bgs_day[1];
    } else if (bgs_day[0].length == 0 && bgs_day[1].length > 0) {
      bgs = bgs_day[1];
    } else {
      return ret_json_dummy;
    }

    let currentTime = new Date();
    let ret_json = JSON.parse(
      '{"status":[{"now":' + max_datetime + '}],"bgs":[' + bgs + '],"cals":[]}'
    );
    return ret_json;
  }
}
