import PDFArray from 'src/core/objects/PDFArray';
import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFObject from 'src/core/objects/PDFObject';
import PDFRef from 'src/core/objects/PDFRef';
import PDFStream from 'src/core/objects/PDFStream';
import PDFContext from 'src/core/PDFContext';
import PDFPageLeaf from 'src/core/structures/PDFPageLeaf';

/**
 * PDFObjectCopier copies PDFObjects from a src context to a dest context.
 * The primary use case for this is to copy pages between PDFs.
 *
 * _Copying_ an object with a PDFObjectCopier is different from _cloning_ an
 * object with its [[PDFObject.clone]] method:
 *
 * ```
 *   const src: PDFContext = ...
 *   const dest: PDFContext = ...
 *   const originalObject: PDFObject = ...
 *   const copiedObject = PDFObjectCopier.for(src, dest).copy(originalObject);
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
  static for = (src: PDFContext, dest: PDFContext) =>
    new PDFObjectCopier(src, dest);

  private readonly src: PDFContext;
  private readonly dest: PDFContext;
  private readonly traversedObjects = new Map<PDFObject, PDFObject>();

  private constructor(src: PDFContext, dest: PDFContext) {
    this.src = src;
    this.dest = dest;
  }

  // prettier-ignore
  copy = <T extends PDFObject>(object: T): T => (
      object instanceof PDFPageLeaf ? this.copyPDFPage(object)
    : object instanceof PDFDict     ? this.copyPDFDict(object)
    : object instanceof PDFArray    ? this.copyPDFArray(object)
    : object instanceof PDFStream   ? this.copyPDFStream(object)
    : object instanceof PDFRef      ? this.copyPDFIndirectObject(object)
    : object.clone()
  ) as T;

  private copyPDFPage = (originalPage: PDFPageLeaf): PDFPageLeaf => {
    const clonedPage = originalPage.clone();

    // Move any entries that the originalPage is inheriting from its parent
    // tree nodes directly into originalPage so they are preserved during
    // the copy.
    const { InheritableEntries } = PDFPageLeaf;
    for (let idx = 0, len = InheritableEntries.length; idx < len; idx++) {
      const key = PDFName.of(InheritableEntries[idx]);
      const value = clonedPage.getInheritableAttribute(key)!;
      if (!clonedPage.get(key) && value) clonedPage.set(key, value);
    }

    // Remove the parent reference to prevent the whole donor document's page
    // tree from being copied when we only need a single page.
    clonedPage.delete(PDFName.of('Parent'));

    return this.copyPDFDict(clonedPage) as PDFPageLeaf;
  };

  private copyPDFDict = (originalDict: PDFDict): PDFDict => {
    if (this.traversedObjects.has(originalDict)) {
      return this.traversedObjects.get(originalDict) as PDFDict;
    }

    const clonedDict = originalDict.clone(this.dest);
    this.traversedObjects.set(originalDict, clonedDict);

    const entries = originalDict.entries();

    for (let idx = 0, len = entries.length; idx < len; idx++) {
      const [key, value] = entries[idx];
      clonedDict.set(key, this.copy(value));
    }

    return clonedDict;
  };

  private copyPDFArray = (originalArray: PDFArray): PDFArray => {
    if (this.traversedObjects.has(originalArray)) {
      return this.traversedObjects.get(originalArray) as PDFArray;
    }

    const clonedArray = originalArray.clone(this.dest);
    this.traversedObjects.set(originalArray, clonedArray);

    for (let idx = 0, len = originalArray.size(); idx < len; idx++) {
      const value = originalArray.get(idx);
      clonedArray.set(idx, this.copy(value));
    }

    return clonedArray;
  };

  private copyPDFStream = (originalStream: PDFStream): PDFStream => {
    if (this.traversedObjects.has(originalStream)) {
      return this.traversedObjects.get(originalStream) as PDFStream;
    }

    const clonedStream = originalStream.clone(this.dest);
    this.traversedObjects.set(originalStream, clonedStream);

    const entries = originalStream.dict.entries();
    for (let idx = 0, len = entries.length; idx < len; idx++) {
      const [key, value] = entries[idx];
      clonedStream.dict.set(key, this.copy(value));
    }

    return clonedStream;
  };

  private copyPDFIndirectObject = (ref: PDFRef): PDFRef => {
    const alreadyMapped = this.traversedObjects.has(ref);

    if (!alreadyMapped) {
      const newRef = this.dest.nextRef();
      this.traversedObjects.set(ref, newRef);

      const dereferencedValue = this.src.lookup(ref);
      if (dereferencedValue) {
        const cloned = this.copy(dereferencedValue);
        this.dest.assign(newRef, cloned);
      }
    }

    return this.traversedObjects.get(ref) as PDFRef;
  };
}

export default PDFObjectCopier;
