import fs from 'fs';

import Ascii85Stream from '../../../src/core/streams/Ascii85Stream';
import Stream from '../../../src/core/streams/Stream';

const DIR = 'tests/core/streams/data/ascii85';
const FILES = ['1'];

describe('Ascii85Stream', () => {
  FILES.forEach((file) => {
    it(`can decode ascii 85 encoded data (${file})`, () => {
      const encoded = new Uint8Array(fs.readFileSync(`${DIR}/${file}.encoded`));
      const decoded = new Uint8Array(fs.readFileSync(`${DIR}/${file}.decoded`));

      const stream = new Ascii85Stream(new Stream(encoded));

      expect(stream.decode()).toEqual(decoded);
    });
  });
});
