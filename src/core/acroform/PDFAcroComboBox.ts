import PDFDict from '../objects/PDFDict';
import PDFAcroChoice from './PDFAcroChoice';
import PDFContext from '../PDFContext';
import PDFRef from '../objects/PDFRef';
import { AcroChoiceFlags } from './flags';
import { PDFClasses } from '../../api/objects';

class PDFAcroComboBox extends PDFAcroChoice {
  static className = () => PDFClasses.PDFAcroComboBox;
  myClass(): PDFClasses {
    return PDFClasses.PDFAcroComboBox;
  }
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
