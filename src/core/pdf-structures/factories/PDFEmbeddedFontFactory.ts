import fontkit, { Font, Glyph } from '@pdf-lib/fontkit';
import first from 'lodash/first';
import flatten from 'lodash/flatten';
import sortBy from 'lodash/sortBy';
import range from 'lodash/range';
import sum from 'lodash/sum';
import sortedUniqBy from 'lodash/sortedUniqBy';
import zip from 'lodash/zip';
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
import {
  mapIntoContiguousGroups,
  toHexStringOfMinLength,
  typedArrayFor,
} from 'utils';
import { isInstance, validate } from 'utils/validate';
import { createCmap } from './CMap';

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
const makeFontFlags = (options: IFontFlagOptions) => {
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

const addRandomSuffix = (prefix?: string | null | void) =>
  `${prefix || 'Font'}-rand_${Math.floor(Math.random() * 10000)}`;

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
  private allGlyphsInFontSortedById: Glyph[];

  constructor(fontData: Uint8Array) {
    validate(
      fontData,
      isInstance(Uint8Array),
      '"fontData" must be a Uint8Array',
    );

    this.fontData = fontData;
    this.font = fontkit.create(fontData);
    this.scale = 1000 / this.font.unitsPerEm;

    const glyphs = this.font.characterSet.map((cp) =>
      this.font.glyphForCodePoint(cp),
    );
    this.allGlyphsInFontSortedById = sortedUniqBy(sortBy(glyphs, 'id'), 'id');
  }

  embedFontIn = (pdfDoc: PDFDocument): PDFIndirectReference<PDFDictionary> => {
    validate(
      pdfDoc,
      isInstance(PDFDocument),
      'PDFFontFactory.embedFontIn: "pdfDoc" must be an instance of PDFDocument',
    );
    const fontName = addRandomSuffix(this.font.postscriptName);
    return this.embedFontDictionaryIn(pdfDoc, fontName);
  };

  encodeText = (text: string) => {
    const { glyphs } = this.font.layout(text, []);
    return PDFHexString.fromString(
      glyphs.map((glyph) => toHexStringOfMinLength(glyph.id, 4)).join(''),
    );
  };

  widthOfTextAtSize = (text: string, size: number) => {
    const { glyphs } = this.font.layout(text, []);

    // The advanceWidth takes into account kerning automatically, so we don't
    // have to do that manually like we do for the standard fonts.
    const widths = glyphs.map((glyph) => glyph.advanceWidth * this.scale);

    const scale = size / 1000;

    return sum(widths) * scale;
  };

  heightOfFontAtSize = (size: number) => {
    const { ascent, descent, bbox } = this.font;
    const yTop = (ascent || bbox.maxY) * this.scale;
    const yBottom = (descent || bbox.minY) * this.scale;
    return ((yTop - yBottom) / 1000) * size;
  };

  private embedFontDictionaryIn = (pdfDoc: PDFDocument, fontName: string) => {
    const cidFontDictRef = this.embedCIDFontDictionaryIn(pdfDoc, fontName);
    const unicodeCMap = this.embedUnicodeCmapIn(pdfDoc);

    const fontDict = PDFDictionary.from(
      {
        Type: PDFName.from('Font'),
        Subtype: PDFName.from('Type0'),
        BaseFont: PDFName.from(fontName),
        Encoding: PDFName.from('Identity-H'),
        DescendantFonts: PDFArray.fromArray([cidFontDictRef], pdfDoc.index),
        ToUnicode: unicodeCMap,
      },
      pdfDoc.index,
    );

    const fontDictRef = pdfDoc.register(fontDict);

    return fontDictRef;
  };

  private embedCIDFontDictionaryIn = (
    pdfDoc: PDFDocument,
    fontName: string,
  ) => {
    const fontDescriptorRef = this.embedFontDescriptorIn(pdfDoc, fontName);
    const widths = this.deriveWidths(pdfDoc);

    const cidFontDict = PDFDictionary.from(
      {
        Type: PDFName.from('Font'),
        Subtype: PDFName.from(this.font.cff ? 'CIDFontType0' : 'CIDFontType2'),
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
        W: widths,
      },
      pdfDoc.index,
    );

    const cidFontRef = pdfDoc.register(cidFontDict);

    return cidFontRef;
  };

  private embedFontDescriptorIn = (pdfDoc: PDFDocument, fontName: string) => {
    const fontFlags = this.deriveFontFlags();
    const fontStreamRef = this.embedFontStreamIn(pdfDoc);

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
        Flags: fontFlags,
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

    const fontFileKey = this.font.cff ? 'FontFile3' : 'FontFile2';
    fontDescriptor.set(fontFileKey, fontStreamRef);

    const fontDescriptorRef = pdfDoc.register(fontDescriptor);

    return fontDescriptorRef;
  };

  private embedFontStreamIn = (pdfDoc: PDFDocument) => {
    const deflatedFontData = pako.deflate(this.fontData);
    const fontStreamDict = PDFDictionary.from(
      {
        Filter: PDFName.from('FlateDecode'),
        Length: PDFNumber.fromNumber(deflatedFontData.length),
      },
      pdfDoc.index,
    );
    if (this.font.cff) {
      fontStreamDict.set('Subtype', PDFName.from('CIDFontType0C'));
    }
    const fontStream = PDFRawStream.from(fontStreamDict, deflatedFontData);
    const fontStreamRef = pdfDoc.register(fontStream);
    return fontStreamRef;
  };

  private embedUnicodeCmapIn = (pdfDoc: PDFDocument) => {
    const streamContents = typedArrayFor(
      createCmap(this.allGlyphsInFontSortedById),
    );

    // TODO: Compress this...
    const cmapStreamDict = PDFDictionary.from(
      { Length: PDFNumber.fromNumber(streamContents.length) },
      pdfDoc.index,
    );
    const cmapStream = PDFRawStream.from(cmapStreamDict, streamContents);
    const cmapStreamRef = pdfDoc.register(cmapStream);

    return cmapStreamRef;
  };

  private deriveFontFlags = () => {
    // From: https://github.com/foliojs/pdfkit/blob/83f5f7243172a017adcf6a7faa5547c55982c57b/lib/font/embedded.js#L123-L129
    const familyClass = this.font['OS/2'] ? this.font['OS/2'].sFamilyClass : 0;
    const flags = makeFontFlags({
      fixedPitch: this.font.post.isFixedPitch,
      serif: 1 <= familyClass && familyClass <= 7,
      symbolic: true, // Assume the font uses non-latin characters
      script: familyClass === 10,
      italic: this.font.head.macStyle.italic,
    });
    return PDFNumber.fromNumber(flags);
  };

  private deriveWidths = (pdfDoc: PDFDocument) => {
    const glyphs = this.allGlyphsInFontSortedById;

    const sectionDelimiters = mapIntoContiguousGroups(
      glyphs,
      (glyph) => glyph.id,
      (glyph) => PDFNumber.fromNumber(glyph.id),
    ).map((id) => first(id)!);

    const glyphsWidths = mapIntoContiguousGroups(
      glyphs,
      (glyph) => glyph.id,
      (glyph) => PDFNumber.fromNumber(glyph.advanceWidth * this.scale),
    ).map((groups) => PDFArray.fromArray(groups, pdfDoc.index));

    type IWidths = Array<PDFNumber | PDFArray<PDFNumber>>;

    const widths = flatten(zip(sectionDelimiters, glyphsWidths)) as IWidths;

    return PDFArray.fromArray(widths, pdfDoc.index);
  };
}

export default PDFEmbeddedFontFactory;
