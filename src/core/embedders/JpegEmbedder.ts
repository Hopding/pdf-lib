import PDFRef from 'src/core/objects/PDFRef';
import PDFContext from 'src/core/PDFContext';

// prettier-ignore
const MARKERS = [
  0xffc0, 0xffc1, 0xffc2,
  0xffc3, 0xffc5, 0xffc6,
  0xffc7, 0xffc8, 0xffc9,
  0xffca, 0xffcb, 0xffcc,
  0xffcd, 0xffce, 0xffcf,
];

enum ColorSpace {
  DeviceGray = 'DeviceGray',
  DeviceRGB = 'DeviceRGB',
  DeviceCMYK = 'DeviceCMYK',
}

const ChannelToColorSpace: { [idx: number]: ColorSpace | undefined } = {
  1: ColorSpace.DeviceGray,
  3: ColorSpace.DeviceRGB,
  4: ColorSpace.DeviceCMYK,
};

/**
 * A note of thanks to the developers of https://github.com/foliojs/pdfkit, as
 * this class borrows from:
 *   https://github.com/foliojs/pdfkit/blob/a6af76467ce06bd6a2af4aa7271ccac9ff152a7d/lib/image/jpeg.js
 */
class JpegEmbedder {
  static async for(imageData: Uint8Array) {
    const dataView = new DataView(imageData.buffer);

    const soi = dataView.getUint16(0);
    if (soi !== 0xffd8) throw new Error('SOI not found in JPEG');

    let pos = 2;
    let marker: number;

    while (pos < dataView.byteLength) {
      marker = dataView.getUint16(pos);
      pos += 2;
      if (MARKERS.includes(marker)) break;
      pos += dataView.getUint16(pos);
    }

    if (!MARKERS.includes(marker!)) throw new Error('Invalid JPEG');
    pos += 2;

    const bitsPerComponent = dataView.getUint8(pos++);
    const height = dataView.getUint16(pos);
    pos += 2;

    const width = dataView.getUint16(pos);
    pos += 2;

    const channelByte = dataView.getUint8(pos++);
    const channelName = ChannelToColorSpace[channelByte];

    if (!channelName) throw new Error('Unknown JPEG channel.');

    const colorSpace = channelName;

    return new JpegEmbedder(
      imageData,
      bitsPerComponent,
      width,
      height,
      colorSpace,
    );
  }

  readonly bitsPerComponent: number;
  readonly height: number;
  readonly width: number;
  readonly colorSpace: ColorSpace;

  private readonly imageData: Uint8Array;

  private constructor(
    imageData: Uint8Array,
    bitsPerComponent: number,
    width: number,
    height: number,
    colorSpace: ColorSpace,
  ) {
    this.imageData = imageData;
    this.bitsPerComponent = bitsPerComponent;
    this.width = width;
    this.height = height;
    this.colorSpace = colorSpace;
  }

  async embedIntoContext(context: PDFContext, ref?: PDFRef): Promise<PDFRef> {
    const xObject = context.stream(this.imageData, {
      Type: 'XObject',
      Subtype: 'Image',
      BitsPerComponent: this.bitsPerComponent,
      Width: this.width,
      Height: this.height,
      ColorSpace: this.colorSpace,
      Filter: 'DCTDecode',

      // CMYK JPEG streams in PDF are typically stored complemented,
      // with 1 as 'off' and 0 as 'on' (PDF 32000-1:2008, 8.6.4.4).
      //
      // Standalone CMYK JPEG (usually exported by Photoshop) are
      // stored inverse, with 0 as 'off' and 1 as 'on', like RGB.
      //
      // Applying a swap here as a hedge that most bytes passing
      // through this method will benefit from it.
      Decode:
        this.colorSpace === ColorSpace.DeviceCMYK
          ? [1, 0, 1, 0, 1, 0, 1, 0]
          : undefined,
    });

    if (ref) {
      context.assign(ref, xObject);
      return ref;
    } else {
      return context.register(xObject);
    }
  }
}

export default JpegEmbedder;
