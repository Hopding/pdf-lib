import PDFDict from 'src/core/objects/PDFDict';
import { PDFAcroTerminal } from 'src/core/acroform';

class PDFAcroText extends PDFAcroTerminal {
  static fromDict = (dict: PDFDict) => new PDFAcroText(dict);
}

export default PDFAcroText;
