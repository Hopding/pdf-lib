import { Buffer } from 'buffer/';
import fontkit from 'fontkit';
import isNil from 'lodash/isNil';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import range from 'lodash/range';
import pako from 'pako';

import PDFDocument from 'core/pdf-document/PDFDocument';
import {
  PDFArray,
  PDFDictionary,
  PDFIndirectReference,
  PDFName,
  PDFNumber,
  PDFRawStream,
} from 'core/pdf-objects';
import { or, setCharAt } from 'utils';
import { isInstance, validate } from 'utils/validate';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';

/** @hidden */
const unsigned32Bit = '00000000000000000000000000000000';

export interface IFontFlagOptions {
  FixedPitch?: boolean;
  Serif?: boolean;
  Symbolic?: boolean;
  Script?: boolean;
  Nonsymbolic?: boolean;
  Italic?: boolean;
  AllCap?: boolean;
  SmallCap?: boolean;
  ForceBold?: boolean;
}

// TODO: Make sure this works correctly. Setting any flag besides
//       Nonsymbolic to true seems to screw up the font...
/*
 * Doing this by bit-twiddling a string, and then parsing it, gets around
 * JavaScript converting the results of bit-shifting ops back into 64-bit integers.
 */
// prettier-ignore
/** @hidden */
const fontFlags = (options: IFontFlagOptions) => {
  let flags = unsigned32Bit;
  if (options.FixedPitch)  flags = setCharAt(flags, 32 - 1, '1');
  if (options.Serif)       flags = setCharAt(flags, 32 - 2, '1');
  if (options.Symbolic)    flags = setCharAt(flags, 32 - 3, '1');
  if (options.Script)      flags = setCharAt(flags, 32 - 4, '1');
  if (options.Nonsymbolic) flags = setCharAt(flags, 32 - 6, '1');
  if (options.Italic)      flags = setCharAt(flags, 32 - 7, '1');
  if (options.AllCap)      flags = setCharAt(flags, 32 - 17, '1');
  if (options.SmallCap)    flags = setCharAt(flags, 32 - 18, '1');
  if (options.ForceBold)   flags = setCharAt(flags, 32 - 19, '1');
  return parseInt(flags, 2);
};

/**
 * This Factory supports TrueType and OpenType fonts. Note that the apparent
 * hardcoding of values for OpenType fonts does not actually affect TrueType
 * fonts.
 *
 * A note of thanks to the developers of https://github.com/devongovett/pdfkit,
 * as this class borrows heavily from:
 * https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/font/embedded.coffee
 */
class PDFFontFactory {
  static for = (fontData: Uint8Array, flagOptions: IFontFlagOptions) =>
    new PDFFontFactory(fontData, flagOptions);

  font: any;
  scale: number;
  fontData: Uint8Array;
  flagOptions: IFontFlagOptions;

  constructor(fontData: Uint8Array, flagOptions: IFontFlagOptions) {
    validate(
      fontData,
      isInstance(Uint8Array),
      '"fontData" must be a Uint8Array',
    );
    validate(flagOptions, isObject, '"flagOptions" must be an Object');

    // This has to work in browser & Node JS environments. And, unfortunately,
    // the "fontkit" package makes use of Node "Buffer" objects, instead of
    // standard JS typed arrays. So, for now we'll just use the "buffer" package
    // to convert the "data" to a "Buffer" object that "fontkit" can work with.
    const dataBuffer = Buffer.from(fontData as any);

    this.fontData = fontData;
    this.flagOptions = flagOptions;
    this.font = fontkit.create(dataBuffer);
    this.scale = 1000 / this.font.unitsPerEm;
  }

  /*
  TODO: This is hardcoded for "Simple Fonts" with non-modified encodings, need
  to broaden support to other fonts.
  */
  embedFontIn = (
    pdfDoc: PDFDocument,
    name?: string,
  ): PDFIndirectReference<PDFDictionary> => {
    validate(
      pdfDoc,
      isInstance(PDFDocument),
      'PDFFontFactory.embedFontIn: "pdfDoc" must be an instance of PDFDocument',
    );
    validate(name, or(isString, isNil), '"name" must be a string or undefined');

    const randSuffix = `-rand_${Math.floor(Math.random() * 10000)}`;
    const fontName =
      name || this.font.postscriptName + randSuffix || 'Font' + randSuffix;

    const deflatedFontData = pako.deflate(this.fontData);
    const fontStreamDict = PDFDictionary.from(
      {
        Subtype: PDFName.from('OpenType'),
        Filter: PDFName.from('FlateDecode'),
        Length: PDFNumber.fromNumber(deflatedFontData.length),
      },
      pdfDoc.index,
    );
    const fontStream = pdfDoc.register(
      PDFRawStream.from(fontStreamDict, deflatedFontData),
    );

    const {
      italicAngle,
      ascent,
      descent,
      capHeight,
      xHeight,
      bbox,
    } = this.font;

    const fontDescriptor = PDFDictionary.from(
      {
        Type: PDFName.from('FontDescriptor'),
        FontName: PDFName.from(fontName),
        Flags: PDFNumber.fromNumber(fontFlags(this.flagOptions)),
        FontBBox: PDFArray.fromArray(
          [
            PDFNumber.fromNumber(bbox.minX * this.scale),
            PDFNumber.fromNumber(bbox.minY * this.scale),
            PDFNumber.fromNumber(bbox.maxX * this.scale),
            PDFNumber.fromNumber(bbox.maxY * this.scale),
          ],
          pdfDoc.index,
        ),
        ItalicAngle: PDFNumber.fromNumber(italicAngle),
        Ascent: PDFNumber.fromNumber(ascent * this.scale),
        Descent: PDFNumber.fromNumber(descent * this.scale),
        CapHeight: PDFNumber.fromNumber((capHeight || ascent) * this.scale),
        XHeight: PDFNumber.fromNumber((xHeight || 0) * this.scale),
        // Not sure how to compute/find this, nor is anybody else really:
        // https://stackoverflow.com/questions/35485179/stemv-value-of-the-truetype-font
        StemV: PDFNumber.fromNumber(0),
        FontFile3: fontStream,
      },
      pdfDoc.index,
    );

    return pdfDoc.register(
      PDFDictionary.from(
        {
          Type: PDFName.from('Font'),
          Subtype: PDFName.from('OpenType'),
          BaseFont: PDFName.from(fontName),
          FirstChar: PDFNumber.fromNumber(0),
          LastChar: PDFNumber.fromNumber(255),
          Widths: this.getWidths(pdfDoc.index),
          FontDescriptor: pdfDoc.register(fontDescriptor),
        },
        pdfDoc.index,
      ),
    );
  };

  /** @hidden */
  getWidths = (index: PDFObjectIndex) =>
    PDFArray.fromArray(
      range(0, 256)
        .map(this.getCodePointWidth)
        .map(PDFNumber.fromNumber),
      index,
    );

  getCodePointWidth = (code: number) =>
    this.font.characterSet.includes(code)
      ? this.font.glyphForCodePoint(code).advanceWidth * this.scale
      : 0;
}

export default PDFFontFactory;
