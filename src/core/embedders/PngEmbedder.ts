import PDFRef from 'src/core/objects/PDFRef';
import PDFContext from 'src/core/PDFContext';
import { PNG } from 'src/utils/png';

/**
 * A note of thanks to the developers of https://github.com/foliojs/pdfkit, as
 * this class borrows from:
 *   https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/png.coffee
 */
class PngEmbedder {
  static async for(imageData: Uint8Array) {
    const png = PNG.load(imageData);
    return new PngEmbedder(png);
  }

  readonly bitsPerComponent: number;
  readonly height: number;
  readonly width: number;
  readonly colorSpace: 'DeviceRGB';

  private readonly image: PNG;

  private constructor(png: PNG) {
    this.image = png;
    this.bitsPerComponent = png.bitsPerComponent;
    this.width = png.width;
    this.height = png.height;
    this.colorSpace = 'DeviceRGB';
  }

  async embedIntoContext(context: PDFContext, ref?: PDFRef): Promise<PDFRef> {
    const SMask = this.embedAlphaChannel(context);

    const xObject = context.flateStream(this.image.rgbChannel, {
      Type: 'XObject',
      Subtype: 'Image',
      BitsPerComponent: this.image.bitsPerComponent,
      Width: this.image.width,
      Height: this.image.height,
      ColorSpace: this.colorSpace,
      SMask,
    });

    if (ref) {
      context.assign(ref, xObject);
      return ref;
    } else {
      return context.register(xObject);
    }
  }

  private embedAlphaChannel(context: PDFContext): PDFRef | undefined {
    if (!this.image.alphaChannel) return undefined;

    const xObject = context.flateStream(this.image.alphaChannel, {
      Type: 'XObject',
      Subtype: 'Image',
      Height: this.image.height,
      Width: this.image.width,
      BitsPerComponent: this.image.bitsPerComponent,
      ColorSpace: 'DeviceGray',
      Decode: [0, 1],
    });

    return context.register(xObject);
  }
}

export default PngEmbedder;
