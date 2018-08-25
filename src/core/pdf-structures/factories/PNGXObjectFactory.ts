import pako from 'pako';
import PNG from 'png-js';

import PDFDocument from 'core/pdf-document/PDFDocument';
import {
  PDFArray,
  PDFDictionary,
  PDFIndirectReference,
  PDFName,
  PDFNumber,
  PDFRawStream,
} from 'core/pdf-objects';
import { isInstance, validate } from 'utils/validate';

/**
 * A note of thanks to the developers of https://github.com/devongovett/pdfkit,
 * as this class borrows heavily from:
 * https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/png.coffee
 */
class PNGXObjectFactory {
  static for = (data: Uint8Array) => new PNGXObjectFactory(data);

  image: PNG;
  width: number;
  height: number;
  imgData: Uint8Array;
  alphaChannel: Uint8Array;

  xObjDict: PDFDictionary;
  document: PDFDocument;

  constructor(data: Uint8Array) {
    validate(
      data,
      isInstance(Uint8Array),
      '"data" must be an instance of Uint8Array',
    );

    this.image = new PNG(data);
    this.width = this.image.width;
    this.height = this.image.height;
    this.imgData = this.image.imgData;
  }

  embedImageIn = (
    document: PDFDocument,
  ): PDFIndirectReference<PDFRawStream> => {
    this.document = document;
    this.xObjDict = PDFDictionary.from(
      {
        Type: PDFName.from('XObject'),
        Subtype: PDFName.from('Image'),
        BitsPerComponent: PDFNumber.fromNumber(this.image.bits),
        Width: PDFNumber.fromNumber(this.width),
        Height: PDFNumber.fromNumber(this.height),
        Filter: PDFName.from('FlateDecode'),
      },
      document.index,
    );

    if (!this.image.hasAlphaChannel) {
      const params = PDFDictionary.from(
        {
          Predictor: PDFNumber.fromNumber(15),
          Colors: PDFNumber.fromNumber(this.image.colors),
          BitsPerComponent: PDFNumber.fromNumber(this.image.bits),
          Columns: PDFNumber.fromNumber(this.width),
        },
        document.index,
      );
      this.xObjDict.set('DecodeParms', params);
    }

    if (this.image.palette.length === 0) {
      this.xObjDict.set('ColorSpace', PDFName.from(this.image.colorSpace));
    } else {
      const paletteStream = document.register(
        PDFRawStream.from(
          PDFDictionary.from(
            {
              Length: PDFNumber.fromNumber(this.image.palette.length),
            },
            document.index,
          ),
          new Uint8Array(this.image.palette),
        ),
      );
      this.xObjDict.set(
        'ColorSpace',
        PDFArray.fromArray(
          [
            PDFName.from('Indexed'),
            PDFName.from('DeviceRGB'),
            PDFNumber.fromNumber(this.image.palette.length / 3 - 1),
            paletteStream,
          ],
          document.index,
        ),
      );
    }

    // TODO: Handle the following two transparency types. They don't seem to be
    // fully handled in:
    // https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/png.coffee

    // if (this.image.transparency.grayscale)
    // if (this.image.transparency.rgb)

    // prettier-ignore
    return (
        this.image.transparency.indexed ? this.loadIndexedAlphaChannel()
      : this.image.hasAlphaChannel      ? this.splitAlphaChannel()
      : this.finalize()
    );
  };

  /** @hidden */
  private finalize = () => {
    if (this.alphaChannel) {
      const deflatedAlphaChannel = pako.deflate(this.alphaChannel);
      const alphaStreamDict = PDFDictionary.from(
        {
          Type: PDFName.from('XObject'),
          Subtype: PDFName.from('Image'),
          Height: PDFNumber.fromNumber(this.height),
          Width: PDFNumber.fromNumber(this.width),
          BitsPerComponent: PDFNumber.fromNumber(8),
          Filter: PDFName.from('FlateDecode'),
          ColorSpace: PDFName.from('DeviceGray'),
          Decode: PDFArray.fromArray(
            [PDFNumber.fromNumber(0), PDFNumber.fromNumber(1)],
            this.document.index,
          ),
          Length: PDFNumber.fromNumber(deflatedAlphaChannel.length),
        },
        this.document.index,
      );
      const smaskStream = this.document.register(
        PDFRawStream.from(alphaStreamDict, deflatedAlphaChannel),
      );
      this.xObjDict.set('SMask', smaskStream);
    }

    this.xObjDict.set('Length', PDFNumber.fromNumber(this.imgData.length));
    const xObj = this.document.register(
      PDFRawStream.from(this.xObjDict, this.imgData),
    );
    return xObj;
  };

  /** @hidden */
  private splitAlphaChannel = () => {
    const pixels = this.image.decodePixelsSync();
    const colorByteSize = this.image.colors * this.image.bits / 8;
    const pixelCount = this.image.width * this.image.height;
    this.imgData = new Uint8Array(pixelCount * colorByteSize);
    this.alphaChannel = new Uint8Array(pixelCount);
    let i = 0;
    let p = 0;
    let a = 0;
    while (i < pixels.length) {
      this.imgData[p++] = pixels[i++];
      this.imgData[p++] = pixels[i++];
      this.imgData[p++] = pixels[i++];
      this.alphaChannel[a++] = pixels[i++];
    }
    this.imgData = pako.deflate(this.imgData);
    return this.finalize();
  };

  /** @hidden */
  private loadIndexedAlphaChannel = () => {
    const transparency = this.image.transparency.indexed;
    const pixels = this.image.decodePixelsSync();
    this.alphaChannel = new Uint8Array(this.width * this.height);

    // Can't use forEach here, because it's missing on React Native Android
    for (let idx = 0; idx < pixels.length; idx++) {
      this.alphaChannel[idx] = transparency[pixels[idx]];
    }
    return this.finalize();
  };
}

export default PNGXObjectFactory;
