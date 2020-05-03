import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFArray from 'src/core/objects/PDFArray';
import { PDFAcroField } from 'src/core/acroform';

class PDFAcroNonTerminal extends PDFAcroField {
  static fromDict = (dict: PDFDict) => new PDFAcroNonTerminal(dict);

  Kids(): PDFArray {
    return this.dict.lookup(PDFName.of('Kids'), PDFArray);
  }

  getKids(): PDFAcroField[] {
    const kidDicts = this.Kids();

    const kids = new Array(kidDicts.size());
    for (let idx = 0, len = kidDicts.size(); idx < len; idx++) {
      const dict = kidDicts.lookup(idx, PDFDict);
      kids[idx] = PDFAcroField.fromDict(dict);
    }

    return kids;
  }
}

export default PDFAcroNonTerminal;
