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
  DeviceCYMK = 'DeviceCYMK',
}

const ChannelToColorSpace: { [idx: number]: ColorSpace | undefined } = {
  1: ColorSpace.DeviceGray,
  3: ColorSpace.DeviceRGB,
  4: ColorSpace.DeviceCYMK,
};

/**
 * A note of thanks to the developers of https://github.com/foliojs/pdfkit, as
 * this class borrows from:
 *   https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/jpeg.coffee
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
