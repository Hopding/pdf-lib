import { PDFDict, PDFName, PDFStream } from 'src/core';

class PDFAnnotationAppearance {
  static fromDict(dict: PDFDict): PDFAnnotationAppearance {
    return new PDFAnnotationAppearance(dict);
  }

  readonly dict: PDFDict;

  protected constructor(dict: PDFDict) {
    this.dict = dict;
  }

  N(): PDFDict | PDFStream {
    const normalAppearance = this.dict.lookup(PDFName.N);
    if (normalAppearance instanceof PDFDict) {
      return this.dict.lookup(PDFName.N, PDFDict);
    }
    return this.dict.lookup(PDFName.N, PDFStream);
  }

  getNormal(): PDFDict | PDFStream {
    return this.N();
  }

  D(): PDFDict | PDFStream {
    const downAppearance = this.dict.lookup(PDFName.D);
    if (downAppearance instanceof PDFDict) {
      return this.dict.lookup(PDFName.D, PDFDict);
    } else if (downAppearance instanceof PDFStream) {
      return this.dict.lookup(PDFName.D, PDFStream);
    }
    return this.N();
  }

  getDown(): PDFDict | PDFStream {
    return this.D();
  }

  R(): PDFDict | PDFStream {
    const rolloverAppearance = this.dict.lookup(PDFName.R);
    if (rolloverAppearance instanceof PDFDict) {
      return this.dict.lookup(PDFName.R, PDFDict);
    } else if (rolloverAppearance instanceof PDFStream) {
      return this.dict.lookup(PDFName.R, PDFStream);
    }
    return this.N();
  }

  getRollover(): PDFDict | PDFStream {
    return this.R();
  }
}

export default PDFAnnotationAppearance;
