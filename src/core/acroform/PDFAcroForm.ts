import PDFDict from 'src/core/objects/PDFDict';
import PDFArray from 'src/core/objects/PDFArray';
import PDFName from 'src/core/objects/PDFName';
import { PDFAcroField } from 'src/core/acroform';
import PDFAcroNonTerminal from './PDFAcroNonTerminal';

class PDFAcroForm {
  readonly dict: PDFDict;

  static fromDict = (dict: PDFDict) => new PDFAcroForm(dict);

  private constructor(dict: PDFDict) {
    this.dict = dict;
  }

  Fields(): PDFArray {
    return this.dict.lookup(PDFName.of('Fields'), PDFArray);
  }

  getFields(): PDFAcroField[] {
    const fieldDicts = this.Fields();

    const fields = new Array(fieldDicts.size());
    for (let idx = 0, len = fieldDicts.size(); idx < len; idx++) {
      const dict = fieldDicts.lookup(idx, PDFDict);
      fields[idx] = PDFAcroField.fromDict(dict);
    }

    return fields;
  }

  getAllFields(): PDFAcroField[] {
    const allFields: PDFAcroField[] = [];

    const pushFields = (fields?: PDFAcroField[]) => {
      if (!fields) return;
      for (let idx = 0, len = fields.length; idx < len; idx++) {
        const field = fields[idx];
        allFields.push(field);
        if (field instanceof PDFAcroNonTerminal) pushFields(field.getKids());
      }
    };

    pushFields(this.getFields());

    return allFields;
  }
}

export default PDFAcroForm;
