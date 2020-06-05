import PDFDict from 'src/core/objects/PDFDict';
import PDFAnnotation from 'src/core/annotation/PDFAnnotation';
import PDFName from 'src/core/objects/PDFName';
import PDFRef from 'src/core/objects/PDFRef';
import PDFContext from 'src/core/PDFContext';
import AppearanceCharacteristics from 'src/core/annotation/AppearanceCharacteristics';
import BorderStyle from 'src/core/annotation/BorderStyle';

class PDFWidgetAnnotation extends PDFAnnotation {
  static fromDict = (dict: PDFDict): PDFWidgetAnnotation =>
    new PDFWidgetAnnotation(dict);

  static create = (context: PDFContext, parent: PDFRef) => {
    const dict = context.obj({
      Type: 'Annot',
      Subtype: 'Widget',
      Rect: [0, 0, 0, 0],
      Parent: parent,
    });
    return new PDFWidgetAnnotation(dict);
  };

  MK(): PDFDict | undefined {
    const MK = this.dict.lookup(PDFName.of('MK'));
    if (MK instanceof PDFDict) return MK;
    return undefined;
  }

  BS(): PDFDict | undefined {
    const BS = this.dict.lookup(PDFName.of('BS'));
    if (BS instanceof PDFDict) return BS;
    return undefined;
  }

  getAppearanceCharacteristics(): AppearanceCharacteristics | undefined {
    const MK = this.MK();
    if (MK) return AppearanceCharacteristics.fromDict(MK);
    return undefined;
  }

  getOrCreateAppearanceCharacteristics(): AppearanceCharacteristics {
    const MK = this.MK();
    if (MK) return AppearanceCharacteristics.fromDict(MK);

    const ac = AppearanceCharacteristics.fromDict(this.dict.context.obj({}));
    this.dict.set(PDFName.of('MK'), ac.dict);
    return ac;
  }

  getBorderStyle(): BorderStyle | undefined {
    const BS = this.BS();
    if (BS) return BorderStyle.fromDict(BS);
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
