import PDFDict from 'src/core/objects/PDFDict';
import PDFAcroButton from 'src/core/acroform/PDFAcroButton';
import PDFContext from 'src/core/PDFContext';
import { AcroButtonFlags } from 'src/core/acroform/flags';
import PDFString from '../objects/PDFString';
import PDFHexString from '../objects/PDFHexString';
import PDFName from '../objects/PDFName';

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

  DA(): PDFString | PDFHexString | undefined {
    const da = this.dict.lookup(PDFName.of('DA'));
    if (da instanceof PDFString || da instanceof PDFHexString) return da;
    return undefined;
  }

  setDefaultAppearance(appearance: string) {
    this.dict.set(PDFName.of('DA'), PDFString.of(appearance));
  }

  getDefaultAppearance(): string | undefined {
    return this.DA()?.asString() ?? '';
  }
}

export default PDFAcroPushButton;
