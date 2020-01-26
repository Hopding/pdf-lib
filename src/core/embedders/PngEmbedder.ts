import pako from 'pako';
import PNG, { ColorSpace as ColorSpaceType } from 'png-ts';
import UPNG from 'upng-js';

import PDFRef from 'src/core/objects/PDFRef';
import PDFContext from 'src/core/PDFContext';

const getColorSpace = (colorType: number) => {
  if (colorType === 1) return 'DeviceGray';
  if (colorType === 3) return 'DeviceRGB';
  else throw new Error(`Unknown PNG color type: ${colorType}`);
};

/**
 * A note of thanks to the developers of https://github.com/foliojs/pdfkit, as
 * this class borrows from:
 *   https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/png.coffee
 */
class PngEmbedder {
  static async for(imageData: Uint8Array) {
    const image = await PNG.load(imageData);
    const uImage = UPNG.decode(imageData);
    return new PngEmbedder(image, uImage);
  }

  readonly bitsPerComponent: number;
  readonly height: number;
  readonly width: number;
  readonly colorSpace: ColorSpaceType;

  // private readonly image: PNG;
  private readonly uImage: UPNG.Image;
  private imageData: Uint8Array;
  private alphaChannel: Uint8Array | undefined;

  private constructor(png: PNG, upng: UPNG.Image) {
    this.image = png;
    this.uImage = upng;
    this.imageData = this.image.imgData;
    this.alphaChannel = undefined;

    // this.bitsPerComponent = this.image.bits;
    // this.height = this.image.height;
    // this.width = this.image.width;
    // this.colorSpace = this.image.colorSpace;

    this.bitsPerComponent = this.uImage.depth;
    this.height = this.uImage.height;
    this.width = this.uImage.width;
    this.colorSpace = getColorSpace(this.uImage.ctype);
    console.log('C_TYPE:', this.uImage.ctype);

    // TODO: Handle the following two transparency types. They don't seem to be
    // fully handled in:
    // https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/png.coffee
    //
    // if (this.image.transparency.grayscale)
    // if (this.image.transparency.rgb)
  }

  async embedIntoContext(context: PDFContext, ref?: PDFRef): Promise<PDFRef> {
    if (!this.alphaChannel) {
      if (this.image.transparency.indexed) {
        await this.loadIndexedAlphaChannel();
      } else if (this.image.hasAlphaChannel) {
        await this.splitAlphaChannel();
      }
    }

    const SMask = this.embedAlphaChannel(context);

    const { palette } = this.image;

    // let ColorSpace: string | any[] = this.image.colorSpace;
    let ColorSpace: string | any[] = this.colorSpace;
    if (palette.length !== 0) {
      const stream = context.stream(new Uint8Array(palette));
      const streamRef = context.register(stream);
      ColorSpace = ['Indexed', 'DeviceRGB', palette.length / 3 - 1, streamRef];
    }

    let DecodeParms;
    if (!this.image.hasAlphaChannel) {
      DecodeParms = {
        Predictor: 15,
        Colors: this.image.colors,

        // BitsPerComponent: this.image.bits,
        // Columns: this.image.width,
        BitsPerComponent: this.uImage.depth,
        Columns: this.uImage.width,
      };
    }

    const xObject = context.stream(this.imageData, {
      Type: 'XObject',
      Subtype: 'Image',

      // BitsPerComponent: this.image.bits,
      // Width: this.image.width,
      // Height: this.image.height,
      BitsPerComponent: this.uImage.depth,
      Width: this.uImage.width,
      Height: this.uImage.height,

      Filter: 'FlateDecode',
      SMask,
      DecodeParms,
      ColorSpace,
    });

    if (ref) {
      context.assign(ref, xObject);
      return ref;
    } else {
      return context.register(xObject);
    }
  }

  private embedAlphaChannel(context: PDFContext): PDFRef | undefined {
    if (!this.alphaChannel) return undefined;
    const xObject = context.flateStream(this.alphaChannel, {
      Type: 'XObject',
      Subtype: 'Image',

      // Height: this.image.height,
      // Width: this.image.width,
      Height: this.uImage.height,
      Width: this.uImage.width,

      BitsPerComponent: 8,
      ColorSpace: 'DeviceGray',
      Decode: [0, 1],
    });
    return context.register(xObject);
  }

  private async splitAlphaChannel(): Promise<void> {
    // const { colors, bits, width, height } = this.image;
    const { ctype, depth, width, height, data } = this.uImage;

    // const pixels = this.image.decodePixels();
    const pixels = new Uint8Array(data);

    // const colorByteSize = (colors * bits) / 8;
    const colorByteSize = (ctype * depth) / 8;

    const pixelCount = width * height;

    const imageData = new Uint8Array(pixelCount * colorByteSize);
    const alphaChannel = new Uint8Array(pixelCount);

    let pixelOffset = 0;
    let rgbOffset = 0;
    let alphaOffset = 0;

    const { length } = pixels;
    while (pixelOffset < length) {
      imageData[rgbOffset++] = pixels[pixelOffset++];
      imageData[rgbOffset++] = pixels[pixelOffset++];
      imageData[rgbOffset++] = pixels[pixelOffset++];
      alphaChannel[alphaOffset++] = pixels[pixelOffset++];
    }

    this.imageData = pako.deflate(imageData);
    this.alphaChannel = alphaChannel;
  }

  private async loadIndexedAlphaChannel(): Promise<void> {
    const transparency = this.image.transparency.indexed!;

    // const pixels = this.image.decodePixels();
    const pixels = new Uint8Array(this.uImage.data);

    const alphaChannel = new Uint8Array(this.image.width * this.image.height);

    for (let idx = 0, len = pixels.length; idx < len; idx++) {
      alphaChannel[idx] = transparency[pixels[idx]];
    }

    this.alphaChannel = alphaChannel;
  }
}

export default PngEmbedder;
