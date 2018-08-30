
import PDFDocument from 'core/pdf-document/PDFDocument';
import {
  PDFName,
  PDFDictionary,
  PDFIndirectReference,
  PDFHexString,
} from 'core/pdf-objects';
import { isInstance, validate, oneOf } from 'utils/validate';
import values from 'lodash/values';

import Standard14Fonts, {
  IStandard14FontsUnion,
} from 'core/pdf-document/Standard14Fonts';

import PDFFontEncoder from 'core/pdf-structures/factories/PDFFontEncoder'

const toWinAnsi= (charCode: number): number => {
	switch (charCode) {
		case  402: return 131 // ƒ
		case 8211: return 150 // –
		case 8212: return 151 // —
		case 8216: return 145 // ‘
		case 8217: return 146 // ’
		case 8218: return 130 // ‚
		case 8220: return 147 // “
		case 8221: return 148 // ”
		case 8222: return 132 // „
		case 8224: return 134 // †
		case 8225: return 135 // ‡
		case 8226: return 149 // •
		case 8230: return 133 // …
		case 8364: return 128 // €
		case 8240: return 137 // ‰
		case 8249: return 139 // ‹
		case 8250: return 155 // ›
		case  710: return 136 // ˆ
		case 8482: return 153 // ™
		case  338: return 140 // Œ
		case  339: return 156 // œ
		case  732: return 152 // ˜
		case  352: return 138 // Š
		case  353: return 154 // š
		case  376: return 159 // Ÿ
		case  381: return 142 // Ž
		case  382: return 158 // ž
		default: return charCode
	}
}
/**
 * This Factory supports Standard fonts. Note that the apparent
 * hardcoding of values for OpenType fonts does not actually affect TrueType
 * fonts.
 *
 * A note of thanks to the developers of https://github.com/foliojs/pdfkit,
 * as this class borrows from:
 * https://github.com/foliojs/pdfkit/blob/f91bdd61c164a72ea06be1a43dc0a412afc3925f/lib/font/afm.coffee
 */
class PDFStandardFontFactory implements PDFFontEncoder {
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
    this.fontName = fontName
  }
  encodeText(text: string): PDFHexString {
		return PDFHexString.fromString(text
		.split('')
		.map((char: string): number => char.charCodeAt(0))
		.map(toWinAnsi)
		.map((charCode: number): string => charCode.toString(16))
		.join(''))
	}
  encode(text: string): [PDFHexString] {
		return [ this.encodeText(text) ]
  }
  
  embedFontIn = (
    pdfDoc: PDFDocument,
  ): PDFIndirectReference<PDFDictionary> => {
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
      )
  }

  /** @hidden */
  getWidths = () => {
    throw new Error('getWidths() Not implemented yet for Standard Font')
  }

  getCodePointWidth = () => {
    throw new Error('getCodePointWidth() Not implemented yet for Standard Font')
  }

}

export default PDFStandardFontFactory;