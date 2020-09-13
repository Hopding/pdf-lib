import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFStream from 'src/core/objects/PDFStream';
import PDFArray from 'src/core/objects/PDFArray';
import PDFRef from 'src/core/objects/PDFRef';

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

  getRectangle(): { x: number; y: number; width: number; height: number } {
    const Rect = this.Rect();
    return Rect?.asRectangle() ?? { x: 0, y: 0, width: 0, height: 0 };
  }

  setRectangle(rect: { x: number; y: number; width: number; height: number }) {
    const { x, y, width, height } = rect;
    const Rect = this.dict.context.obj([x, y, x + width, y + height]);
    this.dict.set(PDFName.of('Rect'), Rect);
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
}

export default PDFAnnotation;
