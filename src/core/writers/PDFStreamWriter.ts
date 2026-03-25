import { defaultDocumentSnapshot } from '../../api/snapshot';
import type { DocumentSnapshot } from '../../api/snapshot';
import PDFHeader from '../document/PDFHeader';
import PDFTrailer from '../document/PDFTrailer';
import PDFName from '../objects/PDFName';
import PDFNumber from '../objects/PDFNumber';
import PDFObject from '../objects/PDFObject';
import PDFRef from '../objects/PDFRef';
import PDFContext from '../PDFContext';
import PDFCrossRefStream from '../structures/PDFCrossRefStream';
import PDFObjectStream from '../structures/PDFObjectStream';
import PDFWriter from '../writers/PDFWriter';
import { last, waitForTick } from '../../utils';
import PDFDict from '../objects/PDFDict';
import { isPDFInstance, PDFClasses } from '../../api/objects';

class PDFStreamWriter extends PDFWriter {
  static className = () => PDFClasses.PDFStreamWriter;
  myClass(): PDFClasses {
    return PDFClasses.PDFStreamWriter;
  }
  static forContext = (
    context: PDFContext,
    objectsPerTick: number,
    encodeStreams = true,
    objectsPerStream = 50,
  ) =>
    new PDFStreamWriter(
      context,
      objectsPerTick,
      defaultDocumentSnapshot,
      encodeStreams,
      objectsPerStream,
    );

  static forContextWithSnapshot = (
    context: PDFContext,
    objectsPerTick: number,
    snapshot: DocumentSnapshot,
    encodeStreams = true,
    objectsPerStream = 50,
  ) =>
    new PDFStreamWriter(
      context,
      objectsPerTick,
      snapshot,
      encodeStreams,
      objectsPerStream,
    );

  private readonly encodeStreams: boolean;
  private readonly objectsPerStream: number;

  private constructor(
    context: PDFContext,
    objectsPerTick: number,
    snapshot: DocumentSnapshot,
    encodeStreams: boolean,
    objectsPerStream: number,
  ) {
    super(context, objectsPerTick, snapshot);

    this.encodeStreams = encodeStreams;
    this.objectsPerStream = objectsPerStream;
  }

  // the process of saving uses references numbers, and creates a new indirect object, that has to be deleted after saving
  private _refToDeleteAfterSave = 0;
  protected async computeBufferSize(incremental: boolean) {
    this._refToDeleteAfterSave = 0;
    const header = PDFHeader.forVersion(1, 7);

    let size = this.snapshot.pdfSize;
    if (!incremental) {
      size += header.sizeInBytes() + 1;
    }
    size += 1;

    const xrefStream = PDFCrossRefStream.create(
      this.createTrailerDict(),
      this.encodeStreams,
    );

    const uncompressedObjects: [PDFRef, PDFObject][] = [];
    const compressedObjects: [PDFRef, PDFObject][][] = [];
    const objectStreamRefs: PDFRef[] = [];

    const security = this.context.security;

    const indirectObjects = this.context.enumerateIndirectObjects();
    for (let idx = 0, len = indirectObjects.length; idx < len; idx++) {
      const indirectObject = indirectObjects[idx];
      const [ref, object] = indirectObject;
      if (!this.shouldSave(incremental, ref.objectNumber, indirectObjects)) {
        continue;
      }

      const shouldNotCompress =
        ref === this.context.trailerInfo.Encrypt ||
        isPDFInstance(object, PDFClasses.PDFStream) ||
        isPDFInstance(object, PDFClasses.PDFInvalidObject) ||
        isPDFInstance(object, PDFClasses.PDFCatalog) ||
        isPDFInstance(object, PDFClasses.PDFPageTree) ||
        isPDFInstance(object, PDFClasses.PDFPageLeaf) ||
        ref.generationNumber !== 0 ||
        (isPDFInstance(object, PDFClasses.PDFDict) &&
          (object as PDFDict).lookup(PDFName.of('Type')) === PDFName.of('Sig'));

      if (shouldNotCompress) {
        uncompressedObjects.push(indirectObject);
        if (security) this.encrypt(ref, object, security);
        xrefStream.addUncompressedEntry(ref, size);
        size += this.computeIndirectObjectSize(indirectObject);
        if (this.shouldWaitForTick(1)) await waitForTick();
      } else {
        let chunk = last(compressedObjects);
        let objectStreamRef = last(objectStreamRefs);
        if (!chunk || chunk.length % this.objectsPerStream === 0) {
          chunk = [];
          compressedObjects.push(chunk);
          objectStreamRef = this.context.nextRef();
          this._refToDeleteAfterSave += 1;
          objectStreamRefs.push(objectStreamRef);
        }
        xrefStream.addCompressedEntry(ref, objectStreamRef, chunk.length);
        chunk.push(indirectObject);
      }
    }

    for (let idx = 0, len = compressedObjects.length; idx < len; idx++) {
      const chunk = compressedObjects[idx];
      const ref = objectStreamRefs[idx];

      const objectStream = PDFObjectStream.withContextAndObjects(
        this.context,
        chunk,
        this.encodeStreams,
      );
      this.context.assign(ref, objectStream);

      if (security) this.encrypt(ref, objectStream, security);

      xrefStream.addUncompressedEntry(ref, size);
      size += this.computeIndirectObjectSize([ref, objectStream]);

      uncompressedObjects.push([ref, objectStream]);

      if (this.shouldWaitForTick(chunk.length)) await waitForTick();
    }

    const xrefStreamRef = this.context.nextRef();
    this._refToDeleteAfterSave += 1;
    xrefStream.dict.set(
      PDFName.of('Size'),
      PDFNumber.of(this.context.largestObjectNumber + 1),
    );
    if (this.snapshot.prevStartXRef) {
      xrefStream.dict.set(
        PDFName.of('Prev'),
        PDFNumber.of(this.snapshot.prevStartXRef),
      );
    }
    xrefStream.addUncompressedEntry(xrefStreamRef, size);
    const xrefOffset = size;
    size += this.computeIndirectObjectSize([xrefStreamRef, xrefStream]);

    uncompressedObjects.push([xrefStreamRef, xrefStream]);

    const trailer = PDFTrailer.forLastCrossRefSectionOffset(xrefOffset);
    size += trailer.sizeInBytes();
    size -= this.snapshot.pdfSize;

    return { size, header, indirectObjects: uncompressedObjects, trailer };
  }

  override async serializeToBuffer(): Promise<Uint8Array> {
    const buffer = await super.serializeToBuffer();
    // delete xref stream created for saving
    this.context.delete(PDFRef.of(this.context.largestObjectNumber - 1));
    // fix largestObjectNumbering
    this.context.largestObjectNumber -= this._refToDeleteAfterSave;
    return buffer;
  }
}

export default PDFStreamWriter;
