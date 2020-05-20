import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFContentStream from 'src/core/structures/PDFContentStream';
import PDFAcroButton from 'src/core/acroform/PDFAcroButton';
import {
  drawRectangle,
  stroke,
  rgb,
  degrees,
  lineTo,
  setStrokingColor,
  setLineWidth,
  moveTo,
  pushGraphicsState,
  popGraphicsState,
  translate,
} from 'src/api';

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

        const outline = drawRectangle({
          x: 0,
          y: 0,
          width,
          height,
          borderWidth: 2,
          color: rgb(1, 1, 1),
          borderColor: rgb(0, 0, 0),
          rotate: degrees(0),
          xSkew: degrees(0),
          ySkew: degrees(0),
        });

        // # Helpful to use a unit coordinate system: [-1, 1]^2
        // # 2 variables:
        // padding = 0.2
        // p2_x = -0.5
        // p1.x = -1 + padding
        // p2.x = p2_x
        // p2.y = -1 + padding
        // p3.y = 1 - padding
        // p3.x = 1 - padding
        // # Need 1 equation to solve for p1.y.
        // # For p2 to be a right angle, the dot product between (p1-p2) and (p3-p2) should be zero.
        // (p1.x-p2.x) * (p3.x-p2.x) + (p1.y-p2.y) * (p3.y-p2.y) = 0
        //
        // (p1.y-p2.y) * (p3.y-p2.y) = -((p1.x-p2.x) * (p3.x-p2.x))
        // (p1.y-p2.y) = -((p1.x-p2.x) * (p3.x-p2.x)) / (p3.y-p2.y)
        // p1.y = (-((p1.x-p2.x) * (p3.x-p2.x)) / (p3.y-p2.y)) + p2.y
        //
        // # Simplify:
        // (-1 + padding - p2_x) * (1 - padding - p2_x) + (p1.y + 1 - padding) * (1 - padding + 1 - padding) = 0
        // # Replace padding and solve for p1.y
        //
        // (p1.y + 1 - padding) * (1 - padding + 1 - padding) = -((-1 + padding - p2_x) * (1 - padding - p2_x))
        // (p1.y + 1 - padding) = -((-1 + padding - p2_x) * (1 - padding - p2_x)) / (1 - padding + 1 - padding)
        // p1.y = (-((-1 + padding - p2_x) * (1 - padding - p2_x)) / (1 - padding + 1 - padding)) - 1 + padding

        const p2x = -1 + 0.75;
        const p2y = -1 + 0.51;

        const p3y = 1 - 0.525;
        const p3x = 1 - 0.31;

        const p1x = -1 + 0.325;
        const p1y = -((p1x - p2x) * (p3x - p2x)) / (p3y - p2y) + p2y;

        const scale = Math.min(width, height) / 2;

        const check = [
          pushGraphicsState(),
          setStrokingColor(rgb(0, 0, 0)),
          setLineWidth(1.5),

          translate(width / 2, height / 2),
          moveTo(p1x * scale, p1y * scale),
          lineTo(p2x * scale, p2y * scale),
          lineTo(p3x * scale, p3y * scale),

          stroke(),
          popGraphicsState(),
        ];

        const outlineDown = drawRectangle({
          x: 0,
          y: 0,
          width,
          height,
          borderWidth: 2,
          color: rgb(0.8, 0.8, 0.8),
          borderColor: rgb(0, 0, 0),
          rotate: degrees(0),
          xSkew: degrees(0),
          ySkew: degrees(0),
        });

        const onStream = PDFContentStream.of(xObjectDict, [
          ...outline,
          ...check,
        ]);
        const onStreamRef = this.dict.context.register(onStream);

        const offStream = PDFContentStream.of(xObjectDict, [...outline]);
        const offStreamRef = this.dict.context.register(offStream);

        const onDownStream = PDFContentStream.of(xObjectDict, [
          ...outlineDown,
          ...check,
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

export default PDFAcroCheckBox;
