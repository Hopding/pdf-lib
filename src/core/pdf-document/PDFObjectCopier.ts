import { PDFObjectIndex } from 'core/pdf-document';
import {
  PDFArray,
  PDFDictionary,
  PDFIndirectReference,
  PDFObject,
  PDFStream,
} from 'core/pdf-objects';
import { PDFPage } from 'core/pdf-structures';

class PDFObjectCopier {
  static for = (src: PDFObjectIndex, dest: PDFObjectIndex) =>
    new PDFObjectCopier(src, dest);

  private readonly from: PDFObjectIndex;
  private readonly to: PDFObjectIndex;
  private readonly traversedObjects = new Map<PDFObject, PDFObject>();

  constructor(from: PDFObjectIndex, to: PDFObjectIndex) {
    this.from = from;
    this.to = to;
  }

  // prettier-ignore
  copy = <T extends PDFObject>(value: T): T => (
      value instanceof PDFPage              ? this.copyPDFPage(value)
    : value instanceof PDFStream            ? this.copyPDFStream(value)
    : value instanceof PDFDictionary        ? this.copyPDFDict(value)
    : value instanceof PDFArray             ? this.copyPDFArray(value)
    : value instanceof PDFIndirectReference ? this.copyPDFIndirectObject(value)
    : value.clone()
  ) as T;

  // NOTE: May need to update this to copy over entries that the donor page
  //       inherits from its Parent in the donor document...
  private copyPDFPage = (originalPage: PDFPage): PDFPage => {
    const clonedPage = originalPage.clone();

    // Remove the parent reference to prevent the whole donor document's page
    // tree from being copied when we only need a single page.
    clonedPage.delete('Parent');

    return this.copyPDFDict(clonedPage) as PDFPage;
  };

  private copyPDFDict = (originalDict: PDFDictionary): PDFDictionary => {
    if (this.traversedObjects.has(originalDict)) {
      return this.traversedObjects.get(originalDict) as PDFDictionary;
    }

    const clonedDict = originalDict.clone();
    clonedDict.index = this.to;
    this.traversedObjects.set(originalDict, clonedDict);

    originalDict.map.forEach((value, key) => {
      clonedDict.set(key, this.copy(value));
    });

    return clonedDict;
  };

  private copyPDFArray = (originalArray: PDFArray): PDFArray => {
    if (this.traversedObjects.has(originalArray)) {
      return this.traversedObjects.get(originalArray) as PDFArray;
    }

    const clonedArray = originalArray.clone();
    clonedArray.index = this.to;
    this.traversedObjects.set(originalArray, clonedArray);

    originalArray.forEach((value, idx) => {
      clonedArray.set(idx, this.copy(value));
    });

    return clonedArray;
  };

  private copyPDFStream = (originalStream: PDFStream): PDFStream => {
    if (this.traversedObjects.has(originalStream)) {
      return this.traversedObjects.get(originalStream) as PDFStream;
    }

    const clonedStream = originalStream.clone();
    clonedStream.dictionary.index = this.to;
    this.traversedObjects.set(originalStream, clonedStream);

    originalStream.dictionary.map.forEach((value, key) => {
      clonedStream.dictionary.set(key, this.copy(value));
    });

    return clonedStream;
  };

  private copyPDFIndirectObject = (
    ref: PDFIndirectReference,
  ): PDFIndirectReference => {
    const alreadyMapped = this.traversedObjects.has(ref);

    if (!alreadyMapped) {
      const newRef = this.to.nextObjectNumber();
      this.traversedObjects.set(ref, newRef);

      const dereferencedValue = this.from.lookup(ref);
      const cloned = this.copy(dereferencedValue);

      this.to.assign(newRef, cloned);
    }

    return this.traversedObjects.get(ref) as PDFIndirectReference;
  };
}

export default PDFObjectCopier;
