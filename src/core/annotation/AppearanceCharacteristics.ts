import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFArray from 'src/core/objects/PDFArray';
import PDFHexString from 'src/core/objects/PDFHexString';
import PDFString from 'src/core/objects/PDFString';

class AppearanceCharacteristics {
  readonly dict: PDFDict;

  static fromDict = (dict: PDFDict): AppearanceCharacteristics =>
    new AppearanceCharacteristics(dict);

  protected constructor(dict: PDFDict) {
    this.dict = dict;
  }

  R(): PDFNumber | undefined {
    const R = this.dict.lookup(PDFName.of('R'));
    if (R instanceof PDFNumber) return R;
    return undefined;
  }

  BC(): PDFArray | undefined {
    const BC = this.dict.lookup(PDFName.of('BC'));
    if (BC instanceof PDFArray) return BC;
    return undefined;
  }

  BG(): PDFArray | undefined {
    const BG = this.dict.lookup(PDFName.of('BG'));
    if (BG instanceof PDFArray) return BG;
    return undefined;
  }

  CA(): PDFHexString | PDFString | undefined {
    const CA = this.dict.lookup(PDFName.of('CA'));
    if (CA instanceof PDFHexString || CA instanceof PDFString) return CA;
    return undefined;
  }

  RC(): PDFHexString | PDFString | undefined {
    const RC = this.dict.lookup(PDFName.of('RC'));
    if (RC instanceof PDFHexString || RC instanceof PDFString) return RC;
    return undefined;
  }

  AC(): PDFHexString | PDFString | undefined {
    const AC = this.dict.lookup(PDFName.of('AC'));
    if (AC instanceof PDFHexString || AC instanceof PDFString) return AC;
    return undefined;
  }

  getRotation(): number | undefined {
    return this.R()?.asNumber();
  }

  getBorderColor(): number[] | undefined {
    const BC = this.BC();

    if (!BC) return undefined;

    const components: number[] = [];
    for (let idx = 0, len = BC?.size(); idx < len; idx++) {
      const component = BC.get(idx);
      if (component instanceof PDFNumber) components.push(component.asNumber());
    }

    return components;
  }

  getBackgroundColor(): number[] | undefined {
    const BG = this.BG();

    if (!BG) return undefined;

    const components: number[] = [];
    for (let idx = 0, len = BG?.size(); idx < len; idx++) {
      const component = BG.get(idx);
      if (component instanceof PDFNumber) components.push(component.asNumber());
    }

    return components;
  }

  getCaptions(): { normal?: string; rollover?: string; down?: string } {
    const CA = this.CA();
    const RC = this.RC();
    const AC = this.AC();

    return {
      normal: CA?.decodeText(),
      rollover: RC?.decodeText(),
      down: AC?.decodeText(),
    };
  }

  setRotation(rotation: number) {
    const R = this.dict.context.obj(rotation);
    this.dict.set(PDFName.of('R'), R);
  }

  setBorderColor(color: number[]) {
    const BC = this.dict.context.obj(color);
    this.dict.set(PDFName.of('BC'), BC);
  }

  setBackgroundColor(color: number[]) {
    const BG = this.dict.context.obj(color);
    this.dict.set(PDFName.of('BG'), BG);
  }

  setCaptions(captions: { normal: string; rollover?: string; down?: string }) {
    const CA = PDFHexString.fromText(captions.normal);
    this.dict.set(PDFName.of('CA'), CA);

    if (captions.rollover) {
      const RC = PDFHexString.fromText(captions.rollover);
      this.dict.set(PDFName.of('RC'), RC);
    } else {
      this.dict.delete(PDFName.of('RC'));
    }

    if (captions.down) {
      const AC = PDFHexString.fromText(captions.down);
      this.dict.set(PDFName.of('AC'), AC);
    } else {
      this.dict.delete(PDFName.of('AC'));
    }
  }
}

export default AppearanceCharacteristics;
