import PDFDict from 'src/core/objects/PDFDict';
import PDFAcroButton from 'src/core/acroform/PDFAcroButton';
import PDFContext from 'src/core/PDFContext';
import { AcroButtonFlags } from 'src/core/acroform/flags';
import PDFRef from '../objects/PDFRef';

class PDFAcroPushButton extends PDFAcroButton {
  static fromDict = (dict: PDFDict, ref: PDFRef) =>
    new PDFAcroPushButton(dict, ref);

  static create = (context: PDFContext) => {
    const dict = context.obj({
      FT: 'Btn',
      Ff: AcroButtonFlags.PushButton,
      Kids: [],
    });
    const ref = context.register(dict);
    return new PDFAcroPushButton(dict, ref);
  };
}

export default PDFAcroPushButton;
