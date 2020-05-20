import PDFDict from 'src/core/objects/PDFDict';
import PDFAcroChoice from 'src/core/acroform/PDFAcroChoice';

class PDFAcroListBox extends PDFAcroChoice {
  static fromDict = (dict: PDFDict) => new PDFAcroListBox(dict);
}

export default PDFAcroListBox;
