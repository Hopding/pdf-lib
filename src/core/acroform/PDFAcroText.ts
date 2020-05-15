import PDFDict from 'src/core/objects/PDFDict';
import { PDFAcroTerminal } from 'src/core/acroform';
import {
  PDFFont,
  grayscale,
  rgb,
  cmyk,
  drawRectangle,
  degrees,
  drawLinesOfText,
} from 'src/api';
import { breakTextIntoLines } from 'src/utils';
import PDFNumber from '../objects/PDFNumber';
import PDFString from '../objects/PDFString';
import PDFHexString from '../objects/PDFHexString';
import PDFName from '../objects/PDFName';

enum AcroTextFlags {
  Multiline = 13 - 1,
  Password = 14 - 1,
  FileSelect = 21 - 1,
  DoNotSpellCheck = 23 - 1,
  DoNotScroll = 24 - 1,
  Comb = 25 - 1,
  RichText = 26 - 1,
}

const MIN_FONT_SIZE = 4;
const MAX_FONT_SIZE = 500;

const computeFontSize = (
  font: PDFFont,
  text: string,
  bounds: { width: number; height: number },
) => {
  const wordBreaks = [' '];

  let fontSize = MIN_FONT_SIZE;
  let lines: string[] = [];
  while (fontSize < MAX_FONT_SIZE) {
    lines = breakTextIntoLines(text, wordBreaks, bounds.width, (t) =>
      font.widthOfTextAtSize(t, fontSize),
    );
    const tooLong = lines.some(
      (l) => font.widthOfTextAtSize(l, fontSize) > bounds.width,
    );
    if (tooLong) return { fontSize: fontSize - 1, lines };
    const lineHeight = font.heightAtSize(fontSize);
    const height = lines.length * lineHeight;
    if (height > bounds.height) return { fontSize: fontSize - 1, lines };
    fontSize += 1;
  }

  return { fontSize, lines };
};

class PDFAcroText extends PDFAcroTerminal {
  static fromDict = (dict: PDFDict) => new PDFAcroText(dict);

  isComb(): boolean {
    return this.hasFlag(AcroTextFlags.Comb);
  }

  setValue(value: string) {
    this.dict.set(PDFName.of('V'), PDFHexString.fromText(value));

    // const widgets = this.getWidgets();
    // for (let idx = 0, len = widgets.length; idx < len; idx++) {
    //   const widget = widgets[idx];
    //   const state = widget.getOnValue() === value ? value : PDFName.of('Off');
    //   widget.setAppearanceState(state);
    // }
  }

  getValue(): PDFString | PDFHexString | undefined {
    const v = this.V();
    if (v instanceof PDFString || v instanceof PDFHexString) return v;
    return undefined;
  }

  /*
  0. Replace newline chars with space if multiline flag is not set
  1. Noop if width or height is 0?
  2. Only update the normal appearance for now
  3. prepareNormalAppearanceStream, initializeAppearanceContent, setAppearanceContent
  4. Set the formxobject bbox
  5. Rotate the formxobject
  6. Set background color (per appearance characteristics)
  7. Set the border width and color (per appearance characteristics and border style)
  8. Wrap formxobject contents with:
      /Tx BMC
        q
          BT
            ${content}
          ET
        Q
      EMC
  9. Compute clipping and content rects with padding (max(1, borderWidth))
  10. Calculate the font size*
    - Could use regex to try and parse the /DA font size
  11. Insert the /DA (default appearance) string
    - Could be either at field level _or_ widget level
  12. Override the font and size of the /DA string with custom/calculated values
  13. Compute the y coord of the baseline*
  14. Render the text*
    - Could be singleline
    - Could be multiline
    - Could be comb-mode (table cells)
    - Account for /Q (quadding) alignment of text
  */
  updateAppearances(font: PDFFont) {
    const { context } = this.dict;

    const widgets = this.getWidgets();

    for (let idx = 0, len = widgets.length; idx < len; idx++) {
      const widget = widgets[idx];
      const { width, height } = widget.getRectangle();
      const characteristics = widget.getAppearanceCharacteristics();

      const BBox = context.obj([0, 0, width, height]);

      const color = characteristics?.getBackgroundColor();
      const borderColor = characteristics?.getBorderColor();

      // prettier-ignore
      const componentsToColor = (comps?: PDFNumber[], scale=1) => (
          comps?.length === 1 ? grayscale(comps[0].asNumber()*scale)
        : comps?.length === 3 ? rgb(comps[0].asNumber()*scale, comps[1].asNumber()*scale, comps[2].asNumber()*scale)
        : comps?.length === 4 ? cmyk(comps[0].asNumber()*scale, comps[1].asNumber()*scale, comps[2].asNumber()*scale, comps[3].asNumber()*scale)
        : undefined
      );

      const colorOperator = componentsToColor(color);
      const borderColorOperator = componentsToColor(borderColor);

      const upBackground =
        colorOperator || borderColorOperator
          ? drawRectangle({
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
            })
          : [];

      const value = this.getValue();
      const text = value?.decodeText() || '';
      const { fontSize, lines } = computeFontSize(font, text, {
        width,
        height,
      });
      const encodedLines = lines.map((x) => font.encodeText(x));

      const normalText = drawLinesOfText(encodedLines, {
        color: rgb(0, 0, 0),
        font: font.name,
        size: fontSize,
        rotate: degrees(0),
        xSkew: degrees(0),
        ySkew: degrees(0),
        x: 0,
        y: height - font.heightAtSize(fontSize),
        lineHeight: font.heightAtSize(fontSize), // TODO: check this
      });

      const normalStream = context.formXObject(
        [...upBackground, ...normalText],
        {
          BBox,
          Resources: { Font: { [font.name]: font.ref } },
        },
      );
      const normalStreamRef = context.register(normalStream);

      widget.setNormalAppearance(normalStreamRef);
      widget.removeRolloverAppearance();
      widget.removeDownAppearance();
    }
  }
}

export default PDFAcroText;
