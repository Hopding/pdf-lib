import pako from 'pako';

import { MethodNotImplementedError } from '../errors';
import PDFDict from '../objects/PDFDict';
import PDFName from '../objects/PDFName';
import PDFStream from '../objects/PDFStream';
import { Cache } from '../../utils';

class PDFFlateStream extends PDFStream {
  protected contentsCache: Cache<Uint8Array>;
  protected readonly encode: boolean;

  constructor(dict: PDFDict, encode: boolean) {
    super(dict);

    this.encode = encode;

    if (encode) dict.set(PDFName.of('Filter'), PDFName.of('FlateDecode'));
    this.contentsCache = Cache.populatedBy(this.computeContents);
  }

  computeContents = (): Uint8Array => {
    const unencodedContents = this.getUnencodedContents();
    return this.encode ? pako.deflate(unencodedContents) : unencodedContents;
  };

  getContents(): Uint8Array {
    return this.contentsCache.access();
  }

  getContentsSize(): number {
    return this.contentsCache.access().length;
  }

  getUnencodedContents(): Uint8Array {
    throw new MethodNotImplementedError(
      this.constructor.name,
      'getUnencodedContents',
    );
  }

  updateContents(contents: Uint8Array): void {
    this.contentsCache = Cache.populatedBy(() => contents);
  }
}

export default PDFFlateStream;
