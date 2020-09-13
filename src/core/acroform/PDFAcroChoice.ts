import PDFAcroTerminal from 'src/core/acroform/PDFAcroTerminal';
import PDFHexString from 'src/core/objects/PDFHexString';
import PDFString from 'src/core/objects/PDFString';
import PDFArray from 'src/core/objects/PDFArray';
import PDFName from 'src/core/objects/PDFName';
import { AcroChoiceFlags } from 'src/core/acroform/flags';
import {
  InvalidAcroFieldValueError,
  MultiSelectValueError,
} from 'src/core/errors';

class PDFAcroChoice extends PDFAcroTerminal {
  setValues(values: (PDFString | PDFHexString)[]) {
    if (
      this.hasFlag(AcroChoiceFlags.Combo) &&
      !this.hasFlag(AcroChoiceFlags.Edit) &&
      !this.valuesAreValid(values)
    ) {
      throw new InvalidAcroFieldValueError();
    }

    if (values.length === 0) {
      this.dict.delete(PDFName.of('V'));
    }
    if (values.length === 1) {
      this.dict.set(PDFName.of('V'), values[0]);
    }
    if (values.length > 1) {
      if (!this.hasFlag(AcroChoiceFlags.MultiSelect)) {
        throw new MultiSelectValueError();
      }
      this.dict.set(PDFName.of('V'), this.dict.context.obj(values));
    }

    this.updateSelectedIndices(values);
  }

  valuesAreValid(values: (PDFString | PDFHexString)[]): boolean {
    const options = this.getOptions();
    for (let idx = 0, len = values.length; idx < len; idx++) {
      const val = values[idx].decodeText();
      if (!options.find((o) => val === (o.display || o.value).decodeText())) {
        return false;
      }
    }
    return true;
  }

  updateSelectedIndices(values: (PDFString | PDFHexString)[]) {
    if (values.length > 1) {
      const indices = new Array<number>(values.length);
      const options = this.getOptions();
      for (let idx = 0, len = values.length; idx < len; idx++) {
        const val = values[idx].decodeText();
        indices[idx] = options.findIndex(
          (o) => val === (o.display || o.value).decodeText(),
        );
      }
      this.dict.set(PDFName.of('I'), this.dict.context.obj(indices.sort()));
    } else {
      this.dict.delete(PDFName.of('I'));
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

  Opt(): PDFArray | PDFString | PDFHexString | undefined {
    return this.dict.lookupMaybe(
      PDFName.of('Opt'),
      PDFString,
      PDFHexString,
      PDFArray,
    );
  }

  setOptions(
    options: {
      value: PDFString | PDFHexString;
      display?: PDFString | PDFHexString;
    }[],
  ) {
    const newOpt = new Array<PDFArray>(options.length);
    for (let idx = 0, len = options.length; idx < len; idx++) {
      const { value, display } = options[idx];
      newOpt[idx] = this.dict.context.obj([value, display || value]);
    }
    this.dict.set(PDFName.of('Opt'), this.dict.context.obj(newOpt));
  }

  getOptions(): {
    value: PDFString | PDFHexString;
    display: PDFString | PDFHexString;
  }[] {
    const Opt = this.Opt();

    // Not supposed to happen - Opt _should_ always be `PDFArray | undefined`
    if (Opt instanceof PDFString || Opt instanceof PDFHexString) {
      return [{ value: Opt, display: Opt }];
    }

    if (Opt instanceof PDFArray) {
      const res: {
        value: PDFString | PDFHexString;
        display: PDFString | PDFHexString;
      }[] = [];

      for (let idx = 0, len = Opt.size(); idx < len; idx++) {
        const item = Opt.lookup(idx);

        // If `item` is a string, use that as both the export and text value
        if (item instanceof PDFString || item instanceof PDFHexString) {
          res.push({ value: item, display: item });
        }

        // If `item` is an array of one, treat it the same as just a string,
        // if it's an array of two then `item[0]` is the export value and
        // `item[1]` is the text value
        if (item instanceof PDFArray) {
          if (item.size() > 0) {
            const first = item.lookup(0, PDFString, PDFHexString);
            const second = item.lookupMaybe(1, PDFString, PDFHexString);
            res.push({ value: first, display: second || first });
          }
        }
      }

      return res;
    }

    return [];
  }
}

export default PDFAcroChoice;
