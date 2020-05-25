import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFAcroButton from 'src/core/acroform/PDFAcroButton';

class PDFAcroCheckBox extends PDFAcroButton {
  static fromDict = (dict: PDFDict) => new PDFAcroCheckBox(dict);

  setValue(value: PDFName) {
    const onValue = this.getOnValue();
    if (value !== onValue && value !== PDFName.of('Off')) {
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

  getOnValue(): PDFName | undefined {
    const [widget] = this.getWidgets();
    return widget.getOnValue();
  }
}

export default PDFAcroCheckBox;
