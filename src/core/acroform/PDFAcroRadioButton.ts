import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFContentStream from 'src/core/structures/PDFContentStream';
import { rgb, drawEllipse } from 'src/api';
import { PDFAcroButton } from 'src/core/acroform';

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

  updateAppearances() {
    const widgets = this.getWidgets();

    for (let idx = 0, len = widgets.length; idx < len; idx++) {
      const widget = widgets[idx];
      const { width, height } = widget.getRectangle();

      const onValue = widget.getOnValue();
      if (onValue) {
        const xObjectDict = this.dict.context.obj({
          Type: 'XObject',
          Subtype: 'Form',
          BBox: this.dict.context.obj([0, 0, width, height]),
          Matrix: this.dict.context.obj([1, 0, 0, 1, 0, 0]),
        });

        const KAPPA = 4.0 * ((Math.sqrt(2) - 1.0) / 3.0);
        const outline = drawEllipse({
          x: width / 2,
          y: height / 2,
          xScale: width / 2 - KAPPA,
          yScale: height / 2 - KAPPA,
          color: rgb(1, 1, 1),
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });
        const dot = drawEllipse({
          x: width / 2,
          y: height / 2,
          xScale: (width / 2 - KAPPA) * 0.45,
          yScale: (height / 2 - KAPPA) * 0.45,
          color: rgb(0, 0, 0),
          borderColor: undefined,
          borderWidth: 0,
        });
        const outlineDown = drawEllipse({
          x: width / 2,
          y: height / 2,
          xScale: width / 2 - KAPPA,
          yScale: height / 2 - KAPPA,
          color: rgb(0.8, 0.8, 0.8),
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });

        const onStream = PDFContentStream.of(xObjectDict, [...outline, ...dot]);
        const onStreamRef = this.dict.context.register(onStream);

        const offStream = PDFContentStream.of(xObjectDict, [...outline]);
        const offStreamRef = this.dict.context.register(offStream);

        const onDownStream = PDFContentStream.of(xObjectDict, [
          ...outlineDown,
          ...dot,
        ]);
        const onDownStreamRef = this.dict.context.register(onDownStream);

        const offDownStream = PDFContentStream.of(xObjectDict, [
          ...outlineDown,
        ]);
        const offDownStreamRef = this.dict.context.register(offDownStream);

        const appearance = this.dict.context.obj({});
        appearance.set(onValue, onStreamRef);
        appearance.set(PDFName.of('Off'), offStreamRef);

        const appearance1 = this.dict.context.obj({});
        appearance1.set(onValue, onDownStreamRef);
        appearance1.set(PDFName.of('Off'), offDownStreamRef);

        widget.setNormalAppearance(appearance);
        widget.removeRolloverAppearance();
        widget.setDownAppearance(appearance1);
      }
    }
  }
}

export default PDFAcroRadioButton;
