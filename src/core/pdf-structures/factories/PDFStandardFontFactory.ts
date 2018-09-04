import PDFDocument from 'core/pdf-document/PDFDocument';
import {
  PDFDictionary,
  PDFHexString,
  PDFIndirectReference,
  PDFName,
} from 'core/pdf-objects';
import values from 'lodash/values';
import { isInstance, oneOf, validate } from 'utils/validate';

import Standard14Fonts, {
  IStandard14FontsUnion,
} from 'core/pdf-document/Standard14Fonts';

import IPDFFontEncoder from 'core/pdf-structures/factories/PDFFontEncoder';

const UnicodeToWinAnsiMap: { [index: number]: number } = {
  402: 131, // ƒ
  8211: 150, // –
  8212: 151, // —
  8216: 145, // ‘
  8217: 146, // ’
  8218: 130, // ‚
  8220: 147, // “
  8221: 148, // ”
  8222: 132, // „
  8224: 134, // †
  8225: 135, // ‡
  8226: 149, // •
  8230: 133, // …
  8364: 128, // €
  8240: 137, // ‰
  8249: 139, // ‹
  8250: 155, // ›
  710: 136, // ˆ
  8482: 153, // ™
  338: 140, // Œ
  339: 156, // œ
  732: 152, // ˜
  352: 138, // Š
  353: 154, // š
  376: 159, // Ÿ
  381: 142, // Ž
  382: 158, // ž
};

/**
 * This Factory supports Standard fonts. Note that the apparent
 * hardcoding of values for OpenType fonts does not actually affect TrueType
 * fonts.
 *
 * A note of thanks to the developers of https://github.com/foliojs/pdfkit,
 * as this class borrows from:
 * https://github.com/foliojs/pdfkit/blob/f91bdd61c164a72ea06be1a43dc0a412afc3925f/lib/font/afm.coffee
 */
class PDFStandardFontFactory implements IPDFFontEncoder {
  static for = (fontName: IStandard14FontsUnion): PDFStandardFontFactory =>
    new PDFStandardFontFactory(fontName);

  fontName: IStandard14FontsUnion;

  constructor(fontName: IStandard14FontsUnion) {
    validate(
      fontName,
      oneOf(...Standard14Fonts),
      'PDFDocument.embedStandardFont: "fontName" must be one of the Standard 14 Fonts: ' +
        values(Standard14Fonts).join(', '),
    );
    this.fontName = fontName;
  }
  encodeText = (text: string): PDFHexString =>
    PDFHexString.fromString(
      text
        .split('')
        .map((char) => char.charCodeAt(0))
        .map((charCode) => UnicodeToWinAnsiMap[charCode] || charCode)
        .map((charCode) => charCode.toString(16))
        .join(''),
    );

  /*
      TODO:
      A Type 1 font dictionary may contain the entries listed in Table 111.
      Some entries are optional for the standard 14 fonts listed under 9.6.2.2,
        "Standard Type 1 Fonts (Standard 14 Fonts)", but are required otherwise.

      NOTE: For compliance sake, these standard 14 font dictionaries need to be
            updated to include the following entries:
              • FirstChar
              • LastChar
              • Widths
              • FontDescriptor
            See "Table 111 – Entries in a Type 1 font dictionary (continued)"
            for details on this...
    */
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
          BaseFont: PDFName.from(this.fontName),
        },
        pdfDoc.index,
      ),
    );
  };

  /** @hidden */
  getWidths = () => {
    throw new Error('getWidths() Not implemented yet for Standard Font');
  };

  getCodePointWidth = () => {
    throw new Error(
      'getCodePointWidth() Not implemented yet for Standard Font',
    );
  };
}

export default PDFStandardFontFactory;
