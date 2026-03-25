import PDFDict from '../objects/PDFDict';
import PDFName from '../objects/PDFName';
import PDFRef from '../objects/PDFRef';
import PDFString from '../objects/PDFString';
import PDFHexString from '../objects/PDFHexString';
import PDFContext from '../PDFContext';
import BorderStyle from './BorderStyle';
import PDFAnnotation from './PDFAnnotation';
import AppearanceCharacteristics from './AppearanceCharacteristics';
import { isPDFInstance, PDFClasses } from '../../api/objects';

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
    if (isPDFInstance(MK, PDFClasses.PDFDict)) return MK as PDFDict;
    return undefined;
  }

  BS(): PDFDict | undefined {
    const BS = this.dict.lookup(PDFName.of('BS'));
    if (isPDFInstance(BS, PDFClasses.PDFDict)) return BS as PDFDict;
    return undefined;
  }

  DA(): PDFString | PDFHexString | undefined {
    const da = this.dict.lookup(PDFName.of('DA'));
    if (
      isPDFInstance(da, PDFClasses.PDFString) ||
      isPDFInstance(da, PDFClasses.PDFHexString)
    )
      return da as PDFString | PDFHexString;
    return undefined;
  }

  P(): PDFRef | undefined {
    const P = this.dict.get(PDFName.of('P'));
    if (isPDFInstance(P, PDFClasses.PDFRef)) return P as PDFRef;
    return undefined;
  }

  setP(page: PDFRef) {
    this.dict.set(PDFName.of('P'), page);
  }

  setDefaultAppearance(appearance: string) {
    this.dict.set(PDFName.of('DA'), PDFString.of(appearance));
  }

  getDefaultAppearance(): string | undefined {
    const DA = this.DA();

    if (isPDFInstance(DA, PDFClasses.PDFHexString)) {
      return (DA as PDFHexString).decodeText();
    }

    return DA?.asString();
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

  getOrCreateBorderStyle(): BorderStyle {
    const BS = this.BS();
    if (BS) return BorderStyle.fromDict(BS);

    const bs = BorderStyle.fromDict(this.dict.context.obj({}));
    this.dict.set(PDFName.of('BS'), bs.dict);
    return bs;
  }

  getOnValue(): PDFName | undefined {
    const normal = this.getAppearances()?.normal;

    if (isPDFInstance(normal, PDFClasses.PDFDict)) {
      const keys = (normal as PDFDict).keys();
      for (let idx = 0, len = keys.length; idx < len; idx++) {
        const key = keys[idx];
        if (key !== PDFName.of('Off')) return key;
      }
    }

    return undefined;
  }
}

export default PDFWidgetAnnotation;
