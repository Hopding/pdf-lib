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
 * This Factory supports Standard fonts.
 *
 * A note of thanks to the developers of https://github.com/foliojs/pdfkit,
 * as this class borrows from:
 * https://github.com/foliojs/pdfkit/blob/f91bdd61c164a72ea06be1a43dc0a412afc3925f/lib/font/afm.coffee
 */
class PDFStandardFontFactory {
  static for = (fontName: IFontNames): PDFStandardFontFactory =>
    new PDFStandardFontFactory(fontName);

  font: Font;
  fontName: IFontNames;
  encoding: IStandardEncoding;

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

  /**
   * Embeds the font into a [[PDFDocument]].
   *
   * @param pdfDoc A `PDFDocument` object into which the font will be embedded.
   *
   * @returns A `PDFIndirectReference` to the font dictionary that was
   *          embedded in the `PDFDocument`.
   */
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

  /**
   * Encode the JavaScript string into this font. JavaScript encodes strings in
   * Unicode, but standard fonts use either WinAnsi, ZapfDingbats, or Symbol
   * encodings. This method should be used to encode text before passing the
   * encoded text to one of the text showing operators, such as [[drawText]] or
   * [[drawLinesOfText]].
   *
   * @param text The string of text to be encoded.
   *
   * @returns A `PDFHexString` of the encoded text.
   */
  encodeText = (text: string): PDFHexString =>
    PDFHexString.fromString(
      this.encodeTextAsGlyphs(text)
        .map((glyph) => glyph.code)
        .map(toHexString)
        .join(''),
    );

  /**
   * Measures the width of the JavaScript string when displayed as glyphs of
   * this font of a particular `size`.
   *
   * @param text The string of text to be measured.
   * @param size The size to be used when calculating the text's width.
   *
   * @returns A `number` representing the width of the text.
   */
  widthOfTextAtSize = (text: string, size: number): number => {
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

  /**
   * Measures the height of this font at a particular size. Note that the height
   * of the font is independent of the particular glyphs being displayed, so
   * this method does not accept a `text` param, like
   * [[PDFStandardFontFactory.widthOfTextAtSize]] does.
   */
  heightOfFontAtSize = (size: number): number => {
    const { Ascender, Descender, FontBBox } = this.font;
    const yTop = Ascender || FontBBox[3];
    const yBottom = Descender || FontBBox[1];
    return ((yTop - yBottom) / 1000) * size;
  };

  /**
   * Measures the size of this font at a particular height. Note that the size
   * of the font is independent of the particular glyphs being displayed, so
   * this method does not accept a `text` param, like
   * [[PDFStandardFontFactory.widthOfTextAtSize]] does.
   */
  sizeOfFontAtHeight = (height: number): number => {
    const { Ascender, Descender, FontBBox } = this.font;
    const yTop = Ascender || FontBBox[3];
    const yBottom = Descender || FontBBox[1];
    return (1000 * height) / (yTop - yBottom);
  };

  // We'll default to 250 if our font metrics don't specify a width
  private widthOfGlyph = (glyphName: string) =>
    this.font.getWidthOfGlyph(glyphName) || 250;

  private encodeTextAsGlyphs = (text: string) =>
    text
      .split('')
      .map(toCharCode)
      .map(this.encoding.encodeUnicodeCodePoint);
}

export default PDFStandardFontFactory;
