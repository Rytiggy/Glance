// import { readFileSync, writeFileSync } from 'fs';
// import { me } from 'appbit';

// const FILE_NAME = 'userSettings.cbor';

// export let preferences = {};

// try {
//   preferences = readFileSync(FILE_NAME, 'cbor');
// } catch (error) {
//   console.warn('Failed to load ' + FILE_NAME + '. It is OK if no values were stored yet.');
// }

// me.addEventListener('unload', () => {
//   try {
//     writeFileSync(FILE_NAME, preferences, 'cbor');
//   } catch (error) {
//     console.error('Failed to save ' + FILE_NAME);
//   }
// })
import * as fs from "fs";

export default class userSettings {
  save(data) {
    console.log('here')
    fs.writeFileSync("userSettings.cbor", data, "cbor");
  }
  load() {
    try{
      console.log("loading data ");
      let data = fs.readFileSync("userSettings.cbor", "cbor");
      console.log(JSON.stringify(data));
      return data;
    } catch(e) {
      console.log(e);
      return null;
    }
  }
};




