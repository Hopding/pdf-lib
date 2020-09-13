import PDFDict from 'src/core/objects/PDFDict';
import PDFAcroChoice from 'src/core/acroform/PDFAcroChoice';
import PDFContext from 'src/core/PDFContext';
import PDFRef from 'src/core/objects/PDFRef';
import { AcroChoiceFlags } from 'src/core/acroform/flags';

class PDFAcroComboBox extends PDFAcroChoice {
  static fromDict = (dict: PDFDict, ref: PDFRef) =>
    new PDFAcroComboBox(dict, ref);

  static create = (context: PDFContext) => {
    const dict = context.obj({
      FT: 'Ch',
      Ff: AcroChoiceFlags.Combo,
      Kids: [],
    });
    const ref = context.register(dict);
    return new PDFAcroComboBox(dict, ref);
  };
}

export default PDFAcroComboBox;
