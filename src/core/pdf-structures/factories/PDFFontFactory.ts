import fontkit, { Font, Subset } from '@pdf-lib/fontkit';
import isNil from 'lodash/isNil';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import range from 'lodash/range';
import pako from 'pako';

import PDFDocument from 'core/pdf-document/PDFDocument';
import {
  PDFArray,
  PDFDictionary,
  PDFHexString,
  PDFIndirectReference,
  PDFName,
  PDFNumber,
  PDFRawStream,
  PDFString,
} from 'core/pdf-objects';
import { or, setCharAt, toCharCode, toHexString } from 'utils';
import { isInstance, validate } from 'utils/validate';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';

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

// prettier-ignore
/** @hidden */
const fontFlags = (options: IFontFlagOptions) => {
  let flags = 0;

  // tslint:disable-next-line:no-bitwise
  const flipBit = (bit: number) => { flags |= (1 << (bit - 1)); };

  if (options.FixedPitch)  flipBit(1);
  if (options.Serif)       flipBit(2);
  if (options.Symbolic)    flipBit(3);
  if (options.Script)      flipBit(4);
  if (options.Nonsymbolic) flipBit(6);
  if (options.Italic)      flipBit(7);
  if (options.AllCap)      flipBit(17);
  if (options.SmallCap)    flipBit(18);
  if (options.ForceBold)   flipBit(19);

  return flags;
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

  font: Font;
  scale: number;
  fontData: Uint8Array;
  flagOptions: IFontFlagOptions;
  subset: Subset;

  unicode: number[][];
  widths: number[];

  constructor(fontData: Uint8Array, flagOptions: IFontFlagOptions) {
    validate(
      fontData,
      isInstance(Uint8Array),
      '"fontData" must be a Uint8Array',
    );
    validate(flagOptions, isObject, '"flagOptions" must be an Object');

    this.fontData = fontData;
    this.flagOptions = flagOptions;
    this.font = fontkit.create(fontData);
    this.scale = 1000 / this.font.unitsPerEm;
    this.subset = this.font.createSubset();

    this.unicode = [[0]];
    this.widths = [this.font.getGlyph(0, []).advanceWidth];
  }

  /*
  TODO: This is hardcoded for "Simple Fonts" with non-modified encodings, need
  to broaden support to other fonts.
  */
  embedFontIn = async (
    pdfDoc: PDFDocument,
    name?: string,
  ): Promise<PDFIndirectReference<PDFDictionary>> => {
    validate(
      pdfDoc,
      isInstance(PDFDocument),
      'PDFFontFactory.embedFontIn: "pdfDoc" must be an instance of PDFDocument',
    );
    validate(name, or(isString, isNil), '"name" must be a string or undefined');

    const isCFF = !!(this.subset as any).cff;
    // if (isCFF) {
    // fontFile.data.Subtype = 'CIDFontType0C';
    // }

    const randSuffix = `-rand_${Math.floor(Math.random() * 10000)}`;
    const fontName =
      name || this.font.postscriptName + randSuffix || 'Font' + randSuffix;

    const subsetData = await new Promise<Uint8Array>((resolve) => {
      const tempData: number[] = [];
      (this.subset.encodeStream() as any)
        .on('data', (data: any) => {
          tempData.push(...data);
        })
        .on('end', () => {
          resolve(new Uint8Array(tempData));
        });
    });

    // while (!finished) {
    //   console.log('lewping');
    // }
    // const subsetData = new Uint8Array(tempData);
    // console.log('SD:', subsetData!);

    // const deflatedFontData = pako.deflate(this.fontData);
    const deflatedFontData = pako.deflate(subsetData);
    const fontStreamDict = PDFDictionary.from(
      {
        // Subtype: PDFName.from('OpenType'),
        Subtype: PDFName.from('CIDFontType0C'),
        Filter: PDFName.from('FlateDecode'),
        Length: PDFNumber.fromNumber(deflatedFontData.length),
      },
      pdfDoc.index,
    );
    const fontStream = pdfDoc.register(
      PDFRawStream.from(fontStreamDict, deflatedFontData),
    );

    /* tslint:disable:no-bitwise */
    const f = this.font as any;
    const familyClass =
      ((f['OS/2'] != null ? f['OS/2'].sFamilyClass : undefined) || 0) >> 8;
    let flags = 0;
    if (f.post.isFixedPitch) {
      flags |= 1 << 0;
    }
    if (1 <= familyClass && familyClass <= 7) {
      flags |= 1 << 1;
    }
    flags |= 1 << 2; // assume the font uses non-latin characters
    if (familyClass === 10) {
      flags |= 1 << 3;
    }
    if (f.head.macStyle.italic) {
      flags |= 1 << 6;
    }
    /* tslint:enable:no-bitwise */

    // const familyClass = this.font['OS/2'] ? this.font['OS/2'].sFamilyClass : 0;

    // this.flagOptions.

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
        Flags: PDFNumber.fromNumber(flags),
        // Flags: PDFNumber.fromNumber(fontFlags(this.flagOptions)),
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
        // FontFile3: fontStream,
      },
      pdfDoc.index,
    );
    const fontFileKey = isCFF ? 'FontFile3' : 'FontFile2';
    fontDescriptor.set(fontFileKey, fontStream);
    const fontDescriptorRef = pdfDoc.register(fontDescriptor);

    console.log();
    console.log(fontDescriptor.toString());
    console.log();

    // CIDFont Dictionary...
    const descentFontDict = PDFDictionary.from(
      {
        Type: PDFName.from('Font'),
        Subtype: PDFName.from(isCFF ? 'CIDFontType0' : 'CIDFontType2'),
        BaseFont: PDFName.from(fontName),
        CIDSystemInfo: PDFDictionary.from(
          {
            Registry: PDFString.fromString('Adobe'),
            Ordering: PDFString.fromString('Identity'),
            Supplement: PDFNumber.fromNumber(0),
          },
          pdfDoc.index,
        ),
        FontDescriptor: fontDescriptorRef,
        W: PDFArray.fromArray(
          [
            PDFNumber.fromNumber(0),
            PDFArray.fromArray(
              this.widths.map(PDFNumber.fromNumber),
              pdfDoc.index,
            ),
          ],
          pdfDoc.index,
        ),
      },
      pdfDoc.index,
    );
    console.log();
    console.log(descentFontDict.toString());
    console.log();
    const descentFontRef = pdfDoc.register(descentFontDict);

    const fontDictionary = PDFDictionary.from(
      {
        Type: PDFName.from('Font'),
        Subtype: PDFName.from('Type0'),
        BaseFont: PDFName.from(fontName),
        Encoding: PDFName.from('Identity-H'),
        DescendantFonts: PDFArray.fromArray([descentFontRef], pdfDoc.index),
        // TODO: ToUnicode: [...]

        // Type: PDFName.from('Font'),
        // Subtype: PDFName.from('OpenType'),
        // BaseFont: PDFName.from(fontName),
        // FirstChar: PDFNumber.fromNumber(0),
        // LastChar: PDFNumber.fromNumber(255),
        // Widths: this.getWidths(pdfDoc.index),
        // FontDescriptor: pdfDoc.register(fontDescriptor),
      },
      pdfDoc.index,
    );
    console.log();
    console.log(fontDictionary.toString());
    console.log();
    return pdfDoc.register(fontDictionary);
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

  encodeText = (text: string) => {
    const { glyphs, positions } = this.font.layout(text, []);

    const glyphIds = glyphs.map(({ id, advanceWidth, codePoints }) => {
      const gid = this.subset.includeGlyph(id) as any;
      if (!this.widths[gid]) this.widths[gid] = advanceWidth * this.scale;
      if (!this.unicode[gid]) this.unicode[gid] = codePoints;
      return gid;
    });

    // TODO: Might be splitting and joining more than necessary here?
    return PDFHexString.fromString(
      glyphIds.map((id) => `0000${id.toString(16)}`.slice(-4)).join(''),
    );
  };
}

export default PDFFontFactory;
