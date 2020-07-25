import PDFDict from 'src/core/objects/PDFDict';
import PDFRef from 'src/core/objects/PDFRef';
import PDFAcroTerminal from 'src/core/acroform/PDFAcroTerminal';

class PDFAcroSignature extends PDFAcroTerminal {
  static fromDict = (dict: PDFDict, ref: PDFRef) =>
    new PDFAcroSignature(dict, ref);
}

export default PDFAcroSignature;
