import PDFDocument from 'core/pdf-document/PDFDocument';
import {
  PDFArray,
  PDFDictionary,
  PDFIndirectReference,
  PDFName,
  PDFNumber,
  PDFRawStream,
} from 'core/pdf-objects';
import { error } from 'utils';
import { isInstance, validate } from 'utils/validate';

/** @hidden */
const MARKERS = [
  0xffc0,
  0xffc1,
  0xffc2,
  0xffc3,
  0xffc5,
  0xffc6,
  0xffc7,
  0xffc8,
  0xffc9,
  0xffca,
  0xffcb,
  0xffcc,
  0xffcd,
  0xffce,
  0xffcf,
];

/**
 * A note of thanks to the developers of https://github.com/devongovett/pdfkit,
 * as this class borrows heavily from:
 * https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/jpeg.coffee
 */
class JPEGXObjectFactory {
  static for = (data: Uint8Array) => new JPEGXObjectFactory(data);

  imgData: Uint8Array;
  bits: number;
  width: number;
  height: number;
  colorSpace: 'DeviceGray' | 'DeviceRGB' | 'DeviceCYMK';

  constructor(data: Uint8Array) {
    validate(data, isInstance(Uint8Array), '"data" must be a Uint8Array');

    this.imgData = data;
    const dataView = new DataView(data.buffer);
    if (dataView.getUint16(0) !== 0xffd8) error('SOI not found in JPEG');

    let pos = 2;
    let marker: number;
    while (pos < dataView.byteLength) {
      marker = dataView.getUint16(pos);
      pos += 2;
      if (MARKERS.includes(marker)) break;
      pos += dataView.getUint16(pos);
    }

    if (!MARKERS.includes(marker!)) error('Invalid JPEG');
    pos += 2;

    this.bits = dataView.getUint8(pos++);
    this.height = dataView.getUint16(pos);
    pos += 2;

    this.width = dataView.getUint16(pos);
    pos += 2;

    const channelMap = {
      1: 'DeviceGray' as 'DeviceGray',
      3: 'DeviceRGB' as 'DeviceRGB',
      4: 'DeviceCYMK' as 'DeviceCYMK',
    };
    const channels = dataView.getUint8(pos++) as 1 | 3 | 4;
    this.colorSpace = channelMap[channels] || error('Unknown JPEG channel.');
  }

  embedImageIn = (
    document: PDFDocument,
  ): PDFIndirectReference<PDFRawStream> => {
    const xObjDict = PDFDictionary.from(
      {
        Type: PDFName.from('XObject'),
        Subtype: PDFName.from('Image'),
        BitsPerComponent: PDFNumber.fromNumber(this.bits),
        Width: PDFNumber.fromNumber(this.width),
        Height: PDFNumber.fromNumber(this.height),
        ColorSpace: PDFName.from(this.colorSpace),
        Filter: PDFName.from('DCTDecode'),
      },
      document.index,
    );

    // Add extra decode params for CMYK images. By swapping the
    // min and max values from the default, we invert the colors. See
    // section 4.8.4 of the spec.
    if (this.colorSpace === 'DeviceCYMK') {
      xObjDict.set(
        'Decode',
        PDFArray.fromArray(
          [
            PDFNumber.fromNumber(1.0),
            PDFNumber.fromNumber(0.0),
            PDFNumber.fromNumber(1.0),
            PDFNumber.fromNumber(0.0),
            PDFNumber.fromNumber(1.0),
            PDFNumber.fromNumber(0.0),
            PDFNumber.fromNumber(1.0),
            PDFNumber.fromNumber(0.0),
          ],
          document.index,
        ),
      );
    }

    xObjDict.set('Length', PDFNumber.fromNumber(this.imgData.length));
    const xObj = document.register(PDFRawStream.from(xObjDict, this.imgData));
    return xObj;
  };
}

export default JPEGXObjectFactory;
