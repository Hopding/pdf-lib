import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
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
    const { context } = this.dict;

    const widgets = this.getWidgets();

    for (let idx = 0, len = widgets.length; idx < len; idx++) {
      const widget = widgets[idx];
      const { width, height } = widget.getRectangle();

      const onValue = widget.getOnValue();
      if (onValue) {
        const BBox = context.obj([0, 0, width, height]);

        const KAPPA = 4.0 * ((Math.sqrt(2) - 1.0) / 3.0);
        const scale = Math.min(width, height) / 2 - KAPPA;
        const outline = drawEllipse({
          x: width / 2,
          y: height / 2,
          xScale: scale,
          yScale: scale,
          color: rgb(1, 1, 1),
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });
        const dot = drawEllipse({
          x: width / 2,
          y: height / 2,
          xScale: scale * 0.45,
          yScale: scale * 0.45,
          color: rgb(0, 0, 0),
          borderColor: undefined,
          borderWidth: 0,
        });
        const outlineDown = drawEllipse({
          x: width / 2,
          y: height / 2,
          xScale: scale,
          yScale: scale,
          color: rgb(0.8, 0.8, 0.8),
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });

        const onStream = context.formXObject([...outline, ...dot], { BBox });
        const onStreamRef = context.register(onStream);

        const offStream = context.formXObject([...outline], { BBox });
        const offStreamRef = context.register(offStream);

        const onDownStream = context.formXObject([...outlineDown, ...dot], {
          BBox,
        });
        const onDownStreamRef = context.register(onDownStream);

        const offDownStream = context.formXObject([...outlineDown], { BBox });
        const offDownStreamRef = context.register(offDownStream);

        const appearance = context.obj({});
        appearance.set(onValue, onStreamRef);
        appearance.set(PDFName.of('Off'), offStreamRef);

        const appearance1 = context.obj({});
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
