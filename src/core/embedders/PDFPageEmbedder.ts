import PDFPage from 'src/api/PDFPage';
import PDFArray from 'src/core/objects/PDFArray';
import PDFRawStream from 'src/core/objects/PDFRawStream';
import PDFRef from 'src/core/objects/PDFRef';
import PDFStream from 'src/core/objects/PDFStream';
import PDFContext from 'src/core/PDFContext';
import PDFObjectCopier from 'src/core/PDFObjectCopier';
import { decodePDFRawStream } from 'src/core/streams/decode';
import PDFContentStream from 'src/core/structures/PDFContentStream';
import PDFPageLeaf from 'src/core/structures/PDFPageLeaf';
import CharCodes from 'src/core/syntax/CharCodes';
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

/**
 * A transformation matrix according to section `8.3.3 Common Transformations`
 * of the PDF specification (page 117f). To cite from the spec:
 *
 *   * Translations shall be specified as `[1 0 0 1 tx ty]`, where `tx` and `ty` shall
 *     be the distances to translate the origin of the coordinate system in the
 *     horizontal and vertical dimensions, respectively.
 *   * Scaling shall be obtained by `[sx 0 0 sy 0 0]`. This scales the coordinates
 *     so that 1 unit in the horizontal and vertical dimensions of the new
 *     coordinate system is the same size as `sx` and `sy` units, respectively, in
 *     the previous coordinate system.
 *   * Rotations shall be produced by `[cos(q) sin(q) -sin(q) cos(q) 0 0]`, which has
 *     the effect of rotating the coordinate system axes by an angle `q` counter clockwise.
 *   * Skew shall be specified by `[1 tan(a) tan(b) 1 0 0]`,which skews the x-axis by an
 *     angle `a` and the y axis by an angle `b`.
 */
export type TransformationMatrix = [
  number,
  number,
  number,
  number,
  number,
  number,
];
export const identityMatrix: TransformationMatrix = [1, 0, 0, 1, 0, 0];

const embeddablePage = (
  sourcePage: PDFPage,
  targetContext: PDFContext,
  copier: PDFObjectCopier,
): PDFPageLeaf =>
  sourcePage.doc.context === targetContext
    ? sourcePage.node
    : copier.copy(sourcePage.node);

class PDFPageEmbedder {
  static async for(
    page: PDFPage,
    copier: PDFObjectCopier,
    boundingBox?: BoundingBox,
    transformationMatrix?: TransformationMatrix,
  ) {
    return new PDFPageEmbedder(page, copier, boundingBox, transformationMatrix);
  }

  readonly boundingBox: BoundingBox;
  readonly transformationMatrix: TransformationMatrix;

  private readonly page: PDFPage;
  private readonly copier: PDFObjectCopier;

  private constructor(
    page: PDFPage,
    copier: PDFObjectCopier,
    boundingBox?: BoundingBox,
    transformationMatrix?: TransformationMatrix,
  ) {
    this.page = page;
    this.copier = copier;
    this.boundingBox = boundingBox || this.fullPageBoundingBox(page);
    this.transformationMatrix = transformationMatrix || identityMatrix;
  }

  async embedIntoContext(context: PDFContext, ref?: PDFRef): Promise<PDFRef> {
    const page = embeddablePage(this.page, context, this.copier);
    const { Contents, Resources } = page.normalizedEntries();

    if (!Contents) throw new Error('Missing page.Contents!');
    const decodedContents = this.decodeContents(Contents);

    const { left, bottom, right, top } = this.boundingBox;
    const xObject = context.stream(decodedContents, {
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
        throw new Error(`Unrecognized stream type: ${stream.constructor.name}`);
      }

      decodedContents.push(content, newline);
    }

    return mergeIntoTypedArray(...decodedContents);
  }

  private fullPageBoundingBox(page: PDFPage) {
    const { width, height } = page.getSize();
    return {
      left: 0,
      bottom: 0,
      right: width,
      top: height,
    };
  }
}

export default PDFPageEmbedder;
