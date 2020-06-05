import PDFDict from 'src/core/objects/PDFDict';
import PDFAcroChoice from 'src/core/acroform/PDFAcroChoice';
import PDFContext from 'src/core/PDFContext';
import { AcroChoiceFlags } from 'src/core/acroform/flags';

class PDFAcroComboBox extends PDFAcroChoice {
  static fromDict = (dict: PDFDict) => new PDFAcroComboBox(dict);

  static create = (context: PDFContext) => {
    const dict = context.obj({
      FT: 'Ch',
      Ff: AcroChoiceFlags.Combo,
      Kids: [],
    });
    return new PDFAcroComboBox(dict);
  };
}

export default PDFAcroComboBox;
