import PDFContext from '../PDFContext';
import PDFDict from '../objects/PDFDict';
import PDFNumber from '../objects/PDFNumber';
import PDFString from '../objects/PDFString';
import PDFHexString from '../objects/PDFHexString';
import PDFName from '../objects/PDFName';
import PDFRef from '../objects/PDFRef';
import PDFAcroTerminal from './PDFAcroTerminal';
import { isPDFInstance, PDFClasses } from '../../api/objects';

class PDFAcroText extends PDFAcroTerminal {
  static className = () => PDFClasses.PDFAcroText;
  myClass(): PDFClasses {
    return PDFClasses.PDFAcroText;
  }
  static fromDict = (dict: PDFDict, ref: PDFRef) => new PDFAcroText(dict, ref);

  static create = (context: PDFContext) => {
    const dict = context.obj({
      FT: 'Tx',
      Kids: [],
    });
    const ref = context.register(dict);
    return new PDFAcroText(dict, ref);
  };

  MaxLen(): PDFNumber | undefined {
    const maxLen = this.dict.lookup(PDFName.of('MaxLen'));
    if (isPDFInstance(maxLen, PDFClasses.PDFNumber)) return maxLen as PDFNumber;
    return undefined;
  }

  Q(): PDFNumber | undefined {
    const q = this.dict.lookup(PDFName.of('Q'));
    if (isPDFInstance(q, PDFClasses.PDFNumber)) return q as PDFNumber;
    return undefined;
  }

  setMaxLength(maxLength: number) {
    this.dict.set(PDFName.of('MaxLen'), PDFNumber.of(maxLength));
  }

  removeMaxLength() {
    this.dict.delete(PDFName.of('MaxLen'));
  }

  getMaxLength(): number | undefined {
    return this.MaxLen()?.asNumber();
  }

  setQuadding(quadding: 0 | 1 | 2) {
    this.dict.set(PDFName.of('Q'), PDFNumber.of(quadding));
  }

  getQuadding(): number | undefined {
    return this.Q()?.asNumber();
  }

  setValue(value: PDFHexString | PDFString) {
    this.dict.set(PDFName.of('V'), value);

    // const widgets = this.getWidgets();
    // for (let idx = 0, len = widgets.length; idx < len; idx++) {
    //   const widget = widgets[idx];
    //   const state = widget.getOnValue() === value ? value : PDFName.of('Off');
    //   widget.setAppearanceState(state);
    // }
  }

  removeValue() {
    this.dict.delete(PDFName.of('V'));
  }

  getValue(): PDFString | PDFHexString | undefined {
    const v = this.V();
    if (
      isPDFInstance(v, PDFClasses.PDFString) ||
      isPDFInstance(v, PDFClasses.PDFHexString)
    )
      return v as PDFString | PDFHexString;
    return undefined;
  }
}

export default PDFAcroText;
