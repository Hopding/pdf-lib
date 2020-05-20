// import PDFDict from 'src/core/objects/PDFDict';
import PDFString from 'src/core/objects/PDFString';
import PDFHexString from 'src/core/objects/PDFHexString';
import PDFArray from 'src/core/objects/PDFArray';
import PDFName from 'src/core/objects/PDFName';

import PDFAcroTerminal from 'src/core/acroform/PDFAcroTerminal';

// TODO: Handle setting stuff with Opts instead of Values

// export enum AcroButtonFlags {
//   NoToggleToOff = 15 - 1,
//   Radio = 16 - 1,
//   PushButton = 17 - 1,
//   RadiosInUnison = 26 - 1,
// }

// TODO: Create factory function to avoid intermediate objects and circular
//       dependencies if possible
class PDFAcroButton extends PDFAcroTerminal {
  // static fromDict = (dict: PDFDict) => new PDFAcroButton(dict);

  // isPushButton(): boolean {
  //   return this.hasFlag(AcroButtonFlags.PushButton);
  // }

  // isRadioButton(): boolean {
  //   return this.hasFlag(AcroButtonFlags.Radio);
  // }

  // isCheckBoxButton(): boolean {
  //   return !this.isPushButton() && !this.isRadioButton();
  // }

  Opt(): PDFString | PDFHexString | PDFArray | undefined {
    return this.dict.lookupMaybe(
      PDFName.of('Opt'),
      PDFString,
      PDFHexString,
      PDFArray,
    );
  }

  getExportValues(): string[] | undefined {
    const opt = this.Opt();

    if (!opt) return undefined;

    if (opt instanceof PDFString || opt instanceof PDFHexString) {
      return [opt.decodeText()];
    }

    const values: string[] = [];
    for (let idx = 0, len = opt.size(); idx < len; idx++) {
      const value = opt.lookup(idx);
      if (value instanceof PDFString || value instanceof PDFHexString) {
        values.push(value.decodeText());
      }
    }

    return values;
  }
}

export default PDFAcroButton;
