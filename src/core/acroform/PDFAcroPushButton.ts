import PDFDict from 'src/core/objects/PDFDict';
import PDFAcroButton from 'src/core/acroform/PDFAcroButton';
import PDFContext from 'src/core/PDFContext';
import { AcroButtonFlags } from 'src/core/acroform/flags';

class PDFAcroPushButton extends PDFAcroButton {
  static fromDict = (dict: PDFDict) => new PDFAcroPushButton(dict);

  static create = (context: PDFContext) => {
    const dict = context.obj({
      FT: 'Btn',
      Ff: AcroButtonFlags.PushButton,
      Kids: [],
    });
    return new PDFAcroPushButton(dict);
  };
}

export default PDFAcroPushButton;
