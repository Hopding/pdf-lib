import PDFDict from 'src/core/objects/PDFDict';
import PDFRef from 'src/core/objects/PDFRef';
import PDFContext from 'src/core/PDFContext';
import PDFAcroField from 'src/core/acroform/PDFAcroField';

class PDFAcroNonTerminal extends PDFAcroField {
  static fromDict = (dict: PDFDict, ref: PDFRef) =>
    new PDFAcroNonTerminal(dict, ref);

  static create = (context: PDFContext) => {
    const dict = context.obj({});
    const ref = context.register(dict);
    return new PDFAcroNonTerminal(dict, ref);
  };

  addField(field: PDFRef) {
    const { Kids } = this.normalizedEntries();
    Kids?.push(field);
  }
}

export default PDFAcroNonTerminal;
