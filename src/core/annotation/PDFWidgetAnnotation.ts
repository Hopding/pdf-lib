import PDFDict from 'src/core/objects/PDFDict';
import PDFAnnotation from 'src/core/annotation/PDFAnnotation';
import PDFName from 'src/core/objects/PDFName';

class PDFWidgetAnnotation extends PDFAnnotation {
  static fromDict = (dict: PDFDict): PDFWidgetAnnotation =>
    new PDFWidgetAnnotation(dict);

  getOnValue(): PDFName | undefined {
    const normal = this.getAppearances()?.normal;

    if (normal instanceof PDFDict) {
      const keys = normal.keys();
      for (let idx = 0, len = keys.length; idx < len; idx++) {
        const key = keys[idx];
        if (key !== PDFName.of('Off')) return key;
      }
    }

    return undefined;
  }
}

export default PDFWidgetAnnotation;
