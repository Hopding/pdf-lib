import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFStream from 'src/core/objects/PDFStream';
import PDFArray from 'src/core/objects/PDFArray';
import PDFRef from 'src/core/objects/PDFRef';
import PDFNumber from 'src/core/objects/PDFNumber';

class PDFAnnotation {
  readonly dict: PDFDict;

  static fromDict = (dict: PDFDict): PDFAnnotation => new PDFAnnotation(dict);

  protected constructor(dict: PDFDict) {
    this.dict = dict;
  }

  // This is technically required by the PDF spec
  Rect(): PDFArray | undefined {
    return this.dict.lookup(PDFName.of('Rect'), PDFArray);
  }

  AP(): PDFDict | undefined {
    return this.dict.lookupMaybe(PDFName.of('AP'), PDFDict);
  }

  F(): PDFNumber | undefined {
    const numberOrRef = this.dict.lookup(PDFName.of('F'));
    return this.dict.context.lookupMaybe(numberOrRef, PDFNumber);
  }

  getRectangle(): { x: number; y: number; width: number; height: number } {
    const Rect = this.Rect();
    return Rect?.asRectangle() ?? { x: 0, y: 0, width: 0, height: 0 };
  }

  setRectangle(rect: { x: number; y: number; width: number; height: number }) {
    const { x, y, width, height } = rect;
    const Rect = this.dict.context.obj([x, y, x + width, y + height]);
    this.dict.set(PDFName.of('Rect'), Rect);
  }

  getAppearanceState(): PDFName | undefined {
    const AS = this.dict.lookup(PDFName.of('AS'));
    if (AS instanceof PDFName) return AS;
    return undefined;
  }

  setAppearanceState(state: PDFName) {
    this.dict.set(PDFName.of('AS'), state);
  }

  setAppearances(appearances: PDFDict) {
    this.dict.set(PDFName.of('AP'), appearances);
  }

  ensureAP(): PDFDict {
    let AP = this.AP();
    if (!AP) {
      AP = this.dict.context.obj({});
      this.dict.set(PDFName.of('AP'), AP);
    }
    return AP;
  }

  getNormalAppearance(): PDFRef | PDFDict {
    const AP = this.ensureAP();
    const N = AP.get(PDFName.of('N'));
    if (N instanceof PDFRef || N instanceof PDFDict) return N;

    throw new Error(`Unexpected N type: ${N?.constructor.name}`);
  }

  /** @param appearance A PDFDict or PDFStream (direct or ref) */
  setNormalAppearance(appearance: PDFRef | PDFDict) {
    const AP = this.ensureAP();
    AP.set(PDFName.of('N'), appearance);
  }

  /** @param appearance A PDFDict or PDFStream (direct or ref) */
  setRolloverAppearance(appearance: PDFRef | PDFDict) {
    const AP = this.ensureAP();
    AP.set(PDFName.of('R'), appearance);
  }

  /** @param appearance A PDFDict or PDFStream (direct or ref) */
  setDownAppearance(appearance: PDFRef | PDFDict) {
    const AP = this.ensureAP();
    AP.set(PDFName.of('D'), appearance);
  }

  removeRolloverAppearance() {
    const AP = this.AP();
    AP?.delete(PDFName.of('R'));
  }

  removeDownAppearance() {
    const AP = this.AP();
    AP?.delete(PDFName.of('D'));
  }

  getAppearances():
    | {
        normal: PDFStream | PDFDict;
        rollover?: PDFStream | PDFDict;
        down?: PDFStream | PDFDict;
      }
    | undefined {
    const AP = this.AP();

    if (!AP) return undefined;

    const N = AP.lookup(PDFName.of('N'), PDFDict, PDFStream);
    const R = AP.lookupMaybe(PDFName.of('R'), PDFDict, PDFStream);
    const D = AP.lookupMaybe(PDFName.of('D'), PDFDict, PDFStream);

    return { normal: N, rollover: R, down: D };
  }

  getFlags(): number {
    return this.F()?.asNumber() ?? 0;
  }

  setFlags(flags: number) {
    this.dict.set(PDFName.of('F'), PDFNumber.of(flags));
  }

  hasFlag(flag: number): boolean {
    const flags = this.getFlags();
    return (flags & flag) !== 0;
  }

  setFlag(flag: number) {
    const flags = this.getFlags();
    this.setFlags(flags | flag);
  }

  clearFlag(flag: number) {
    const flags = this.getFlags();
    this.setFlags(flags & ~flag);
  }

  setFlagTo(flag: number, enable: boolean) {
    if (enable) this.setFlag(flag);
    else this.clearFlag(flag);
  }
}

export default PDFAnnotation;
