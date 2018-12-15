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

  idx = 0;

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

    const cloned = pdfDict.clone(this.to);
    this.traversedObjects.set(pdfDict, cloned);

    new Map(cloned.map).forEach((value, key) => {
      if (value instanceof PDFDictionary) {
        const newDict = this.copyDictionary(value);
        cloned.map.set(key, newDict);
      }
      if (value instanceof PDFArray) {
        const newArray = this.copyArray(value);
        cloned.map.set(key, newArray);
      }
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

    const cloned = pdfArray.clone(this.to);
    this.traversedObjects.set(pdfArray, cloned);

    cloned.forEach((value, idx) => {
      if (value instanceof PDFDictionary) {
        const newDict = this.copyDictionary(value);
        cloned.set(idx, newDict);
      }
      if (value instanceof PDFArray) {
        const newArray = this.copyArray(value);
        cloned.set(idx, newArray);
      }
      if (value instanceof PDFIndirectReference) {
        const newRef = this.copyIndirectObject(value);
        cloned.set(idx, newRef);
      }
    });
    // console.log('Copying array:', pdfArray.toString());
    // console.log('Copying array:', pdfArray.toString());

    return cloned;
  };

  private copyStream = (pdfStream: PDFStream): PDFStream => {
    if (this.traversedObjects.has(pdfStream)) {
      return this.traversedObjects.get(pdfStream) as PDFStream;
    }

    const cloned = pdfStream.clone(this.to);
    this.traversedObjects.set(pdfStream, cloned);

    new Map(cloned.dictionary.map).forEach((value, key) => {
      if (value instanceof PDFDictionary) {
        const newDict = this.copyDictionary(value);
        cloned.dictionary.map.set(key, newDict);
      }
      if (value instanceof PDFArray) {
        const newArray = this.copyArray(value);
        cloned.dictionary.map.set(key, newArray);
      }
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
    const x = this.idx++;

    const alreadyMapped = this.mappedRefs.has(ref);

    if (!alreadyMapped) {
      const newRef = this.to.nextObjectNumber();
      this.mappedRefs.set(ref, newRef);

      const dereferencedValue = this.from.lookup(ref);

      let cloned = dereferencedValue;
      if (dereferencedValue instanceof PDFStream) {
        // cloned = dereferencedValue.cloneDeep(this.to);
        // this.copyDictionary(dereferencedValue.dictionary);
        cloned = this.copyStream(dereferencedValue);
      } else
      if (dereferencedValue instanceof PDFDictionary) {
        // cloned = dereferencedValue.cloneDeep(this.to);
        // this.copyDictionary(cloned as PDFDictionary);
        cloned = this.copyDictionary(dereferencedValue);
      } else
      if (dereferencedValue instanceof PDFArray) {
        // cloned = dereferencedValue.cloneDeep(this.to);
        // this.copyArray(cloned as PDFArray);
        cloned = this.copyArray(dereferencedValue);
      } else {
        console.log('UNKNOWN!', cloned.constructor.name);
      }

      // TODO: This probably _needs_ to be done before copying the dereferencedValue...
      // const newRef = this.to.assignNextObjectNumberTo(cloned);
      // this.mappedRefs.set(ref, newRef);

      this.to.assign(newRef, cloned);
    }

    return this.mappedRefs.get(ref)!;
  };
}

export default PDFObjectCopier;

// import { PDFObjectIndex } from 'core/pdf-document';
// import {
//   PDFArray,
//   PDFDictionary,
//   PDFIndirectReference,
//   PDFObject,
//   PDFStream,
// } from 'core/pdf-objects';
// import { error } from 'utils';
//
// class PDFObjectCopier {
//   static for = (src: PDFObjectIndex, dest: PDFObjectIndex) =>
//     new PDFObjectCopier(src, dest);
//
//   private readonly from: PDFObjectIndex;
//   private readonly to: PDFObjectIndex;
//
//   // TODO: Are both of these necessary?
//   private readonly mappedRefs = new Map<
//     PDFIndirectReference,
//     PDFIndirectReference
//   >();
//   private readonly traversedObjects = new Set<PDFObject>();
//
//   constructor(from: PDFObjectIndex, to: PDFObjectIndex) {
//     this.from = from;
//     this.to = to;
//   }
//
//   copy = <T extends PDFObject>(object: T) => {
//     if (object instanceof PDFDictionary) this.copyDictionary(object);
//     else if (object instanceof PDFArray) this.copyArray(object);
//     else error(`Cannot copy object of type: ${object.constructor.name}`);
//   };
//
//   private copyDictionary = (pdfDict: PDFDictionary) => {
//     if (this.traversedObjects.has(pdfDict)) return;
//     this.traversedObjects.add(pdfDict);
//
//     new Map(pdfDict.map).forEach((value, key) => {
//       if (value instanceof PDFDictionary) this.copyDictionary(value);
//       if (value instanceof PDFArray) this.copyArray(value);
//       if (value instanceof PDFIndirectReference) {
//         const newRef = this.copyIndirectObject(value);
//         pdfDict.map.set(key, newRef);
//       }
//     });
//   };
//
//   private copyArray = (pdfArray: PDFArray) => {
//     if (this.traversedObjects.has(pdfArray)) return;
//     this.traversedObjects.add(pdfArray);
//
//     pdfArray.forEach((value, idx) => {
//       if (value instanceof PDFDictionary) this.copyDictionary(value);
//       if (value instanceof PDFArray) this.copyArray(value);
//       if (value instanceof PDFIndirectReference) {
//         const newRef = this.copyIndirectObject(value);
//         pdfArray.array[idx] = newRef;
//       }
//     });
//   };
//
//   private copyIndirectObject = (
//     ref: PDFIndirectReference,
//   ): PDFIndirectReference => {
//     const alreadyMapped = this.mappedRefs.has(ref);
//
//     if (!alreadyMapped) {
//       const dereferencedValue = this.from.lookup(ref);
//
//       console.log('Found a ', dereferencedValue.constructor.name);
//
//       const newRef = this.to.assignNextObjectNumberTo(dereferencedValue);
//       this.mappedRefs.set(ref, newRef);
//
//       if (dereferencedValue instanceof PDFStream) {
//         this.copyDictionary(dereferencedValue.dictionary);
//       }
//       if (dereferencedValue instanceof PDFDictionary) {
//         this.copyDictionary(dereferencedValue);
//       }
//       if (dereferencedValue instanceof PDFArray) {
//         this.copyArray(dereferencedValue);
//       }
//     }
//
//     return this.mappedRefs.get(ref)!;
//   };
// }

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

// export default PDFObjectCopier;
