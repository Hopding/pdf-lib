import PDFDict from 'src/core/objects/PDFDict';
import PDFAnnotation from 'src/core/annotation/PDFAnnotation';
import PDFName from 'src/core/objects/PDFName';
import AppearanceCharacteristics from 'src/core/annotation/AppearanceCharacteristics';

class PDFWidgetAnnotation extends PDFAnnotation {
  static fromDict = (dict: PDFDict): PDFWidgetAnnotation =>
    new PDFWidgetAnnotation(dict);

  MK(): PDFDict | undefined {
    const MK = this.dict.lookup(PDFName.of('MK'));
    if (MK instanceof PDFDict) return MK;
    return undefined;
  }

  getAppearanceCharacteristics(): AppearanceCharacteristics | undefined {
    const MK = this.MK();
    if (MK) return AppearanceCharacteristics.fromDict(MK);
    return undefined;
  }

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
