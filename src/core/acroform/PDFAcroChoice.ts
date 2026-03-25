import PDFAcroTerminal from './PDFAcroTerminal';
import PDFHexString from '../objects/PDFHexString';
import PDFString from '../objects/PDFString';
import PDFArray from '../objects/PDFArray';
import PDFName from '../objects/PDFName';
import { AcroChoiceFlags } from './flags';
import { InvalidAcroFieldValueError, MultiSelectValueError } from '../errors';
import { isPDFInstance, PDFClasses } from '../../api/objects';

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

    if (
      isPDFInstance(v, PDFClasses.PDFString) ||
      isPDFInstance(v, PDFClasses.PDFHexString)
    )
      return [v as PDFString | PDFHexString];

    if (isPDFInstance(v, PDFClasses.PDFArray)) {
      const values: (PDFString | PDFHexString)[] = [];

      for (let idx = 0, len = (v as PDFArray).size(); idx < len; idx++) {
        const value = (v as PDFArray).lookup(idx);
        if (
          isPDFInstance(value, PDFClasses.PDFString) ||
          isPDFInstance(value, PDFClasses.PDFHexString)
        ) {
          values.push(value as PDFString | PDFHexString);
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
    if (
      isPDFInstance(Opt, PDFClasses.PDFString) ||
      isPDFInstance(Opt, PDFClasses.PDFHexString)
    ) {
      return [
        {
          value: Opt as PDFString | PDFHexString,
          display: Opt as PDFString | PDFHexString,
        },
      ];
    }

    if (isPDFInstance(Opt, PDFClasses.PDFArray)) {
      const res: {
        value: PDFString | PDFHexString;
        display: PDFString | PDFHexString;
      }[] = [];

      for (let idx = 0, len = (Opt as PDFArray).size(); idx < len; idx++) {
        const item = (Opt as PDFArray).lookup(idx);

        // If `item` is a string, use that as both the export and text value
        if (
          isPDFInstance(item, PDFClasses.PDFString) ||
          isPDFInstance(item, PDFClasses.PDFHexString)
        ) {
          res.push({
            value: item as PDFString | PDFHexString,
            display: item as PDFString | PDFHexString,
          });
        }

        // If `item` is an array of one, treat it the same as just a string,
        // if it's an array of two then `item[0]` is the export value and
        // `item[1]` is the text value
        if (isPDFInstance(item, PDFClasses.PDFArray)) {
          if ((item as PDFArray).size() > 0) {
            const first = (item as PDFArray).lookup(0, PDFString, PDFHexString);
            const second = (item as PDFArray).lookupMaybe(
              1,
              PDFString,
              PDFHexString,
            );
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
