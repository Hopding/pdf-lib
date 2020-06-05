import PDFDict from 'src/core/objects/PDFDict';
import PDFAcroChoice from 'src/core/acroform/PDFAcroChoice';
import PDFContext from 'src/core/PDFContext';

class PDFAcroListBox extends PDFAcroChoice {
  static fromDict = (dict: PDFDict) => new PDFAcroListBox(dict);

  static create = (context: PDFContext) => {
    const dict = context.obj({
      FT: 'Ch',
      Kids: [],
    });
    return new PDFAcroListBox(dict);
  };
}

export default PDFAcroListBox;
