import {
  MissingPageContentsEmbeddingError,
  UnrecognizedStreamTypeError,
} from 'src/core/errors';
import PDFArray from 'src/core/objects/PDFArray';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFRawStream from 'src/core/objects/PDFRawStream';
import PDFRef from 'src/core/objects/PDFRef';
import PDFStream from 'src/core/objects/PDFStream';
import PDFContext from 'src/core/PDFContext';
import { decodePDFRawStream } from 'src/core/streams/decode';
import PDFContentStream from 'src/core/structures/PDFContentStream';
import PDFPageLeaf from 'src/core/structures/PDFPageLeaf';
import CharCodes from 'src/core/syntax/CharCodes';
import { TransformationMatrix } from 'src/types/matrix';
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
export interface PageBoundingBox {
  left: number /** The left of the bounding box */;
  bottom: number /** The bottom of the bounding box */;
  right: number /** The right of the bounding box */;
  top: number /** The top of the bounding box */;
}

const fullPageBoundingBox = (page: PDFPageLeaf) => {
  const mediaBox = page.MediaBox();

  const width =
    mediaBox.lookup(2, PDFNumber).asNumber() -
    mediaBox.lookup(0, PDFNumber).asNumber();

  const height =
    mediaBox.lookup(3, PDFNumber).asNumber() -
    mediaBox.lookup(1, PDFNumber).asNumber();

  return { left: 0, bottom: 0, right: width, top: height };
};

// Returns the identity matrix, modified to position the content of the given
// bounding box at (0, 0).
const boundingBoxAdjustedMatrix = (
  bb: PageBoundingBox,
): TransformationMatrix => [1, 0, 0, 1, -bb.left, -bb.bottom];

class PDFPageEmbedder {
  static async for(
    page: PDFPageLeaf,
    boundingBox?: PageBoundingBox,
    transformationMatrix?: TransformationMatrix,
  ) {
    return new PDFPageEmbedder(page, boundingBox, transformationMatrix);
  }

  readonly width: number;
  readonly height: number;
  readonly boundingBox: PageBoundingBox;
  readonly transformationMatrix: TransformationMatrix;

  private readonly page: PDFPageLeaf;

  private constructor(
    page: PDFPageLeaf,
    boundingBox?: PageBoundingBox,
    transformationMatrix?: TransformationMatrix,
  ) {
    this.page = page;

    const bb = boundingBox ?? fullPageBoundingBox(page);

    this.width = bb.right - bb.left;
    this.height = bb.top - bb.bottom;
    this.boundingBox = bb;
    this.transformationMatrix =
      transformationMatrix ?? boundingBoxAdjustedMatrix(bb);
  }

  async embedIntoContext(context: PDFContext, ref?: PDFRef): Promise<PDFRef> {
    const { Contents, Resources } = this.page.normalizedEntries();

    if (!Contents) throw new MissingPageContentsEmbeddingError();
    const decodedContents = this.decodeContents(Contents);

    const { left, bottom, right, top } = this.boundingBox;
    const xObject = context.flateStream(decodedContents, {
      Type: 'XObject',
      Subtype: 'Form',
      FormType: 1,
      BBox: [left, bottom, right, top],
      Matrix: this.transformationMatrix,
      Resources,
    });

    if (ref) {
      context.assign(ref, xObject);
      return ref;
    } else {
      return context.register(xObject);
    }
  }

  // `contents` is an array of streams which are merged to include them in the XObject.
  // This methods extracts each stream and joins them with a newline character.
  private decodeContents(contents: PDFArray) {
    const newline = Uint8Array.of(CharCodes.Newline);
    const decodedContents: Uint8Array[] = [];

    for (let idx = 0, len = contents.size(); idx < len; idx++) {
      const stream = contents.lookup(idx, PDFStream);

      let content: Uint8Array;
      if (stream instanceof PDFRawStream) {
        content = decodePDFRawStream(stream).decode();
      } else if (stream instanceof PDFContentStream) {
        content = stream.getUnencodedContents();
      } else {
        throw new UnrecognizedStreamTypeError(stream);
      }

      decodedContents.push(content, newline);
    }

    return mergeIntoTypedArray(...decodedContents);
  }
}

export default PDFPageEmbedder;
