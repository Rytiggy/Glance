// import { readFileSync, writeFileSync } from 'fs';
// import { me } from 'appbit';

// const FILE_NAME = 'userSettings.cbor';

// export let preferences = {};

// try {
//   preferences = readFileSync(FILE_NAME, 'cbor');
// } catch (error) {
// }

// me.addEventListener('unload', () => {
//   try {
//     writeFileSync(FILE_NAME, preferences, 'cbor');
//   } catch (error) {
//   }
// })
import * as fs from "fs";

export default class userSettings {
  save(data) {
    fs.writeFileSync("userSettings.cbor", data, "cbor");
  }
  load() {
    try {
      let data = fs.readFileSync("userSettings.cbor", "cbor");

      return data;
    } catch (e) {
      return null;
    }
  }
}
