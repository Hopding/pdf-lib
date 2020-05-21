// import PDFDict from 'src/core/objects/PDFDict';
import PDFAcroTerminal from 'src/core/acroform/PDFAcroTerminal';
import PDFHexString from 'src/core/objects/PDFHexString';
import PDFString from 'src/core/objects/PDFString';
import PDFArray from 'src/core/objects/PDFArray';
import PDFName from 'src/core/objects/PDFName';

enum AcroChoiceFlags {
  MultiSelect = 20 - 1,
}

class PDFAcroChoice extends PDFAcroTerminal {
  // static fromDict = (dict: PDFDict) => new PDFAcroChoice(dict);

  setValue(value: PDFString | PDFHexString) {
    this.dict.set(PDFName.of('V'), value);
  }

  setValues(values: (PDFString | PDFHexString)[]) {
    // TODO: Assert all are valid options
    if (values.length === 0) {
      this.dict.delete(PDFName.of('V'));
      this.dict.delete(PDFName.of('I'));
    }
    if (values.length === 1) {
      this.dict.set(PDFName.of('V'), values[0]);
      this.dict.delete(PDFName.of('I'));
    }
    if (values.length > 1) {
      if (!this.isMultiSelect()) throw new Error('TODO: FIX ME!');
      this.dict.set(PDFName.of('V'), this.dict.context.obj(values));
      // TODO: Update /I entry
    }
  }

  getValues(): (PDFString | PDFHexString)[] {
    const v = this.V();

    if (v instanceof PDFString || v instanceof PDFHexString) return [v];

    if (v instanceof PDFArray) {
      const values: (PDFString | PDFHexString)[] = [];

      for (let idx = 0, len = v.size(); idx < len; idx++) {
        const value = v.lookup(idx);
        if (value instanceof PDFString || value instanceof PDFHexString) {
          values.push(value);
        }
      }

      return values;
    }

    return [];
  }

  isMultiSelect(): boolean {
    return this.hasFlag(AcroChoiceFlags.MultiSelect);
  }
}

export default PDFAcroChoice;
