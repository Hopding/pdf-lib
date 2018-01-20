/* xxxxxxxxxxxxxxxxxxxx@flow */
/* eslint-disable no-plusplus */
import PNG from 'png-js';

import PDFDocument from 'core/pdf-document/PDFDocument';
import {
  PDFDictionary,
  PDFName,
  PDFArray,
  PDFNumber,
  PDFRawStream,
} from 'core/pdf-objects';

class PNGImage {
  constructor(data: Uint8Array) {
    this.image = new PNG(data);
    this.width = this.image.width;
    this.height = this.image.height;
    this.imgData = this.image.imgData;
    this.xObjDict = null;
  }

  embed = (document: PDFDocument) => {
    this.document = document;
    this.xObjDict = PDFDictionary.from({
      Type: PDFName.from('XObject'),
      Subtype: PDFName.from('Image'),
      BitsPerComponent: PDFNumber.fromNumber(this.image.bits),
      Width: PDFNumber.fromNumber(this.width),
      Height: PDFNumber.fromNumber(this.height),
    });

    if (!this.image.hasAlphaChannel) {
      this.xObjDict.set('Filter', PDFName.from('FlateDecode'));
      const params = PDFDictionary.from({
        Predictor: PDFNumber.fromNumber(15),
        Colors: PDFNumber.fromNumber(this.image.colors),
        BitsPerComponent: PDFNumber.fromNumber(this.image.bits),
        Columns: PDFNumber.fromNumber(this.width),
      });
      this.xObjDict.set('DecodeParms', params);
    }

    if (this.image.palette.length === 0) {
      this.xObjDict.set('ColorSpace', PDFName.from(this.image.colorSpace));
    } else {
      const paletteStream = document.register(
        PDFRawStream.from(
          PDFDictionary.from({
            Length: PDFNumber.fromNumber(this.image.palette.length),
          }),
          new Uint8Array(this.image.palette),
        ),
      );
      this.xObjDict.set(
        'ColorSpace',
        PDFArray.fromArray([
          PDFName.from('Indexed'),
          PDFName.from('DeviceRGB'),
          PDFNumber.fromNumber(this.image.palette.length / 3 - 1),
          paletteStream,
        ]),
      );
    }

    // TODO: HANDLE THE 'Filter' ENTRY IN THE XOBJECT DICT

    // if (this.image.transparency.grayscale)
    // if (this.image.transparency.rgb)
    if (this.image.transparency.indexed) {
      return this.loadIndexedAlphaChannel();
    } else if (this.image.hasAlphaChannel) {
      return this.splitAlphaChannel();
    }
    return this.finalize();
  };

  finalize = () => {
    if (this.alphaChannel) {
      const smaskStream = this.document.register(
        PDFRawStream.from(
          PDFDictionary.from({
            Type: PDFName.from('XObject'),
            Subtype: PDFName.from('Image'),
            Height: PDFNumber.fromNumber(this.height),
            Width: PDFNumber.fromNumber(this.width),
            BitsPerComponent: PDFNumber.fromNumber(8),
            // Filter: PDFName.from('FlateDecode'),
            ColorSpace: PDFName.from('DeviceGray'),
            Decode: PDFArray.fromArray([
              PDFNumber.fromNumber(0),
              PDFNumber.fromNumber(1),
            ]),
            Length: PDFNumber.fromNumber(this.alphaChannel.length),
          }),
          this.alphaChannel,
        ),
      );
      this.xObjDict.set('SMask', smaskStream);
    }

    this.xObjDict.set('Length', PDFNumber.fromNumber(this.imgData.length));
    const xObj = this.document.register(
      PDFRawStream.from(this.xObjDict, this.imgData),
    );
    return xObj;
  };

  splitAlphaChannel = () => {
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
    return this.finalize();
  };

  loadIndexedAlphaChannel = () => {
    const transparency = this.image.transparency.indexed;
    const pixels = this.image.decodePixelsSync();
    this.alphaChannel = new Uint8Array(this.width * this.height);
    pixels.forEach((pixel, idx) => {
      this.alphaChannel[idx] = transparency[pixel];
    });
    return this.finalize();
  };
}

export default PNGImage;
