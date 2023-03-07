import PDFDict from '../objects/PDFDict';
import PDFRef from '../objects/PDFRef';
import PDFAcroTerminal from './PDFAcroTerminal';

class PDFAcroSignature extends PDFAcroTerminal {
  static fromDict = (dict: PDFDict, ref: PDFRef) =>
    new PDFAcroSignature(dict, ref);
}

export default PDFAcroSignature;
