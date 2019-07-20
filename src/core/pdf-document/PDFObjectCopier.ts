import { PDFObjectIndex } from 'core/pdf-document';
import {
  PDFArray,
  PDFDictionary,
  PDFIndirectReference,
  PDFObject,
  PDFStream,
} from 'core/pdf-objects';
import { PDFPage } from 'core/pdf-structures';

/**
 * PDFObjectCopier copies PDFObjects from a src index to a dest index.
 * The primary use case for this is to copy pages between PDFs.
 *
 * _Copying_ an object with a PDFObjectCopier is different from _cloning_ an
 * object with its [[PDFObject.clone]] method:
 *
 * ```
 *   const origObject = ...
 *   const copiedObject = PDFObjectCopier.for(srcIndex, destIndex).copy(origObject);
 *   const clonedObject = originalObject.clone();
 * ```
 *
 * Copying an object is equivalent to cloning it and then copying over any other
 * objects that it references. Note that only dictionaries, arrays, and streams
 * (or structures build from them) can contain indirect references to other
 * objects. Copying a PDFObject that is not a dictionary, array, or stream is
 * supported, but is equivalent to cloning it.
 */
class PDFObjectCopier {
  static for = (srcIndex: PDFObjectIndex, destIndex: PDFObjectIndex) =>
    new PDFObjectCopier(srcIndex, destIndex);

  private readonly src: PDFObjectIndex;
  private readonly dest: PDFObjectIndex;
  private readonly traversedObjects = new Map<PDFObject, PDFObject>();

  constructor(srcIndex: PDFObjectIndex, destIndex: PDFObjectIndex) {
    this.src = srcIndex;
    this.dest = destIndex;
  }

  // prettier-ignore
  copy = <T extends PDFObject>(object: T): T => (
      object instanceof PDFPage              ? this.copyPDFPage(object)
    : object instanceof PDFDictionary        ? this.copyPDFDict(object)
    : object instanceof PDFArray             ? this.copyPDFArray(object)
    : object instanceof PDFStream            ? this.copyPDFStream(object)
    : object instanceof PDFIndirectReference ? this.copyPDFIndirectObject(object)
    : object.clone()
  ) as T;

  private copyPDFPage = (originalPage: PDFPage): PDFPage => {
    const clonedPage = originalPage.clone() as PDFPage;

    // Move any entries that the originalPage is inheriting from its parent
    // tree nodes directly into originalPage so they are preserved during
    // the copy.
    if (clonedPage.getMaybe('Parent')) {
      clonedPage.Parent.ascend((parentNode) => {
        PDFPage.INHERITABLE_ENTRIES.forEach((key) => {
          if (!clonedPage.getMaybe(key) && parentNode.getMaybe(key)) {
            clonedPage.set(key, parentNode.get(key));
          }
        });
      }, true);
    }

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
    clonedDict.index = this.dest;
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
    clonedArray.index = this.dest;
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
    clonedStream.dictionary.index = this.dest;
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
      const newRef = this.dest.nextObjectNumber();
      this.traversedObjects.set(ref, newRef);

      const dereferencedValue = this.src.lookup(ref);
      const cloned = this.copy(dereferencedValue);

      this.dest.assign(newRef, cloned);
    }

    return this.traversedObjects.get(ref) as PDFIndirectReference;
  };
}

export default PDFObjectCopier;
