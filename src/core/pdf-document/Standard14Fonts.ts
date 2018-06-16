/**
 * **Specification: "9.6.2.2 Standard Type 1 Fonts (Standard 14 Fonts)"**
 *
 * These are the PostScript names of 14 Type 1 fonts, known as the standard 14
 * fonts. These fonts, or their font metrics and suitable substitution fonts,
 * shall be available to the conforming reader.
 */
const Standard14Fonts: IStandard14FontsUnion[] = [
  'Times-Roman',
  'Helvetica',
  'Courier',
  'Symbol',
  'Times-Bold',
  'Helvetica-Bold',
  'Courier-Bold',
  'ZapfDingbats',
  'Times-Italic',
  'Helvetica-Oblique',
  'Courier-Oblique',
  'Times-BoldItalic',
  'Helvetica-BoldOblique',
  'Courier-BoldOblique',
];

export type IStandard14FontsUnion =
  | 'Times-Roman'
  | 'Helvetica'
  | 'Courier'
  | 'Symbol'
  | 'Times-Bold'
  | 'Helvetica-Bold'
  | 'Courier-Bold'
  | 'ZapfDingbats'
  | 'Times-Italic'
  | 'Helvetica-Oblique'
  | 'Courier-Oblique'
  | 'Times-BoldItalic'
  | 'Helvetica-BoldOblique'
  | 'Courier-BoldOblique';

export default Standard14Fonts;
