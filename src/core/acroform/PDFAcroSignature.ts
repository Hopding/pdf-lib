import PDFDict from 'src/core/objects/PDFDict';
import { PDFAcroTerminal } from 'src/core/acroform';

class PDFAcroSignature extends PDFAcroTerminal {
  static fromDict = (dict: PDFDict) => new PDFAcroSignature(dict);
}

export default PDFAcroSignature;
