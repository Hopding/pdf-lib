import PDFObject from '../objects/PDFObject';
import PDFString from '../objects/PDFString';
import PDFHexString from '../objects/PDFHexString';
import PDFArray from '../objects/PDFArray';
import PDFName from '../objects/PDFName';
import PDFRef from '../objects/PDFRef';
import PDFAcroTerminal from './PDFAcroTerminal';
import { IndexOutOfBoundsError } from '../errors';
import { isPDFInstance, PDFClasses } from '../../api/objects';

class PDFAcroButton extends PDFAcroTerminal {
  Opt(): PDFString | PDFHexString | PDFArray | undefined {
    return this.dict.lookupMaybe(
      PDFName.of('Opt'),
      PDFString,
      PDFHexString,
      PDFArray,
    );
  }

  setOpt(opt: PDFObject[]) {
    this.dict.set(PDFName.of('Opt'), this.dict.context.obj(opt));
  }

  getExportValues(): (PDFString | PDFHexString)[] | undefined {
    const opt = this.Opt();

    if (!opt) return undefined;

    if (
      isPDFInstance(opt, PDFClasses.PDFString) ||
      isPDFInstance(opt, PDFClasses.PDFHexString)
    ) {
      return [opt as PDFString | PDFHexString];
    }

    const values: (PDFString | PDFHexString)[] = [];
    for (let idx = 0, len = (opt as PDFArray).size(); idx < len; idx++) {
      const value = (opt as PDFArray).lookup(idx);
      if (
        isPDFInstance(value, PDFClasses.PDFString) ||
        isPDFInstance(value, PDFClasses.PDFHexString)
      ) {
        values.push(value as PDFString | PDFHexString);
      }
    }

    return values;
  }

  removeExportValue(idx: number) {
    const opt = this.Opt();

    if (!opt) return;

    if (
      isPDFInstance(opt, PDFClasses.PDFString) ||
      isPDFInstance(opt, PDFClasses.PDFHexString)
    ) {
      if (idx !== 0) throw new IndexOutOfBoundsError(idx, 0, 0);
      this.setOpt([]);
    } else {
      if (idx < 0 || idx > (opt as PDFArray).size()) {
        throw new IndexOutOfBoundsError(idx, 0, (opt as PDFArray).size());
      }
      (opt as PDFArray).remove(idx);
    }
  }

  // Enforce use use of /Opt even if it isn't strictly necessary
  normalizeExportValues() {
    const exportValues = this.getExportValues() ?? [];

    const Opt: (PDFString | PDFHexString)[] = [];

    const widgets = this.getWidgets();
    for (let idx = 0, len = widgets.length; idx < len; idx++) {
      const widget = widgets[idx];
      const exportVal =
        exportValues[idx] ??
        PDFHexString.fromText(widget.getOnValue()?.decodeText() ?? '');
      Opt.push(exportVal);
    }

    this.setOpt(Opt);
  }

  /**
   * Reuses existing opt if one exists with the same value (assuming
   * `useExistingIdx` is `true`). Returns index of existing (or new) opt.
   */
  addOpt(opt: PDFHexString | PDFString, useExistingOptIdx: boolean): number {
    this.normalizeExportValues();

    const optText = opt.decodeText();

    let existingIdx: number | undefined;
    if (useExistingOptIdx) {
      const exportValues = this.getExportValues() ?? [];
      for (let idx = 0, len = exportValues.length; idx < len; idx++) {
        const exportVal = exportValues[idx];
        if (exportVal.decodeText() === optText) existingIdx = idx;
      }
    }

    const Opt = this.Opt() as PDFArray;
    Opt.push(opt);

    return existingIdx ?? Opt.size() - 1;
  }

  addWidgetWithOpt(
    widget: PDFRef,
    opt: PDFHexString | PDFString,
    useExistingOptIdx: boolean,
  ) {
    const optIdx = this.addOpt(opt, useExistingOptIdx);
    const apStateValue = PDFName.of(String(optIdx));
    this.addWidget(widget);
    return apStateValue;
  }
}

export default PDFAcroButton;
