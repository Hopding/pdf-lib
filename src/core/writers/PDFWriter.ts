import { defaultDocumentSnapshot } from '../../api/snapshot';
import type { DocumentSnapshot } from '../../api/snapshot';
import PDFCrossRefSection from '../document/PDFCrossRefSection';
import PDFHeader from '../document/PDFHeader';
import PDFTrailer from '../document/PDFTrailer';
import PDFTrailerDict from '../document/PDFTrailerDict';
import PDFDict from '../objects/PDFDict';
import PDFObject from '../objects/PDFObject';
import PDFRef from '../objects/PDFRef';
import PDFContext from '../PDFContext';
import PDFObjectStream from '../structures/PDFObjectStream';
import CharCodes from '../syntax/CharCodes';
import { copyStringIntoBuffer, waitForTick } from '../../utils';
import PDFNumber from '../objects/PDFNumber';
import PDFSecurity from '../security/PDFSecurity';
import PDFStream from '../objects/PDFStream';
import PDFName from '../objects/PDFName';
import PDFRawStream from '../objects/PDFRawStream';
import { isPDFInstance, PDFClasses } from '../../api/objects';

export interface SerializationInfo {
  size: number;
  header: PDFHeader;
  indirectObjects: [PDFRef, PDFObject][];
  xref?: PDFCrossRefSection;
  trailerDict?: PDFTrailerDict;
  trailer: PDFTrailer;
}

class PDFWriter {
  static className = () => PDFClasses.PDFWriter;
  myClass(): PDFClasses {
    return PDFClasses.PDFWriter;
  }
  static forContext = (context: PDFContext, objectsPerTick: number) =>
    new PDFWriter(context, objectsPerTick, defaultDocumentSnapshot);

  static forContextWithSnapshot = (
    context: PDFContext,
    objectsPerTick: number,
    snapshot: DocumentSnapshot,
  ) => new PDFWriter(context, objectsPerTick, snapshot);

  protected readonly context: PDFContext;

  protected readonly objectsPerTick: number;
  protected readonly snapshot: DocumentSnapshot;
  private parsedObjects = 0;

  protected constructor(
    context: PDFContext,
    objectsPerTick: number,
    snapshot: DocumentSnapshot,
  ) {
    this.context = context;
    this.objectsPerTick = objectsPerTick;
    this.snapshot = snapshot;
  }

  /**
   * If PDF has an XRef Stream, then the last object will be probably be skipped on saving.
   * If that's the case, this property will have that object number, and the PDF /Size can
   * be corrected, to be accurate.
   */
  protected _largestSkippedObjectNum: number = 0;

  /**
   * Used to check wheter an object should be saved or not, preserves the object number of the
   * last XRef Stream object, if there is one.
   */
  protected _lastXRefObjectNumber: number = 0;
  /**
   * For incremental saves, defers the decision to the snapshot.
   * For full saves, checks that the object is not the last XRef stream object.
   * @param {boolean} incremental If making an incremental save, or a full save of the PDF
   * @param {number} objNum Object number
   * @param {[PDFRef, PDFObject][]} objects List of objects that form the PDF
   * @returns {boolean} whether the object should be saved or not
   */
  protected shouldSave(
    incremental: boolean,
    objNum: number,
    objects: [PDFRef, PDFObject][],
  ): boolean {
    let should = true;
    if (incremental) {
      should = this.snapshot.shouldSave(objNum);
    } else {
      // only the last XRef Stream will be regenerated on save
      if (!this._lastXRefObjectNumber) {
        // if no XRef Stream, then nothing should be skipped
        // if we are adding a XRef Stream, then its number if this.context.largestObjectNumber + 1, so adding 10 ensures we won't skip current generade XRref Stream
        this._lastXRefObjectNumber = this.context.largestObjectNumber + 10;
        const checkWatermark = this._lastXRefObjectNumber - 20; // max number of objects in the final part of the PDF to check
        // search the last XRef Stream, if there is one, objects are expected to be in object number order
        for (let idx = objects.length - 1; idx > 0; idx--) {
          // if not in last 'rangeToCheck' objects, there is none that should be skipped, most probably a linearized PDF, or without XRef Streams
          if (objects[idx][0].objectNumber < checkWatermark) break;
          const object = objects[idx][1];
          if (
            isPDFInstance(object, PDFClasses.PDFRawStream) &&
            (object as PDFRawStream).dict.lookup(PDFName.of('Type')) ===
              PDFName.of('XRef')
          ) {
            this._lastXRefObjectNumber = objects[idx][0].objectNumber;
            break;
          }
        }
      }
      should = objNum !== this._lastXRefObjectNumber;
    }
    if (!should && this._largestSkippedObjectNum < objNum)
      this._largestSkippedObjectNum = objNum;
    return should;
  }

