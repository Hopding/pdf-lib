import fontkit, { Font } from '@pdf-lib/fontkit';
import isNumber from 'lodash/isNumber';
import last from 'lodash/last';
import sortBy from 'lodash/sortBy';
import sortedUniqBy from 'lodash/sortedUniqBy';
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
import { typedArrayFor, toHexStringOfMinLength } from 'utils';
import { isInstance, validate } from 'utils/validate';
import { cmapCodePointFormat } from './CMap';

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
    const fontName = addRandomSuffix(this.font.postscriptName);
    return this.embedFontDictionaryIn(pdfDoc, fontName);
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

  private deriveWidths = (pdfDoc: PDFDocument) => {
    // Compute a sorted array of uniq glyphs in the font
    const tempGlyphs = this.font.characterSet.map((cp) =>
      this.font.glyphForCodePoint(cp),
    );
    const glyphs = sortedUniqBy(sortBy(tempGlyphs, 'id'), 'id');

    // Produce a widths array (thank the PDF spec for this awkwardness)
    let prevGid = -2;
    const widths: Array<number | number[]> = [];
    glyphs.forEach((glyph) => {
      const gid = glyph.id;

      if (gid - prevGid > 1) {
        widths.push(gid);
        widths.push([]);
      }
      prevGid = gid;

      const width = glyph.advanceWidth * this.scale;
      (last(widths) as number[]).push(width);
    });

    // Convert the widths array into a PDFArray
    return PDFArray.fromArray(
      widths.map((codePointOrWidths) =>
        isNumber(codePointOrWidths)
          ? PDFNumber.fromNumber(codePointOrWidths)
          : PDFArray.fromArray(
              codePointOrWidths.map(PDFNumber.fromNumber),
              pdfDoc.index,
            ),
      ),
      pdfDoc.index,
    );
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

  private embedUnicodeCmapIn = (pdfDoc: PDFDocument) => {
    const [a, b] = this.convertCodePointsToUtf16();
    const streamContents = typedArrayFor(makeCmap(a as any, b));

    // TODO: Compress this...
    const cmapStreamDict = PDFDictionary.from(
      { Length: PDFNumber.fromNumber(streamContents.length) },
      pdfDoc.index,
    );
    const cmapStream = PDFRawStream.from(cmapStreamDict, streamContents);
    const cmapStreamRef = pdfDoc.register(cmapStream);

    return cmapStreamRef;
  };

  // TODO: Clean this up...
  private convertCodePointsToUtf16 = () => {
    // TODO: Extract this into method, because it is shared...
    const tempGlyphs = this.font.characterSet.map((cp) =>
      this.font.glyphForCodePoint(cp),
    );
    const glyphs = sortedUniqBy(sortBy(tempGlyphs, 'id'), 'id');

    let lastId = glyphs[0].id;
    const bfRangeRanges: Array<[number, number]> = [[glyphs[0].id, -1]];
    const bfRangeMappings: string[][] = [[]];

    glyphs.forEach(({ id, codePoints }) => {
      // Start new section
      if (id - lastId > 1) {
        last(bfRangeRanges)![1] = lastId;
        bfRangeRanges.push([id, -1]);
        bfRangeMappings.push([]);
      }
      lastId = id;

      const formatted = codePoints.map(cmapCodePointFormat).join('');
      const cmapValue = `<${formatted}>`;
      last(bfRangeMappings)!.push(cmapValue);
    });
    last(bfRangeRanges)![1] = lastId;

    const bfRangeRangesStr = bfRangeRanges.map(([first, second]) => [
      toHexStringOfMinLength(first, 4),
      toHexStringOfMinLength(second, 4),
    ]);

    return [bfRangeRangesStr, bfRangeMappings];
  };
}

const makeBfRanges = (
  bfRangeRanges: Array<[string, string]>,
  bfRangeMappings: string[][],
) =>
  bfRangeRanges.map(
    ([start, end], idx) =>
      `${bfRangeMappings[idx].length} beginbfrange\n` +
      `<${start}> <${end}> [${bfRangeMappings[idx].join(' ')}]\n` +
      `endbfrange`,
  );

// prettier-ignore
const makeCmap = (  bfRangeRanges: Array<[string, string]>,
  bfRangeMappings: string[][],) => `
/CIDInit /ProcSet findresource begin
12 dict begin
begincmap
/CIDSystemInfo <<
  /Registry (Adobe)
  /Ordering (UCS)
  /Supplement 0
>> def
/CMapName /Adobe-Identity-UCS def
/CMapType 2 def
1 begincodespacerange
<0000><ffff>
endcodespacerange
${makeBfRanges(bfRangeRanges, bfRangeMappings).join('\n')}
endcmap
CMapName currentdict /CMap defineresource pop
end
end
`.trim();

export default PDFEmbeddedFontFactory;
