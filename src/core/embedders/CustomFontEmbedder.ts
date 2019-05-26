import fontkit, { Font, Glyph } from '@pdf-lib/fontkit';

import { createCmap } from 'src/core/embedders/CMap';
import { deriveFontFlags } from 'src/core/embedders/fontFlags';
import PDFHexString from 'src/core/objects/PDFHexString';
import PDFRef from 'src/core/objects/PDFRef';
import PDFString from 'src/core/objects/PDFString';
import PDFContext from 'src/core/PDFContext';
import {
  addRandomSuffix,
  byAscendingId,
  sortedUniq,
  toHexStringOfMinLength,
} from 'src/utils';

class CustomFontEmbedder {
  static for = (fontData: Uint8Array) => new CustomFontEmbedder(fontData);

  readonly font: Font;
  readonly scale: number;
  readonly fontData: Uint8Array;

  private readonly allGlyphsInFontSortedById: Glyph[];

  private constructor(fontData: Uint8Array) {
    this.font = fontkit.create(fontData);
    this.scale = 1000 / this.font.unitsPerEm;
    this.fontData = fontData;

    const glyphs: Glyph[] = new Array(this.font.characterSet.length);
    for (let idx = 0, len = glyphs.length; idx < len; idx++) {
      const codePoint = this.font.characterSet[idx];
      glyphs[idx] = this.font.glyphForCodePoint(codePoint);
    }

    this.allGlyphsInFontSortedById = sortedUniq(
      glyphs.sort(byAscendingId),
      (g) => g.id,
    );
  }

  embedIntoContext(context: PDFContext): PDFRef {
    const fontName = addRandomSuffix(this.font.postscriptName || 'Font');
    return this.embedFontDict(context, fontName);
  }

  encodeText(text: string): PDFHexString {
    const { glyphs } = this.font.layout(text);
    const hexCodes = new Array(glyphs.length);
    for (let idx = 0, len = glyphs.length; idx < len; idx++) {
      hexCodes[idx] = toHexStringOfMinLength(glyphs[idx].id, 4);
    }
    return PDFHexString.of(hexCodes.join(''));
  }

  private embedFontDict(context: PDFContext, fontName: string): PDFRef {
    const cidFontDictRef = this.embedCIDFontDict(context, fontName);
    const unicodeCMapRef = this.embedUnicodeCmap(context);

    const fontDict = context.obj({
      Type: 'Font',
      Subtype: 'Type0',
      BaseFont: fontName,
      Encoding: 'Identity-H',
      DescendantFonts: [cidFontDictRef],
      ToUnicode: unicodeCMapRef,
    });

    return context.register(fontDict);
  }

  private embedCIDFontDict(context: PDFContext, fontName: string): PDFRef {
    const fontDescriptorRef = this.embedFontDescriptor(context, fontName);

    const cidFontDict = context.obj({
      Type: 'Font',
      Subtype: this.font.cff ? 'CIDFontType0' : 'CIDFontType2',
      BaseFont: fontName,
      CIDSystemInfo: {
        Registry: PDFString.of('Adobe'),
        Ordering: PDFString.of('Identity'),
        Supplement: 0,
      },
      FontDescriptor: fontDescriptorRef,
      W: this.computeWidths(),
    });

    return context.register(cidFontDict);
  }

  private embedFontDescriptor(context: PDFContext, fontName: string): PDFRef {
    const fontStreamRef = this.embedFontStream(context);

    const { scale } = this;
    const { italicAngle, ascent, descent, capHeight, xHeight } = this.font;
    const { minX, minY, maxX, maxY } = this.font.bbox;

    const fontDescriptor = context.obj({
      Type: 'FontDescriptor',
      FontName: fontName,
      Flags: deriveFontFlags(this.font),
      FontBBox: [minX * scale, minY * scale, maxX * scale, maxY * scale],
      ItalicAngle: italicAngle,
      Ascent: ascent * scale,
      Descent: descent * scale,
      CapHeight: (capHeight || ascent) * scale,
      XHeight: (xHeight || 0) * scale,

      // Not sure how to compute/find this, nor is anybody else really:
      // https://stackoverflow.com/questions/35485179/stemv-value-of-the-truetype-font
      StemV: 0,

      [this.font.cff ? 'FontFile3' : 'FontFile2']: fontStreamRef,
    });

    return context.register(fontDescriptor);
  }

  private embedFontStream(context: PDFContext): PDFRef {
    const fontStream = context.flateStream(this.fontData, {
      Subtype: 'CIDFontType0C',
    });
    return context.register(fontStream);
  }

  private embedUnicodeCmap(context: PDFContext): PDFRef {
    const cmap = createCmap(this.allGlyphsInFontSortedById);
    const cmapStream = context.flateStream(cmap);
    return context.register(cmapStream);
  }

  private computeWidths(): Array<number | number[]> {
    const glyphs = this.allGlyphsInFontSortedById;

    const widths: Array<number | number[]> = [];
    const currSection: number[] = [];

    for (let idx = 0, len = glyphs.length; idx < len; idx++) {
      const currGlyph = glyphs[idx];
      const prevGlyph = glyphs[idx - 1];

      if (idx === 0) {
        widths.push(currGlyph.id);
      } else if (currGlyph.id - prevGlyph.id !== 1) {
        widths.push(currSection);
        widths.push(currGlyph.id);
      }

      currSection.push(currGlyph.advanceWidth * this.scale);
    }

    widths.push(currSection);

    return widths;
  }
}

export default CustomFontEmbedder;