  async serializeToBuffer(): Promise<Uint8Array> {
    const incremental = !isPDFInstance(
      this.snapshot,
      PDFClasses.DefaultDocumentSnapshot,
    );
    const { size, header, indirectObjects, xref, trailerDict, trailer } =
      await this.computeBufferSize(incremental);

    let offset = 0;
    const buffer = new Uint8Array(size);

    if (!incremental) {
      offset += header.copyBytesInto(buffer, offset);
      buffer[offset++] = CharCodes.Newline;
    }
    buffer[offset++] = CharCodes.Newline;

    for (let idx = 0, len = indirectObjects.length; idx < len; idx++) {
      const [ref, object] = indirectObjects[idx];

      if (!this.shouldSave(incremental, ref.objectNumber, indirectObjects)) {
        continue;
      }

      const objectNumber = String(ref.objectNumber);
      offset += copyStringIntoBuffer(objectNumber, buffer, offset);
      buffer[offset++] = CharCodes.Space;

      const generationNumber = String(ref.generationNumber);
      offset += copyStringIntoBuffer(generationNumber, buffer, offset);
      buffer[offset++] = CharCodes.Space;

      buffer[offset++] = CharCodes.o;
      buffer[offset++] = CharCodes.b;
      buffer[offset++] = CharCodes.j;
      buffer[offset++] = CharCodes.Newline;

      offset += object.copyBytesInto(buffer, offset);

      buffer[offset++] = CharCodes.Newline;
      buffer[offset++] = CharCodes.e;
      buffer[offset++] = CharCodes.n;
      buffer[offset++] = CharCodes.d;
      buffer[offset++] = CharCodes.o;
      buffer[offset++] = CharCodes.b;
      buffer[offset++] = CharCodes.j;
      buffer[offset++] = CharCodes.Newline;
      buffer[offset++] = CharCodes.Newline;

      const n = isPDFInstance(object, PDFClasses.PDFObjectStream)
        ? (object as PDFObjectStream).getObjectsCount()
        : 1;
      if (this.shouldWaitForTick(n)) await waitForTick();
    }

    if (xref) {
      offset += xref.copyBytesInto(buffer, offset);
      buffer[offset++] = CharCodes.Newline;
    }

    if (trailerDict) {
      offset += trailerDict.copyBytesInto(buffer, offset);
      buffer[offset++] = CharCodes.Newline;
      buffer[offset++] = CharCodes.Newline;
    }

    offset += trailer.copyBytesInto(buffer, offset);

    return buffer;
  }

  protected computeIndirectObjectSize([ref, object]: [
    PDFRef,
    PDFObject,
  ]): number {
    const refSize = ref.sizeInBytes() + 3; // 'R' -> 'obj\n'
    const objectSize = object.sizeInBytes() + 9; // '\nendobj\n\n'
    return refSize + objectSize;
  }

  protected createTrailerDict(prevStartXRef?: number): PDFDict {
    /**
     * if last object (XRef Stream) is not in the output, then size is one less.
     * An XRef Stream object should always be the largest object number in PDF
     */
    const size =
      this.context.largestObjectNumber +
      (this._largestSkippedObjectNum === this.context.largestObjectNumber
        ? 0
        : 1);
    return this.context.obj({
      Size: size,
      Root: this.context.trailerInfo.Root,
      Encrypt: this.context.trailerInfo.Encrypt,
      Info: this.context.trailerInfo.Info,
      ID: this.context.trailerInfo.ID,
      Prev: prevStartXRef ? PDFNumber.of(prevStartXRef) : undefined,
    });
  }

  protected async computeBufferSize(
    incremental: boolean,
  ): Promise<SerializationInfo> {
    this._largestSkippedObjectNum = 0;
    this._lastXRefObjectNumber = 0;
    const header = PDFHeader.forVersion(1, 7);

    let size = this.snapshot.pdfSize;
    if (!incremental) {
      size += header.sizeInBytes() + 1;
    }
    size += 1;

    const xref = PDFCrossRefSection.create();

    const security = this.context.security;

    const indirectObjects = this.context.enumerateIndirectObjects();

    for (let idx = 0, len = indirectObjects.length; idx < len; idx++) {
      const indirectObject = indirectObjects[idx];
      const [ref, object] = indirectObject;
      if (!this.shouldSave(incremental, ref.objectNumber, indirectObjects))
        continue;
      if (security) this.encrypt(ref, object, security);
      xref.addEntry(ref, size);
      size += this.computeIndirectObjectSize(indirectObject);
      if (this.shouldWaitForTick(1)) await waitForTick();
    }
    // deleted objects
    for (let idx = 0; idx < this.snapshot.deletedCount; idx++) {
      const dref = this.snapshot.deletedRef(idx);
      if (!dref) break;
      const nextdref = this.snapshot.deletedRef(idx + 1);
      // add 1 to generation number for deleted ref
      xref.addDeletedEntry(
        PDFRef.of(dref.objectNumber, dref.generationNumber + 1),
        nextdref ? nextdref.objectNumber : 0,
      );
    }

    const xrefOffset = size;
    size += xref.sizeInBytes() + 1; // '\n'

    const trailerDict = PDFTrailerDict.of(
      this.createTrailerDict(this.snapshot.prevStartXRef),
    );
    size += trailerDict.sizeInBytes() + 2; // '\n\n'

    const trailer = PDFTrailer.forLastCrossRefSectionOffset(xrefOffset);
    size += trailer.sizeInBytes();
    size -= this.snapshot.pdfSize;

    return { size, header, indirectObjects, xref, trailerDict, trailer };
  }

  protected encrypt(ref: PDFRef, object: PDFObject, security: PDFSecurity) {
    if (isPDFInstance(object, PDFClasses.PDFStream)) {
      const encryptFn = security.getEncryptFn(
        ref.objectNumber,
        ref.generationNumber,
      );
      const unencryptedContents = (object as PDFStream).getContents();
      const encryptedContents = encryptFn(unencryptedContents);
      (object as PDFStream).updateContents(encryptedContents);
    }
  }

  protected shouldWaitForTick = (n: number) => {
    this.parsedObjects += n;
    return this.parsedObjects % this.objectsPerTick === 0;
  };
}

export default PDFWriter;
