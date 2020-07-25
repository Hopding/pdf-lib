import PDFDict from 'src/core/objects/PDFDict';
import PDFAcroTerminal from 'src/core/acroform/PDFAcroTerminal';
import PDFRef from '../objects/PDFRef';

class PDFAcroSignature extends PDFAcroTerminal {
  static fromDict = (dict: PDFDict, ref: PDFRef) =>
    new PDFAcroSignature(dict, ref);
}

export default PDFAcroSignature;
