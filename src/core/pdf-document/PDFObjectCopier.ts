import { PDFObjectIndex } from 'core/pdf-document';
import {
  PDFArray,
  PDFDictionary,
  PDFIndirectReference,
  PDFObject,
  PDFStream,
} from 'core/pdf-objects';
import { error } from 'utils';

class PDFObjectCopier {
  static for = (src: PDFObjectIndex, dest: PDFObjectIndex) =>
    new PDFObjectCopier(src, dest);

  private readonly from: PDFObjectIndex;
  private readonly to: PDFObjectIndex;

  // TODO: Are both of these necessary?
  private readonly mappedRefs = new Map<
    PDFIndirectReference,
    PDFIndirectReference
  >();
  private readonly traversedObjects = new Map<PDFObject, PDFObject>();

  constructor(from: PDFObjectIndex, to: PDFObjectIndex) {
    this.from = from;
    this.to = to;
  }

  copy = (object: PDFObject): PDFObject => {
    if (object instanceof PDFDictionary) return this.copyDictionary(object)!;
    if (object instanceof PDFArray) return this.copyArray(object)!;
    if (object instanceof PDFStream) return this.copyStream(object)!;
    return error(`Cannot copy object of type: ${object.constructor.name}`);
  };

  private copyDictionary = (pdfDict: PDFDictionary): PDFDictionary => {
    if (this.traversedObjects.has(pdfDict)) {
      return this.traversedObjects.get(pdfDict) as PDFDictionary;
    }

    const cloned = pdfDict.cloneDeep(this.to);
    this.traversedObjects.set(pdfDict, cloned);

    new Map(cloned.map).forEach((value, key) => {
      if (value instanceof PDFDictionary) this.copyDictionary(value);
      if (value instanceof PDFArray) this.copyArray(value);
      if (value instanceof PDFIndirectReference) {
        const newRef = this.copyIndirectObject(value);
        cloned.map.set(key, newRef);
      }
    });

    return cloned;
  };

  private copyArray = (pdfArray: PDFArray): PDFArray => {
    if (this.traversedObjects.has(pdfArray)) {
      return this.traversedObjects.get(pdfArray) as PDFArray;
    }

    const cloned = pdfArray.cloneDeep(this.to);
    this.traversedObjects.set(pdfArray, cloned);

    pdfArray.forEach((value, idx) => {
      if (value instanceof PDFDictionary) this.copyDictionary(value);
      if (value instanceof PDFArray) this.copyArray(value);
      if (value instanceof PDFIndirectReference) {
        const newRef = this.copyIndirectObject(value);
        pdfArray.set(idx, newRef);
      }
    });

    return cloned;
  };

  private copyStream = (pdfStream: PDFStream): PDFStream => {
    if (this.traversedObjects.has(pdfStream)) {
      return this.traversedObjects.get(pdfStream) as PDFStream;
    }

    const cloned = pdfStream.cloneDeep(this.to);
    this.traversedObjects.set(pdfStream, cloned);

    new Map(cloned.dictionary.map).forEach((value, key) => {
      if (value instanceof PDFDictionary) this.copyDictionary(value);
      if (value instanceof PDFArray) this.copyArray(value);
      if (value instanceof PDFIndirectReference) {
        const newRef = this.copyIndirectObject(value);
        cloned.dictionary.map.set(key, newRef);
      }
    });

    return cloned;
  };

  private copyIndirectObject = (
    ref: PDFIndirectReference,
  ): PDFIndirectReference => {
    const alreadyMapped = this.mappedRefs.has(ref);

    if (!alreadyMapped) {
      const dereferencedValue = this.from.lookup(ref);

      // const newRef = this.to.assignNextObjectNumberTo(dereferencedValue);
      // this.mappedRefs.set(ref, newRef);

      let cloned = dereferencedValue;
      if (dereferencedValue instanceof PDFStream) {
        // cloned = dereferencedValue.cloneDeep(this.to);
        // this.copyDictionary(dereferencedValue.dictionary);
        cloned = this.copyStream(dereferencedValue);
      }
      if (dereferencedValue instanceof PDFDictionary) {
        // cloned = dereferencedValue.cloneDeep(this.to);
        // this.copyDictionary(cloned as PDFDictionary);
        cloned = this.copyDictionary(dereferencedValue);
      }
      if (dereferencedValue instanceof PDFArray) {
        // cloned = dereferencedValue.cloneDeep(this.to);
        // this.copyArray(cloned as PDFArray);
        cloned = this.copyArray(dereferencedValue);
      }

      // TODO: This probably _needs_ to be done before copying the dereferencedValue...
      const newRef = this.to.assignNextObjectNumberTo(cloned);
      this.mappedRefs.set(ref, newRef);
    }

    return this.mappedRefs.get(ref)!;
  };
}

export default PDFObjectCopier;
