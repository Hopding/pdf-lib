import PDFDict from 'src/core/objects/PDFDict';
import { PDFAcroButton } from 'src/core/acroform';

class PDFAcroPushButton extends PDFAcroButton {
  static fromDict = (dict: PDFDict) => new PDFAcroPushButton(dict);
}

export default PDFAcroPushButton;
