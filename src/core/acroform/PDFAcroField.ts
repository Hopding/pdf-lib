import PDFDict from 'src/core/objects/PDFDict';
import PDFString from 'src/core/objects/PDFString';
import PDFHexString from 'src/core/objects/PDFHexString';
import PDFName from 'src/core/objects/PDFName';
import PDFObject from 'src/core/objects/PDFObject';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFArray from 'src/core/objects/PDFArray';
import PDFRef from 'src/core/objects/PDFRef';
import { findLastMatch } from 'src/utils';
import { MissingDAEntryError, MissingTfOperatorError } from 'src/core/errors';

// Examples:
//   `/Helv 12 Tf` -> ['Helv', '12']
//   `/HeBo 8.00 Tf` -> ['HeBo', '8.00']
//   `/HeBo Tf` -> ['HeBo', undefined]
const tfRegex = /\/([^\0\t\n\f\r\ ]+)[\0\t\n\f\r\ ]*(\d*\.\d+|\d+)?[\0\t\n\f\r\ ]+Tf/;

class PDFAcroField {
  readonly dict: PDFDict;
  readonly ref: PDFRef;

  protected constructor(dict: PDFDict, ref: PDFRef) {
    this.dict = dict;
    this.ref = ref;
  }

  T(): PDFString | PDFHexString | undefined {
    return this.dict.lookupMaybe(PDFName.of('T'), PDFString, PDFHexString);
  }

  Ff(): PDFNumber | undefined {
    const numberOrRef = this.getInheritableAttribute(PDFName.of('Ff'));
    return this.dict.context.lookupMaybe(numberOrRef, PDFNumber);
  }

  V(): PDFObject | undefined {
    const valueOrRef = this.getInheritableAttribute(PDFName.of('V'));
    return this.dict.context.lookup(valueOrRef);
  }

  Kids(): PDFArray | undefined {
    return this.dict.lookupMaybe(PDFName.of('Kids'), PDFArray);
  }

  // Parent(): PDFDict | undefined {
  //   return this.dict.lookupMaybe(PDFName.of('Parent'), PDFDict);
  // }

  DA(): PDFString | PDFHexString | undefined {
    const da = this.dict.lookup(PDFName.of('DA'));
    if (da instanceof PDFString || da instanceof PDFHexString) return da;
    return undefined;
  }

  setKids(kids: PDFObject[]) {
    this.dict.set(PDFName.of('Kids'), this.dict.context.obj(kids));
  }

  getParent(): PDFAcroField | undefined {
    // const parent = this.Parent();
    // if (!parent) return undefined;
    // return new PDFAcroField(parent);

    const parentRef = this.dict.get(PDFName.of('Parent'));
    if (parentRef instanceof PDFRef) {
      const parent = this.dict.lookup(PDFName.of('Parent'), PDFDict);
      return new PDFAcroField(parent, parentRef);
    }

    return undefined;
  }

  setParent(parent: PDFRef | undefined) {
    if (!parent) this.dict.delete(PDFName.of('Parent'));
    else this.dict.set(PDFName.of('Parent'), parent);
  }

  getFullyQualifiedName(): string | undefined {
    const parent = this.getParent();
    if (!parent) return this.getPartialName();
    return `${parent.getFullyQualifiedName()}.${this.getPartialName()}`;
  }

  getPartialName(): string | undefined {
    return this.T()?.decodeText();
  }

  setPartialName(partialName: string | undefined) {
    if (!partialName) this.dict.delete(PDFName.of('T'));
    else this.dict.set(PDFName.of('T'), PDFHexString.fromText(partialName));
  }

  setDefaultAppearance(appearance: string) {
    this.dict.set(PDFName.of('DA'), PDFString.of(appearance));
  }

  getDefaultAppearance(): string | undefined {
    const DA = this.DA();

    if (DA instanceof PDFHexString) {
      return DA.decodeText();
    }

    return DA?.asString();
  }

  setFontSize(fontSize: number) {
    const name = this.getFullyQualifiedName() ?? '';

    const da = this.getDefaultAppearance();
    if (!da) throw new MissingDAEntryError(name);

    const daMatch = findLastMatch(da, tfRegex);
    if (!daMatch.match) throw new MissingTfOperatorError(name);

    const daStart = da.slice(0, daMatch.pos - daMatch.match[0].length);
    const daEnd = daMatch.pos <= da.length ? da.slice(daMatch.pos) : '';
    const fontName = daMatch.match[1];
    const modifiedDa = `${daStart} /${fontName} ${fontSize} Tf ${daEnd}`;

    this.setDefaultAppearance(modifiedDa);
  }

  getFlags(): number {
    return this.Ff()?.asNumber() ?? 0;
  }

  setFlags(flags: number) {
    this.dict.set(PDFName.of('Ff'), PDFNumber.of(flags));
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

  getInheritableAttribute(name: PDFName): PDFObject | undefined {
    let attribute: PDFObject | undefined;
    this.ascend((node) => {
      if (!attribute) attribute = node.dict.get(name);
    });
    return attribute;
  }

  ascend(visitor: (node: PDFAcroField) => any): void {
    visitor(this);
    const parent = this.getParent();
    if (parent) parent.ascend(visitor);
  }
}

export default PDFAcroField;
