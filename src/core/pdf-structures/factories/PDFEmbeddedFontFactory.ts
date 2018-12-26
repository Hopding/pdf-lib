import fontkit, { Font } from '@pdf-lib/fontkit';
import isNumber from 'lodash/isNumber';
import last from 'lodash/last';
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
import { toHexStringOfMinLength } from 'utils';
import { isInstance, validate } from 'utils/validate';


interface IFontFlagOptions {
  fixedPitch?: boolean;
  serif?: boolean;
  symbolic?: boolean;
  script?: boolean;
  nonsymbolic?: boolean;
  italic?: boolean;
  allCap?: boolean;
  smallCap?: boolean;
  forceBold?: boolean;
}

// prettier-ignore
/** @hidden */
const fontFlags = (options: IFontFlagOptions) => {
  let flags = 0;

  // tslint:disable-next-line:no-bitwise
  const flipBit = (bit: number) => { flags |= (1 << (bit - 1)); };

  if (options.fixedPitch)  flipBit(1);
  if (options.serif)       flipBit(2);
  if (options.symbolic)    flipBit(3);
  if (options.script)      flipBit(4);
  if (options.nonsymbolic) flipBit(6);
  if (options.italic)      flipBit(7);
  if (options.allCap)      flipBit(17);
  if (options.smallCap)    flipBit(18);
  if (options.forceBold)   flipBit(19);

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
class PDFEmbeddedFontFactory {
  static for = (fontData: Uint8Array) => new PDFEmbeddedFontFactory(fontData);

  font: Font;
  scale: number;
  fontData: Uint8Array;

  unicode: number[][];

  constructor(fontData: Uint8Array) {
    validate(
      fontData,
      isInstance(Uint8Array),
      '"fontData" must be a Uint8Array',
    );

    this.fontData = fontData;
    this.font = fontkit.create(fontData);
    this.scale = 1000 / this.font.unitsPerEm;

    this.unicode = [[0]];
  }

  embedFontIn = (pdfDoc: PDFDocument): PDFIndirectReference<PDFDictionary> => {
    validate(
      pdfDoc,
      isInstance(PDFDocument),
      'PDFFontFactory.embedFontIn: "pdfDoc" must be an instance of PDFDocument',
    );

    // TODO: Add .cff to fontkit.d.ts
    const isCFF = !!(this.font as any).cff;

    const randSuffix = `-rand_${Math.floor(Math.random() * 10000)}`;
    const fontName =
      this.font.postscriptName + randSuffix || 'Font' + randSuffix;

    const deflatedFontData = pako.deflate(this.fontData);
    const fontStreamDict = PDFDictionary.from(
      {
        Filter: PDFName.from('FlateDecode'),
        Length: PDFNumber.fromNumber(deflatedFontData.length),
      },
      pdfDoc.index,
    );
    if (isCFF) fontStreamDict.set('Subtype', PDFName.from('CIDFontType0C'));
    const fontStream = pdfDoc.register(
      PDFRawStream.from(fontStreamDict, deflatedFontData),
    );

    // From: https://github.com/foliojs/pdfkit/blob/83f5f7243172a017adcf6a7faa5547c55982c57b/lib/font/embedded.js#L123-L129
    const ft = this.font as any;
    const fOS2 = ft['OS/2'];
    const familyClass = fOS2 ? fOS2.sFamilyClass : 0;
    const flags = fontFlags({
      fixedPitch: ft.post.isFixedPitch,
      serif: 1 <= familyClass && familyClass <= 7,
      symbolic: true, // Assume the font uses non-latin characters
      script: familyClass === 10,
      italic: ft.head.macStyle.italic,
    });

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
      },
      pdfDoc.index,
    );
    const fontFileKey = isCFF ? 'FontFile3' : 'FontFile2';
    fontDescriptor.set(fontFileKey, fontStream);
    const fontDescriptorRef = pdfDoc.register(fontDescriptor);

    const widths: Array<number | number[]> = [];
    const usedGids = new Set<number>();
    let prevGid = -2;
    this.font.characterSet
      .map((cp) => this.font.glyphForCodePoint(cp))
      .sort((ga, gb) => ga.id - gb.id)
      .filter((glyph) => {
        if (!usedGids.has(glyph.id)) {
          usedGids.add(glyph.id);
          return true;
        }
        return false;
      })
      .forEach((glyph) => {
        const gid = glyph.id;
        if (gid - prevGid > 1) {
          widths.push(gid);
          widths.push([]);
        }
        prevGid = gid;

        const width = glyph.advanceWidth * this.scale;

        (last(widths) as number[]).push(width);
      });

    const W = PDFArray.fromArray(
      widths.map((cpOrWidthsArr) =>
        isNumber(cpOrWidthsArr)
          ? PDFNumber.fromNumber(cpOrWidthsArr)
          : PDFArray.fromArray(
              cpOrWidthsArr.map(PDFNumber.fromNumber),
              pdfDoc.index,
            ),
      ),
      pdfDoc.index,
    );

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
        W,
      },
      pdfDoc.index,
    );
    const descentFontRef = pdfDoc.register(descentFontDict);

    const fontDictionary = PDFDictionary.from(
      {
        Type: PDFName.from('Font'),
        Subtype: PDFName.from('Type0'),
        BaseFont: PDFName.from(fontName),
        Encoding: PDFName.from('Identity-H'),
        DescendantFonts: PDFArray.fromArray([descentFontRef], pdfDoc.index),
        // TODO: ToUnicode: [...]
      },
      pdfDoc.index,
    );

    return pdfDoc.register(fontDictionary);
  };

  encodeText = (text: string) => {
    const { glyphs } = this.font.layout(text, []);

    glyphs.forEach(({ id, codePoints }) => {
      if (!this.unicode[id]) this.unicode[id] = codePoints;
    });

    // TODO: Might be splitting and joining more than necessary here?
    return PDFHexString.fromString(
      glyphs.map((glyph) => toHexStringOfMinLength(glyph.id, 4)).join(''),
    );
  };
}

export default PDFEmbeddedFontFactory;
