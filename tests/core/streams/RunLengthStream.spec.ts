import fs from 'fs';

import RunLengthStream from '../../../src/core/streams/RunLengthStream';
import Stream from '../../../src/core/streams/Stream';

const DIR = 'tests/core/streams/data/runlength';
const FILES = ['1', '2', '3', '4', '5'];

describe('RunLengthStream', () => {
  FILES.forEach((file) => {
    it(`can decode run length encoded data (${file})`, () => {
      const encoded = new Uint8Array(fs.readFileSync(`${DIR}/${file}.encoded`));
      const decoded = new Uint8Array(fs.readFileSync(`${DIR}/${file}.decoded`));

      const stream = new RunLengthStream(new Stream(encoded));

      expect(stream.decode()).toEqual(decoded);
    });
  });
});
