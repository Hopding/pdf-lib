import PDFDict from '../objects/PDFDict';
import PDFAcroButton from './PDFAcroButton';
import PDFContext from '../PDFContext';
import PDFRef from '../objects/PDFRef';
import { AcroButtonFlags } from './flags';

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
