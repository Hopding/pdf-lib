import sum from 'lodash/sum';

import {
  Encodings,
  Font,
  FontNames,
  IEncoding as IStandardEncoding,
  IFontNames,
} from '@pdf-lib/standard-fonts';

import PDFDocument from 'core/pdf-document/PDFDocument';
import {
  PDFDictionary,
  PDFHexString,
  PDFIndirectReference,
  PDFName,
} from 'core/pdf-objects';
import values from 'lodash/values';
import { toCharCode, toHexString } from 'utils';
import { isInstance, oneOf, validate } from 'utils/validate';

/**
 * This Factory supports Standard fonts. Note that the apparent
 * hardcoding of values for OpenType fonts does not actually affect TrueType
 * fonts.
 *
 * A note of thanks to the developers of https://github.com/foliojs/pdfkit,
 * as this class borrows from:
 * https://github.com/foliojs/pdfkit/blob/f91bdd61c164a72ea06be1a43dc0a412afc3925f/lib/font/afm.coffee
 */
class PDFFontFactory {
  static for = (fontName: IFontNames): PDFFontFactory =>
    new PDFFontFactory(fontName);

  encoding: IStandardEncoding;
  fontName: IFontNames;
  font: Font;

  constructor(fontName: IFontNames) {
    validate(
      fontName,
      oneOf(...values(FontNames)),
      'PDFDocument.embedFont: "fontName" must be one of the Standard 14 Fonts: ' +
        values(FontNames).join(', '),
    );
    this.fontName = fontName;
    this.font = Font.load(fontName);

    // prettier-ignore
    this.encoding =
        fontName === FontNames.ZapfDingbats ? Encodings.ZapfDingbats
      : fontName === FontNames.Symbol       ? Encodings.Symbol
      : Encodings.WinAnsi;
  }

  embedFontIn = (pdfDoc: PDFDocument): PDFIndirectReference<PDFDictionary> => {
    validate(
      pdfDoc,
      isInstance(PDFDocument),
      'PDFFontFactory.embedFontIn: "pdfDoc" must be an instance of PDFDocument',
    );

    const fontDict = PDFDictionary.from(
      {
        Type: PDFName.from('Font'),
        Subtype: PDFName.from('Type1'),
        BaseFont: PDFName.from(this.font.FontName),
      },
      pdfDoc.index,
    );

    // ZapfDingbats and Symbol don't have explicit Encoding entries
    if (this.encoding === Encodings.WinAnsi) {
      fontDict.set('Encoding', PDFName.from('WinAnsiEncoding'));
    }

    return pdfDoc.register(fontDict);
  };

  encodeText = (text: string): PDFHexString =>
    PDFHexString.fromString(
      this.encodeTextAsGlyphs(text)
        .map((glyph) => glyph.code)
        .map(toHexString)
        .join(''),
    );

  widthOfTextAtSize = (text: string, size: number) => {
    const charNames = this.encodeTextAsGlyphs(text).map((glyph) => glyph.name);

    const widths = charNames.map((charName, idx) => {
      const left = charName;
      const right = charNames[idx + 1];
      const kernAmount = this.font.getXAxisKerningForPair(left, right) || 0;
      return this.widthOfGlyph(left) + kernAmount;
    });

    const scale = size / 1000;

    return sum(widths) * scale;
  };

  heightOfFontAtSize = (size: number) => {
    const yTop = this.font.Ascender || this.font.FontBBox[3];
    const yBottom = this.font.Descender || this.font.FontBBox[1];
    return ((yTop - yBottom) / 1000) * size;
  };

  // We'll default to 250 if our font metrics don't specify a width
  private widthOfGlyph = (glyphName: string) =>
    this.font.getWidthOfGlyph(glyphName) || 250;

  private encodeTextAsGlyphs = (text: string) =>
    text
      .split('')
      .map(toCharCode)
      .map(this.encoding.encodeUnicodeCodePoint);

  // /** @hidden */
  // getWidths = () => {
  //   return this.font.CharMetrics.map((metric) => metric.width);
  //   // throw new Error('getWidths() Not implemented yet for Standard Font');
  // };
  //
  // getCodePointWidth = () => {
  //   throw new Error(
  //     'getCodePointWidth() Not implemented yet for Standard Font',
  //   );
  // };
}

export default PDFFontFactory;
