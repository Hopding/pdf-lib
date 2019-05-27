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
  Cache,
  sortedUniq,
  toHexStringOfMinLength,
} from 'src/utils';

class CustomFontEmbedder {
  static for = (fontData: Uint8Array) => new CustomFontEmbedder(fontData);

  readonly font: Font;
  readonly scale: number;
  readonly fontData: Uint8Array;

  protected fontName: string;
  protected glyphCache: Cache<Glyph[]>;

  protected constructor(fontData: Uint8Array) {
    this.font = fontkit.create(fontData);
    this.scale = 1000 / this.font.unitsPerEm;
    this.fontData = fontData;

    this.fontName = '';
    this.glyphCache = Cache.populatedBy(this.allGlyphsInFontSortedById);
  }

  allGlyphsInFontSortedById = (): Glyph[] => {
    const glyphs: Glyph[] = new Array(this.font.characterSet.length);
    for (let idx = 0, len = glyphs.length; idx < len; idx++) {
      const codePoint = this.font.characterSet[idx];
      glyphs[idx] = this.font.glyphForCodePoint(codePoint);
    }
    return sortedUniq(glyphs.sort(byAscendingId), (g) => g.id);
  };

  embedIntoContext(context: PDFContext): Promise<PDFRef> {
    this.fontName = addRandomSuffix(this.font.postscriptName || 'Font');
    return this.embedFontDict(context);
  }

  encodeText(text: string): PDFHexString {
    const { glyphs } = this.font.layout(text);
    const hexCodes = new Array(glyphs.length);
    for (let idx = 0, len = glyphs.length; idx < len; idx++) {
      hexCodes[idx] = toHexStringOfMinLength(glyphs[idx].id, 4);
    }
    return PDFHexString.of(hexCodes.join(''));
  }

  protected async embedFontDict(context: PDFContext): Promise<PDFRef> {
    const cidFontDictRef = await this.embedCIDFontDict(context);
    const unicodeCMapRef = this.embedUnicodeCmap(context);

    const fontDict = context.obj({
      Type: 'Font',
      Subtype: 'Type0',
      BaseFont: this.fontName,
      Encoding: 'Identity-H',
      DescendantFonts: [cidFontDictRef],
      ToUnicode: unicodeCMapRef,
    });

    return context.register(fontDict);
  }

  protected isCFF(): boolean {
    return this.font.cff;
  }

  protected async embedCIDFontDict(context: PDFContext): Promise<PDFRef> {
    const fontDescriptorRef = await this.embedFontDescriptor(context);

    const cidFontDict = context.obj({
      Type: 'Font',
      Subtype: this.isCFF() ? 'CIDFontType0' : 'CIDFontType2',
      BaseFont: this.fontName,
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

  protected async embedFontDescriptor(context: PDFContext): Promise<PDFRef> {
    const fontStreamRef = await this.embedFontStream(context);

    const { scale } = this;
    const { italicAngle, ascent, descent, capHeight, xHeight } = this.font;
    const { minX, minY, maxX, maxY } = this.font.bbox;

    const fontDescriptor = context.obj({
      Type: 'FontDescriptor',
      FontName: this.fontName,
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

  protected async serializeFont(): Promise<Uint8Array> {
    return this.fontData;
  }

  protected async embedFontStream(context: PDFContext): Promise<PDFRef> {
    const fontStream = context.flateStream(await this.serializeFont(), {
      Subtype: 'CIDFontType0C',
    });
    return context.register(fontStream);
  }

  protected embedUnicodeCmap(context: PDFContext): PDFRef {
    const cmap = createCmap(this.glyphCache.access(), this.glyphId.bind(this));
    const cmapStream = context.flateStream(cmap);
    return context.register(cmapStream);
  }

  protected glyphId(glyph?: Glyph): number {
    return glyph ? glyph.id : -1;
  }

  protected computeWidths(): Array<number | number[]> {
    const glyphs = this.glyphCache.access();

    const widths: Array<number | number[]> = [];
    const currSection: number[] = [];

    for (let idx = 0, len = glyphs.length; idx < len; idx++) {
      const currGlyph = glyphs[idx];
      const prevGlyph = glyphs[idx - 1];

      const currGlyphId = this.glyphId(currGlyph);
      const prevGlyphId = this.glyphId(prevGlyph);

      if (idx === 0) {
        widths.push(currGlyphId);
      } else if (currGlyphId - prevGlyphId !== 1) {
        widths.push(currSection);
        widths.push(currGlyphId);
      }

      currSection.push(currGlyph.advanceWidth * this.scale);
    }

    widths.push(currSection);

    return widths;
  }
}

export default CustomFontEmbedder;
