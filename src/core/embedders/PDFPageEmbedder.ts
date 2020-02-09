import PDFDocument from 'src/api/PDFDocument';
import PDFPage from 'src/api/PDFPage';
import PDFRawStream from 'src/core/objects/PDFRawStream';
import PDFRef from 'src/core/objects/PDFRef';
import PDFStream from 'src/core/objects/PDFStream';
import PDFContext from 'src/core/PDFContext';
import PDFObjectCopier from 'src/core/PDFObjectCopier';
import { decodePDFRawStream } from 'src/core/streams/decode';
import PDFContentStream from 'src/core/structures/PDFContentStream';
import { mergeIntoTypedArray } from 'src/utils';

/**
 * Represents a page bounding box.
 * Usually `left` and `bottom` are 0 and right, top are equal
 * to width, height if you want to clip to the whole page.
 *
 *       y
 *       ^
 *       | +--------+ (width,height)
 *       | |        |
 *       | |  Page  |
 *       | |        |
 *       | |        |
 * (0,0) | +--------+
 *       +----------> x
 */
export interface BoundingBox {
  left: number /** The left of the bounding box */;
  bottom: number /** The bottom of the bounding box */;
  right: number /** The right of the bounding box */;
  top: number /** The top of the bounding box */;
}

export type TransformationMatrix = [
  number,
  number,
  number,
  number,
  number,
  number,
];
export const identityMatrix: TransformationMatrix = [1, 0, 0, 1, 0, 0];

/**
 * A note of thanks to the developers of https://github.com/galkahana/PDF-Writer/, as
 * this class borrows from their PDF embedding code.
 */
class PDFPageEmbedder {
  static async forDocument(document: PDFDocument, pageIndex?: number) {
    return new PDFPageEmbedder(document.getPages()[pageIndex || 0]);
  }

  static async forPage(
    page: PDFPage,
    boundingBox?: BoundingBox,
    transformationMatrix?: TransformationMatrix,
  ) {
    return new PDFPageEmbedder(page, boundingBox, transformationMatrix);
  }

  readonly boundingBox: BoundingBox;
  readonly transformationMatrix: TransformationMatrix;
  readonly width: number;
  readonly height: number;

  private readonly page: PDFPage;

  private constructor(
    page: PDFPage,
    boundingBox?: BoundingBox,
    transformationMatrix?: TransformationMatrix,
  ) {
    this.page = page;

    if (!boundingBox) {
      const { width, height } = page.getSize();
      this.boundingBox = {
        left: 0,
        bottom: 0,
        right: width,
        top: height,
      };
    } else {
      this.boundingBox = boundingBox;
    }
    this.width = this.boundingBox.right;
    this.height = this.boundingBox.top;

    if (!transformationMatrix) {
      this.transformationMatrix = identityMatrix;
    } else {
      this.transformationMatrix = transformationMatrix;
    }
  }

  async embedIntoContext(context: PDFContext, ref?: PDFRef): Promise<PDFRef> {
    const { left, bottom, right, top } = this.boundingBox;
    const bbox = [left, bottom, right, top];

    const copier = PDFObjectCopier.for(this.page.doc.context, context);
    const copiedPage = copier.copy(this.page.node);
    const { Contents, Resources } = copiedPage.normalizedEntries();

    if (!Contents) throw new Error('Missing page.Contents!');

    const decodedContents: Uint8Array[] = new Array(Contents.size());
    for (let idx = 0, len = Contents.size(); idx < len; idx++) {
      const stream = Contents.lookup(idx, PDFStream);
      if (stream instanceof PDFRawStream) {
        decodedContents[idx] = decodePDFRawStream(stream).decode();
      } else if (stream instanceof PDFContentStream) {
        decodedContents[idx] = stream.getUnencodedContents();
      } else {
        throw new Error(`Unrecognized stream type: ${stream.constructor.name}`);
      }
    }

    // TODO: Should probably insert a newline in between each content array when
    // merging them, just to be safe
    const mergedContents = mergeIntoTypedArray(...decodedContents);

    const xObject = context.stream(mergedContents, {
      Type: 'XObject',
      Subtype: 'Form',
      FormType: 1,
      BBox: bbox,
      Matrix: this.transformationMatrix,
      // do we want to handle transparency?
      // https://github.com/galkahana/PDF-Writer/blob/edb7478dce955dfab61bbc2219a1ca7b85bed924/PDFWriter/DocumentContext.cpp#L992
      Resources,
    });

    if (ref) {
      context.assign(ref, xObject);
      return ref;
    } else {
      return context.register(xObject);
    }
  }
}

export default PDFPageEmbedder;
