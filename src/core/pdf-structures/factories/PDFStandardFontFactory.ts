import sum from 'lodash/sum';

import StandardFont, {
  FontNames as StandardFontNames,
  IFontNames as IStandardFontNames,
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

import { convertUnicodeToWinAnsi, lookupWinAnsiCharName } from './WinAnsi';

/**
 * This Factory supports Standard fonts. Note that the apparent
 * hardcoding of values for OpenType fonts does not actually affect TrueType
 * fonts.
 *
 * A note of thanks to the developers of https://github.com/foliojs/pdfkit,
 * as this class borrows from:
 * https://github.com/foliojs/pdfkit/blob/f91bdd61c164a72ea06be1a43dc0a412afc3925f/lib/font/afm.coffee
 */
class PDFStandardFontFactory {
  static for = (fontName: IStandardFontNames): PDFStandardFontFactory =>
    new PDFStandardFontFactory(fontName);

  fontName: IStandardFontNames;
  font: StandardFont;

  constructor(fontName: IStandardFontNames) {
    validate(
      fontName,
      oneOf(...values(StandardFontNames)),
      'PDFDocument.embedStandardFont: "fontName" must be one of the Standard 14 Fonts: ' +
        values(StandardFontNames).join(', '),
    );
    this.fontName = fontName;
    this.font = StandardFont.load(fontName);
  }

  embedFontIn = (pdfDoc: PDFDocument): PDFIndirectReference<PDFDictionary> => {
    validate(
      pdfDoc,
      isInstance(PDFDocument),
      'PDFFontFactory.embedFontIn: "pdfDoc" must be an instance of PDFDocument',
    );
    return pdfDoc.register(
      PDFDictionary.from(
        {
          Type: PDFName.from('Font'),
          Subtype: PDFName.from('Type1'),
          Encoding: PDFName.from('WinAnsiEncoding'),
          BaseFont: PDFName.from(this.font.FontName),
        },
        pdfDoc.index,
      ),
    );
  };

  encodeText = (text: string): PDFHexString =>
    PDFHexString.fromString(
      text
        .split('')
        .map(toCharCode)
        .map(convertUnicodeToWinAnsi)
        .map(toHexString)
        .join(''),
    );

  widthOfTextAtSize = (text: string, size: number) => {
    // The standard font metrics use AdobeStandardEncoding, but we're using
    // WinAnsiEncoding, which means we can't just do a char code lookup.
    // Instead, we have to use the glyph names.
    // See:
    //   • https://www.compart.com/en/unicode/charsets/Adobe-Standard-Encoding
    //   • https://www.compart.com/en/unicode/charsets/windows-1252
    //   • http://www.unicode.org/Public/MAPPINGS/VENDORS/ADOBE/stdenc.txt
    //   • https://www.unicode.org/Public/MAPPINGS/VENDORS/MICSFT/WINDOWS/CP1252.TXT
    const charNames = this.charNamesForString(text);

    const widths = charNames.map((charName, idx) => {
      const left = charName;
      const right = charNames[idx + 1];
      const kernAmount = this.font.getXAmountOfKernPair(left, right) || 0;
      return this.widthOfChar(left) + kernAmount;
    });

    const scale = size / 1000;

    return sum(widths) * scale;
  };

  heightOfTextAtSize = (text: string, size: number) => {
    // TODO: ZapfDingbats and Symbol don't have Ascenders or Descenders
    return (
      (((this.font.Ascender || 0) - (this.font.Descender || 0)) / 1000) * size
    );
  };

  // lineHeight(size, includeGap) {
  //   if (includeGap == null) { includeGap = false; }
  //   const gap = includeGap ? this.lineGap : 0;
  //   return (((this.ascender + gap) - this.descender) / 1000) * size;
  // }

  // We'll default to 250 if our font metrics don't specify a width
  private widthOfChar = (charName: string) =>
    this.font.getWidthOfChar(charName) || 250;

  /**
   *
   */

  private charNamesForString = (text: string) =>
    text
      .split('')
      .map(toCharCode)
      .map(convertUnicodeToWinAnsi)
      .map(lookupWinAnsiCharName);

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

export default PDFStandardFontFactory;
