import PDFContext from '../PDFContext';
import PDFRef from '../objects/PDFRef';
import PDFDict from '../objects/PDFDict';
import PDFName from '../objects/PDFName';
import PDFAcroButton from './PDFAcroButton';
import { InvalidAcroFieldValueError } from '../errors';

class PDFAcroCheckBox extends PDFAcroButton {
  static fromDict = (dict: PDFDict, ref: PDFRef) =>
    new PDFAcroCheckBox(dict, ref);

  static create = (context: PDFContext) => {
    const dict = context.obj({
      FT: 'Btn',
      Kids: [],
    });
    const ref = context.register(dict);
    return new PDFAcroCheckBox(dict, ref);
  };

  setValue(value: PDFName) {
    const onValue = this.getOnValue() ?? PDFName.of('Yes');
    if (value !== onValue && value !== PDFName.of('Off')) {
      throw new InvalidAcroFieldValueError();
    }

    this.dict.set(PDFName.of('V'), value);

    const widgets = this.getWidgets();
    for (let idx = 0, len = widgets.length; idx < len; idx++) {
      const widget = widgets[idx];
      const state = widget.getOnValue() === value ? value : PDFName.of('Off');
      widget.setAppearanceState(state);
    }
  }

  getValue(): PDFName {
    const v = this.V();
    if (v instanceof PDFName) return v;
    return PDFName.of('Off');
  }

  getOnValue(): PDFName | undefined {
    const [widget] = this.getWidgets();
    return widget?.getOnValue();
  }
}

export default PDFAcroCheckBox;
