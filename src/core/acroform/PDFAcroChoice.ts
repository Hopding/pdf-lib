import PDFDict from 'src/core/objects/PDFDict';
import { PDFAcroTerminal } from 'src/core/acroform';

class PDFAcroChoice extends PDFAcroTerminal {
  static fromDict = (dict: PDFDict) => new PDFAcroChoice(dict);
}

export default PDFAcroChoice;
