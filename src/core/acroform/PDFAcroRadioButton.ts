import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFAcroButton from 'src/core/acroform/PDFAcroButton';
import PDFContext from 'src/core/PDFContext';
import { AcroButtonFlags } from 'src/core/acroform/flags';
import { InvalidAcroFieldValueError } from '../errors';

class PDFAcroRadioButton extends PDFAcroButton {
  static fromDict = (dict: PDFDict) => new PDFAcroRadioButton(dict);

  static create = (context: PDFContext) => {
    const dict = context.obj({
      FT: 'Btn',
      Ff: AcroButtonFlags.Radio,
      Kids: [],
    });
    return new PDFAcroRadioButton(dict);
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
      if (widget.getOnValue() === value) {
        console.log('---------');
        console.log('Found widget with value:', value);
        console.log('---------');
      }
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
