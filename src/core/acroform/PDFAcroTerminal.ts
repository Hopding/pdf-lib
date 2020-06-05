import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFAcroField from 'src/core/acroform/PDFAcroField';
// import {
//   PDFAcroField,
//   PDFAcroButton,
//   PDFAcroText,
//   PDFAcroChoice,
//   PDFAcroSignature,
// } from 'src/core/acroform';
import { PDFWidgetAnnotation } from 'src/core/annotation';
import PDFRef from '../objects/PDFRef';

class PDFAcroTerminal extends PDFAcroField {
  static fromDict = (dict: PDFDict) => new PDFAcroTerminal(dict);

  FT(): PDFName {
    const nameOrRef = this.getInheritableAttribute(PDFName.of('FT'));
    return this.dict.context.lookup(nameOrRef, PDFName);
  }

  getWidgets(): PDFWidgetAnnotation[] {
    const kidDicts = this.Kids();

    // This field is itself represents a widget
    if (!kidDicts) return [PDFWidgetAnnotation.fromDict(this.dict)];

    // This field's kids are its widgets
    const widgets = new Array(kidDicts.size());
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
}

export default PDFAcroTerminal;
