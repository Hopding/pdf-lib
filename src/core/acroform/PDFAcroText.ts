import PDFContext from 'src/core/PDFContext';
import PDFDict from 'src/core/objects/PDFDict';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFString from 'src/core/objects/PDFString';
import PDFHexString from 'src/core/objects/PDFHexString';
import PDFName from 'src/core/objects/PDFName';
import PDFRef from 'src/core/objects/PDFRef';
import PDFAcroTerminal from 'src/core/acroform/PDFAcroTerminal';

class PDFAcroText extends PDFAcroTerminal {
  static fromDict = (dict: PDFDict, ref: PDFRef) => new PDFAcroText(dict, ref);

  static create = (context: PDFContext) => {
    const dict = context.obj({
      FT: 'Tx',
      Kids: [],
    });
    const ref = context.register(dict);
    return new PDFAcroText(dict, ref);
  };

  MaxLen(): PDFNumber | undefined {
    const maxLen = this.dict.lookup(PDFName.of('MaxLen'));
    if (maxLen instanceof PDFNumber) return maxLen;
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

  setQuadding(quadding: 0 | 1 | 2) {
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
  // updateAppearances(font: PDFFont) {}
}

export default PDFAcroText;
