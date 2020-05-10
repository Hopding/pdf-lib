import PDFDict from 'src/core/objects/PDFDict';
import { PDFAcroButton } from 'src/core/acroform';
import {
  drawRectangle,
  rgb,
  degrees,
  grayscale,
  cmyk,
  PDFFont,
  drawText,
} from 'src/api';
import PDFNumber from '../objects/PDFNumber';
// import PDFOperator from 'src/core/operators/PDFOperator';
// import Ops from 'src/core/operators/PDFOperatorNames';

class PDFAcroPushButton extends PDFAcroButton {
  static fromDict = (dict: PDFDict) => new PDFAcroPushButton(dict);

  updateAppearances(font: PDFFont) {
    const { context } = this.dict;

    const widgets = this.getWidgets();

    for (let idx = 0, len = widgets.length; idx < len; idx++) {
      const widget = widgets[idx];
      const { width, height } = widget.getRectangle();
      const characteristics = widget.getAppearanceCharacteristics();

      const BBox = context.obj([0, 0, width, height]);

      const captions = characteristics?.getCaptions();
      const color = characteristics?.getBackgroundColor();
      const borderColor = characteristics?.getBorderColor();

      // const color = [PDFNumber.of(1), PDFNumber.of(1), PDFNumber.of(0)];
      // const borderColor = [PDFNumber.of(1), PDFNumber.of(0), PDFNumber.of(0)];

      // prettier-ignore
      const componentsToColor = (comps?: PDFNumber[], scale=1) => (
          comps?.length === 1 ? grayscale(comps[0].asNumber()*scale)
        : comps?.length === 3 ? rgb(comps[0].asNumber()*scale, comps[1].asNumber()*scale, comps[2].asNumber()*scale)
        : comps?.length === 4 ? cmyk(comps[0].asNumber()*scale, comps[1].asNumber()*scale, comps[2].asNumber()*scale, comps[3].asNumber()*scale)
        : undefined
      );

      const colorOperator = componentsToColor(color) || grayscale(0.25);
      const downColorOperator =
        componentsToColor(color, 0.5) || grayscale(0.25 * 0.5);
      const borderColorOperator = componentsToColor(borderColor);

      const upBackground = drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        borderWidth: borderColorOperator ? 2 : 0,
        color: colorOperator,
        borderColor: borderColorOperator,
        rotate: degrees(0),
        xSkew: degrees(0),
        ySkew: degrees(0),
      });

      const downBackground = drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        borderWidth: borderColorOperator ? 2 : 0,
        color: downColorOperator,
        borderColor: borderColorOperator,
        rotate: degrees(0),
        xSkew: degrees(0),
        ySkew: degrees(0),
      });

      const fontSize = 20;

      const normalCaption = captions?.normal || '';
      const normalCaptionWidth = font.widthOfTextAtSize(
        normalCaption,
        fontSize,
      );
      const normalCaptionHeight = font.heightAtSize(fontSize);
      const normalText = drawText(font.encodeText(normalCaption), {
        color: rgb(0, 0, 0),
        font: font.name,
        size: fontSize,
        rotate: degrees(0),
        xSkew: degrees(0),
        ySkew: degrees(0),
        x: width / 2 - normalCaptionWidth / 2,
        y: height / 2 - normalCaptionHeight / 2,
      });

      const rolloverCaption = captions?.rollover || captions?.normal || '';
      const rolloverCaptionWidth = font.widthOfTextAtSize(
        rolloverCaption,
        fontSize,
      );
      const rolloverCaptionHeight = font.heightAtSize(fontSize);
      const rolloverText = drawText(font.encodeText(rolloverCaption), {
        color: rgb(0, 0, 0),
        font: font.name,
        size: fontSize,
        rotate: degrees(0),
        xSkew: degrees(0),
        ySkew: degrees(0),
        x: width / 2 - rolloverCaptionWidth / 2,
        y: height / 2 - rolloverCaptionHeight / 2,
      });

      const downCaption = captions?.down || captions?.normal || '';
      const downCaptionWidth = font.widthOfTextAtSize(downCaption, fontSize);
      const downCaptionHeight = font.heightAtSize(fontSize);
      const downText = drawText(font.encodeText(downCaption), {
        color: rgb(0, 0, 0),
        font: font.name,
        size: fontSize,
        rotate: degrees(0),
        xSkew: degrees(0),
        ySkew: degrees(0),
        x: width / 2 - downCaptionWidth / 2,
        y: height / 2 - downCaptionHeight / 2,
      });

      const normalStream = context.formXObject(
        [...upBackground, ...normalText],
        {
          BBox,
          Resources: { Font: { [font.name]: font.ref } },
        },
      );
      const normalStreamRef = context.register(normalStream);

      const rolloverStream = context.formXObject(
        [...upBackground, ...rolloverText],
        {
          BBox,
          Resources: { Font: { [font.name]: font.ref } },
        },
      );
      const rolloverStreamRef = context.register(rolloverStream);

      const downStream = context.formXObject([...downBackground, ...downText], {
        BBox,
        Resources: { Font: { [font.name]: font.ref } },
      });
      const downStreamRef = context.register(downStream);

      widget.setNormalAppearance(normalStreamRef);
      widget.setRolloverAppearance(rolloverStreamRef);
      widget.setDownAppearance(downStreamRef);
    }
  }
}

export default PDFAcroPushButton;
