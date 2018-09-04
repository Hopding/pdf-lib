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
  private readonly traversedObjects = new Set<PDFObject>();

  constructor(from: PDFObjectIndex, to: PDFObjectIndex) {
    this.from = from;
    this.to = to;
  }

  copy = <T extends PDFObject>(object: T) => {
    if (object instanceof PDFDictionary) this.copyDictionary(object);
    else if (object instanceof PDFArray) this.copyArray(object);
    else error(`Cannot copy object of type: ${object.constructor.name}`);
  };

  private copyDictionary = (pdfDict: PDFDictionary) => {
    if (this.traversedObjects.has(pdfDict)) return;
    this.traversedObjects.add(pdfDict);

    new Map(pdfDict.map).forEach((value, key) => {
      if (value instanceof PDFDictionary) this.copyDictionary(value);
      if (value instanceof PDFArray) this.copyArray(value);
      if (value instanceof PDFIndirectReference) {
        const newRef = this.copyIndirectObject(value);
        pdfDict.map.set(key, newRef);
      }
    });
  };

  private copyArray = (pdfArray: PDFArray) => {
    if (this.traversedObjects.has(pdfArray)) return;
    this.traversedObjects.add(pdfArray);

    pdfArray.forEach((value, idx) => {
      if (value instanceof PDFDictionary) this.copyDictionary(value);
      if (value instanceof PDFArray) this.copyArray(value);
      if (value instanceof PDFIndirectReference) {
        const newRef = this.copyIndirectObject(value);
        pdfArray.array[idx] = newRef;
      }
    });
  };

  private copyIndirectObject = (
    ref: PDFIndirectReference,
  ): PDFIndirectReference => {
    const alreadyMapped = this.mappedRefs.has(ref);

    if (!alreadyMapped) {
      const dereferencedValue = this.from.lookup(ref);

      console.log('Found a ', dereferencedValue.constructor.name);

      const newRef = this.to.assignNextObjectNumberTo(dereferencedValue);
      this.mappedRefs.set(ref, newRef);

      if (dereferencedValue instanceof PDFStream) {
        this.copyDictionary(dereferencedValue.dictionary);
      }
      if (dereferencedValue instanceof PDFDictionary) {
        this.copyDictionary(dereferencedValue);
      }
      if (dereferencedValue instanceof PDFArray) {
        this.copyArray(dereferencedValue);
      }
    }

    return this.mappedRefs.get(ref)!;
  };
}

/*

const srcIndex = ...
const destIndex = ...
const originalObj = ...

const copiedObj = PDFObjectCopier.copy(srcIndex, destIndex, origObject);

const copier = PDFObjectCopier.for(srcIndex, destIndex);
const copiedObj = copier.copy(originalObj);

const copiedObj = PDFObjectCopier.for(srcIndex, destIndex).copy(origObject);

this.index.setNextObjectNumber(value);
this.index.assignNextObjectNumber(value);

*/

export default PDFObjectCopier;
