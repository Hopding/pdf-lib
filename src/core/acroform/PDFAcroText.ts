import PDFDict from 'src/core/objects/PDFDict';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFString from 'src/core/objects/PDFString';
import PDFHexString from 'src/core/objects/PDFHexString';
import PDFName from 'src/core/objects/PDFName';
import PDFAcroTerminal from 'src/core/acroform/PDFAcroTerminal';
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
import PDFContext from 'src/core/PDFContext';

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

  static create = (context: PDFContext) => {
    const dict = context.obj({
      FT: 'Tx',
      Kids: [],
    });
    return new PDFAcroText(dict);
  };

  MaxLen(): PDFNumber | undefined {
    const maxLen = this.dict.lookup(PDFName.of('MaxLen'));
    if (maxLen instanceof PDFNumber) return maxLen;
    return undefined;
  }

  DA(): PDFString | PDFHexString | undefined {
    const da = this.dict.lookup(PDFName.of('DA'));
    if (da instanceof PDFString || da instanceof PDFHexString) return da;
    return undefined;
  }

  Q(): PDFNumber | undefined {
    const q = this.dict.lookup(PDFName.of('Q'));
    if (q instanceof PDFNumber) return q;
    return undefined;
  }

  setMaxLength(maxLength: number) {
    this.dict.set(PDFName.of('MaxLen'), PDFNumber.of(maxLength));
  }

  getMaxLength(): number | undefined {
    return this.MaxLen()?.asNumber();
  }

  getDefaultAppearance(): string | undefined {
    return this.DA()?.decodeText() ?? '';
  }

  setQuadding(quadding: number) {
    this.dict.set(PDFName.of('Q'), PDFNumber.of(quadding));
  }

  getQuadding(): number | undefined {
    return this.Q()?.asNumber();
  }

  setValue(value: PDFHexString | PDFString) {
    this.dict.set(PDFName.of('V'), value);

    // const widgets = this.getWidgets();
    // for (let idx = 0, len = widgets.length; idx < len; idx++) {
    //   const widget = widgets[idx];
    //   const state = widget.getOnValue() === value ? value : PDFName.of('Off');
    //   widget.setAppearanceState(state);
    // }
  }

  removeValue() {
    this.dict.delete(PDFName.of('V'));
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
      const componentsToColor = (comps?: number[], scale = 1) => (
          comps?.length === 1 ? grayscale(
            comps[0] * scale,
          )
        : comps?.length === 3 ? rgb(
            comps[0] * scale, 
            comps[1] * scale, 
            comps[2] * scale,
          )
        : comps?.length === 4 ? cmyk(
            comps[0] * scale, 
            comps[1] * scale, 
            comps[2] * scale, 
            comps[3] * scale,
          )
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
