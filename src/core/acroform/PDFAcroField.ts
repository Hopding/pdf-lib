import PDFDict from 'src/core/objects/PDFDict';
import PDFString from 'src/core/objects/PDFString';
import PDFHexString from 'src/core/objects/PDFHexString';
import PDFName from 'src/core/objects/PDFName';
import PDFObject from 'src/core/objects/PDFObject';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFArray from 'src/core/objects/PDFArray';
// import { createPDFAcroField } from './utils';
// import PDFAcroNonTerminal from 'src/core/acroform/PDFAcroNonTerminal';

class PDFAcroField {
  readonly dict: PDFDict;

  static fromDict = (dict: PDFDict) => new PDFAcroField(dict);

  protected constructor(dict: PDFDict) {
    this.dict = dict;
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

  Parent(): PDFDict | undefined {
    return this.dict.lookupMaybe(PDFName.of('Parent'), PDFDict);
  }

  getParent(): PDFAcroField | undefined {
    const parent = this.Parent();
    if (!parent) return undefined;
    return PDFAcroField.fromDict(parent);
    // return createPDFAcroField(parent);
  }

  getFullyQualifiedName(): string | undefined {
    const parent = this.getParent();
    if (!parent) return this.getPartialName();
    return `${parent.getFullyQualifiedName()}.${this.getPartialName()}`;
  }

  getPartialName(): string | undefined {
    return this.T()?.decodeText();
  }

  getFlags(): number {
    return this.Ff()?.asNumber() ?? 0;
  }

  setFlags(flags: number) {
    this.dict.set(PDFName.of('Ff'), PDFNumber.of(flags));
  }

  hasFlag(bitIndex: number): boolean {
    const flags = this.getFlags();
    const flag = 1 << bitIndex;
    return (flags & flag) !== 0;
  }

  setFlag(bitIndex: number) {
    const flags = this.getFlags();
    const flag = 1 << bitIndex;
    this.setFlags(flags | flag);
  }

  clearFlag(bitIndex: number) {
    const flags = this.getFlags();
    const flag = 1 << bitIndex;
    this.setFlags(flags & ~flag);
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
