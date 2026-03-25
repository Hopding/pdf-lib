import fs from 'fs';

import LZWStream from '../../../src/core/streams/LZWStream';
import Stream from '../../../src/core/streams/Stream';

const DIR = 'tests/core/streams/data/lzw';
const FILES = ['1', '2', '3', '4'];

describe('LZWStream', () => {
  FILES.forEach((file) => {
    it(`can decode LZW encoded data (${file})`, () => {
      const encoded = new Uint8Array(fs.readFileSync(`${DIR}/${file}.encoded`));
      const decoded = new Uint8Array(fs.readFileSync(`${DIR}/${file}.decoded`));

      const stream = new LZWStream(new Stream(encoded), undefined, 0);

      expect(stream.decode()).toEqual(decoded);
    });
  });
});
