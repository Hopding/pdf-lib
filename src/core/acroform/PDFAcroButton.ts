// import PDFDict from 'src/core/objects/PDFDict';
import PDFString from 'src/core/objects/PDFString';
import PDFHexString from 'src/core/objects/PDFHexString';
import PDFArray from 'src/core/objects/PDFArray';
import PDFName from 'src/core/objects/PDFName';

import PDFAcroTerminal from 'src/core/acroform/PDFAcroTerminal';

class PDFAcroButton extends PDFAcroTerminal {
  // static fromDict = (dict: PDFDict) => new PDFAcroButton(dict);

  Opt(): PDFString | PDFHexString | PDFArray | undefined {
    return this.dict.lookupMaybe(
      PDFName.of('Opt'),
      PDFString,
      PDFHexString,
      PDFArray,
    );
  }

  getExportValues(): (PDFString | PDFHexString)[] | undefined {
    const opt = this.Opt();

    if (!opt) return undefined;

    if (opt instanceof PDFString || opt instanceof PDFHexString) {
      return [opt];
    }

    const values: (PDFString | PDFHexString)[] = [];
    for (let idx = 0, len = opt.size(); idx < len; idx++) {
      const value = opt.lookup(idx);
      if (value instanceof PDFString || value instanceof PDFHexString) {
        values.push(value);
      }
    }

    return values;
  }
}

export default PDFAcroButton;
