import PDFDict from 'src/core/objects/PDFDict';
import PDFRef from 'src/core/objects/PDFRef';
import PDFContext from 'src/core/PDFContext';
import PDFAcroField from 'src/core/acroform/PDFAcroField';

class PDFAcroNonTerminal extends PDFAcroField {
  static fromDict = (dict: PDFDict) => new PDFAcroNonTerminal(dict);

  static create = (context: PDFContext) => {
    const dict = context.obj({});
    return new PDFAcroNonTerminal(dict);
  };

  addField(field: PDFRef) {
    const { Kids } = this.normalizedEntries();
    Kids?.push(field);
  }
}

export default PDFAcroNonTerminal;
