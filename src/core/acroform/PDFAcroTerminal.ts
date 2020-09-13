import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFRef from 'src/core/objects/PDFRef';
import PDFAcroField from 'src/core/acroform/PDFAcroField';
import PDFWidgetAnnotation from 'src/core/annotation/PDFWidgetAnnotation';
import { IndexOutOfBoundsError } from 'src/core/errors';

class PDFAcroTerminal extends PDFAcroField {
  static fromDict = (dict: PDFDict, ref: PDFRef) =>
    new PDFAcroTerminal(dict, ref);

  FT(): PDFName {
    const nameOrRef = this.getInheritableAttribute(PDFName.of('FT'));
    return this.dict.context.lookup(nameOrRef, PDFName);
  }

  getWidgets(): PDFWidgetAnnotation[] {
    const kidDicts = this.Kids();

    // This field is itself a widget
    if (!kidDicts) return [PDFWidgetAnnotation.fromDict(this.dict)];

    // This field's kids are its widgets
    const widgets = new Array<PDFWidgetAnnotation>(kidDicts.size());
    for (let idx = 0, len = kidDicts.size(); idx < len; idx++) {
      const dict = kidDicts.lookup(idx, PDFDict);
      widgets[idx] = PDFWidgetAnnotation.fromDict(dict);
    }

    return widgets;
  }

  addWidget(ref: PDFRef) {
    const { Kids } = this.normalizedEntries();
    Kids.push(ref);
  }

  removeWidget(idx: number) {
    const kidDicts = this.Kids();

    if (!kidDicts) {
      // This field is itself a widget
      if (idx !== 0) throw new IndexOutOfBoundsError(idx, 0, 0);
      this.setKids([]);
    } else {
      // This field's kids are its widgets
      if (idx < 0 || idx > kidDicts.size()) {
        throw new IndexOutOfBoundsError(idx, 0, kidDicts.size());
      }
      kidDicts.remove(idx);
    }
  }

  normalizedEntries() {
    let Kids = this.Kids();

    // If this field is itself a widget (because it was only rendered once in
    // the document, so the field and widget properties were merged) then we
    // add itself to the `Kids` array. The alternative would be to try
    // splitting apart the widget properties and creating a separate object
    // for them.
    if (!Kids) {
      Kids = this.dict.context.obj([this.ref]);
      this.dict.set(PDFName.of('Kids'), Kids);
    }

    return { Kids };
  }
}

export default PDFAcroTerminal;
