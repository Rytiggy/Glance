import { readFileSync, writeFileSync } from 'fs';
import { me } from 'appbit';

const FILE_NAME = 'datamatabatafata.cbor';

export let preferences = {};

try {
  preferences = readFileSync(FILE_NAME, 'cbor');
} catch (error) {
  console.warn('Failed to load ' + FILE_NAME + '. It is OK if no values were stored yet.');
}

me.addEventListener('unload', () => {
  try {
    writeFileSync(FILE_NAME, preferences, 'cbor');
  } catch (error) {
    console.error('Failed to save ' + FILE_NAME);
  }
})
