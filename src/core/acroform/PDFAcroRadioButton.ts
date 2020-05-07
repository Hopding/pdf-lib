import PDFDict from 'src/core/objects/PDFDict';
import { PDFAcroButton } from 'src/core/acroform';
import PDFName from 'src/core/objects/PDFName';

class PDFAcroRadioButton extends PDFAcroButton {
  static fromDict = (dict: PDFDict) => new PDFAcroRadioButton(dict);

  setValue(value: PDFName) {
    const onValues = this.getOnValues();
    if (!onValues.includes(value) && value !== PDFName.of('Off')) {
      throw new Error(
        'TODO: FIX ME - INVALID VALUE FOR <FIELD> ... SHOW VALID OPTIONS...',
      );
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
