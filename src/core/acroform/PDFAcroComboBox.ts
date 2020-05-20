import PDFDict from 'src/core/objects/PDFDict';
import PDFAcroChoice from 'src/core/acroform/PDFAcroChoice';

class PDFAcroComboBox extends PDFAcroChoice {
  static fromDict = (dict: PDFDict) => new PDFAcroComboBox(dict);
}

export default PDFAcroComboBox;
