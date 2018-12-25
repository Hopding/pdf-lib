export { default as PDFDocument } from './PDFDocument';
export { default as PDFDocumentFactory } from './PDFDocumentFactory';
export { default as PDFDocumentWriter } from './PDFDocumentWriter';
export { default as PDFObjectIndex } from './PDFObjectIndex';
export { default as PDFObjectCopier } from './PDFObjectCopier';

// TODO: This is for backwards compatibility. Remove in v1.0.0
import { FontNames, IFontNames } from '@pdf-lib/standard-fonts';
const Standard14Fonts = Object.values(FontNames);
export { Standard14Fonts, IFontNames as IStandard14FontsUnion };
