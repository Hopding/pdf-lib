import PDFRef from '../objects/PDFRef';
import PDFDict from '../objects/PDFDict';
import PDFName from '../objects/PDFName';
import PDFAcroButton from './PDFAcroButton';
import PDFContext from '../PDFContext';
import { AcroButtonFlags } from './flags';
import { InvalidAcroFieldValueError } from '../errors';

class PDFAcroRadioButton extends PDFAcroButton {
  static fromDict = (dict: PDFDict, ref: PDFRef) =>
    new PDFAcroRadioButton(dict, ref);

  static create = (context: PDFContext) => {
    const dict = context.obj({
      FT: 'Btn',
      Ff: AcroButtonFlags.Radio,
      Kids: [],
    });
    const ref = context.register(dict);
    return new PDFAcroRadioButton(dict, ref);
  };

  setValue(value: PDFName) {
    const onValues = this.getOnValues();
    if (!onValues.includes(value) && value !== PDFName.of('Off')) {
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

  getOnValues(): PDFName[] {
    const widgets = this.getWidgets();

    const onValues: PDFName[] = [];
    for (let idx = 0, len = widgets.length; idx < len; idx++) {
      const onValue = widgets[idx].getOnValue();
      if (onValue) onValues.push(onValue);
    }

    return onValues;
  }
}

export default PDFAcroRadioButton;
