import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import {
  PDFAcroField,
  PDFAcroButton,
  PDFAcroText,
  PDFAcroChoice,
  PDFAcroSignature,
} from 'src/core/acroform';

class PDFAcroTerminal extends PDFAcroField {
  static fromDict = (dict: PDFDict): PDFAcroTerminal => {
    const field = new PDFAcroTerminal(dict);
    const fieldType = field.FT();

    if (fieldType === PDFName.of('Btn')) return PDFAcroButton.fromDict(dict);
    if (fieldType === PDFName.of('Tx')) return PDFAcroText.fromDict(dict);
    if (fieldType === PDFName.of('Ch')) return PDFAcroChoice.fromDict(dict);
    if (fieldType === PDFName.of('Sig')) return PDFAcroSignature.fromDict(dict);

    return field;
  };

  FT(): PDFName {
    const nameOrRef = this.getInheritableAttribute(PDFName.of('FT'));
    return this.dict.context.lookup(nameOrRef, PDFName);
  }
}

export default PDFAcroTerminal;
