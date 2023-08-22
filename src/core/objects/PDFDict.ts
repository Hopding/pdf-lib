import PDFArray from 'src/core/objects/PDFArray';
import PDFBool from 'src/core/objects/PDFBool';
import PDFHexString from 'src/core/objects/PDFHexString';
import PDFName from 'src/core/objects/PDFName';
import PDFNull from 'src/core/objects/PDFNull';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFObject from 'src/core/objects/PDFObject';
import PDFRef from 'src/core/objects/PDFRef';
import PDFStream from 'src/core/objects/PDFStream';
import PDFString from 'src/core/objects/PDFString';
import PDFContext from 'src/core/PDFContext';
import CharCodes from 'src/core/syntax/CharCodes';

export type DictMap = Map<PDFName, PDFObject>;

class PDFDict extends PDFObject {
  static withContext = (context: PDFContext) => new PDFDict(new Map(), context);

  static fromMapWithContext = (map: DictMap, context: PDFContext) =>
    new PDFDict(map, context);

  readonly context: PDFContext;

  private readonly dict: DictMap;

  protected constructor(map: DictMap, context: PDFContext) {
    super();
    this.dict = map;
    this.context = context;
  }

  keys(): PDFName[] {
    return Array.from(this.dict.keys());
  }

  values(): PDFObject[] {
    return Array.from(this.dict.values());
  }

  entries(): [PDFName, PDFObject][] {
    return Array.from(this.dict.entries());
  }

  set(key: PDFName, value: PDFObject): void {
    this.dict.set(key, value);
  }

  get(
    key: PDFName,
    // TODO: `preservePDFNull` is for backwards compatibility. Should be
    // removed in next breaking API change.
    preservePDFNull = false,
  ): PDFObject | undefined {
    const value = this.dict.get(key);
    if (value === PDFNull && !preservePDFNull) return undefined;
    return value;
  }

  has(key: PDFName): boolean {
    const value = this.dict.get(key);
    return value !== undefined && value !== PDFNull;
  }

  lookupMaybe(key: PDFName, type: typeof PDFArray): PDFArray | undefined;
  lookupMaybe(key: PDFName, type: typeof PDFBool): PDFBool | undefined;
  lookupMaybe(key: PDFName, type: typeof PDFDict): PDFDict | undefined;
  lookupMaybe(
    key: PDFName,
    type: typeof PDFHexString,
  ): PDFHexString | undefined;
  lookupMaybe(key: PDFName, type: typeof PDFName): PDFName | undefined;
  lookupMaybe(key: PDFName, type: typeof PDFNull): typeof PDFNull | undefined;
  lookupMaybe(key: PDFName, type: typeof PDFNumber): PDFNumber | undefined;
  lookupMaybe(key: PDFName, type: typeof PDFStream): PDFStream | undefined;
  lookupMaybe(key: PDFName, type: typeof PDFRef): PDFRef | undefined;
  lookupMaybe(key: PDFName, type: typeof PDFString): PDFString | undefined;
  lookupMaybe(
    ref: PDFName,
    type1: typeof PDFString,
    type2: typeof PDFHexString,
  ): PDFString | PDFHexString | undefined;
  lookupMaybe(
    ref: PDFName,
    type1: typeof PDFDict,
    type2: typeof PDFStream,
  ): PDFDict | PDFStream | undefined;
  lookupMaybe(
    ref: PDFName,
    type1: typeof PDFString,
    type2: typeof PDFHexString,
    type3: typeof PDFArray,
  ): PDFString | PDFHexString | PDFArray | undefined;

  lookupMaybe(key: PDFName, ...types: any[]) {
    // TODO: `preservePDFNull` is for backwards compatibility. Should be
    // removed in next breaking API change.
    const preservePDFNull = types.includes(PDFNull);

    const value = this.context.lookupMaybe(
      this.get(key, preservePDFNull),
      // @ts-ignore
      ...types,
    ) as any;

    if (value === PDFNull && !preservePDFNull) return undefined;

    return value;
  }

  lookup(key: PDFName): PDFObject | undefined;
  lookup(key: PDFName, type: typeof PDFArray): PDFArray;
  lookup(key: PDFName, type: typeof PDFBool): PDFBool;
  lookup(key: PDFName, type: typeof PDFDict): PDFDict;
  lookup(key: PDFName, type: typeof PDFHexString): PDFHexString;
  lookup(key: PDFName, type: typeof PDFName): PDFName;
  lookup(key: PDFName, type: typeof PDFNull): typeof PDFNull;
  lookup(key: PDFName, type: typeof PDFNumber): PDFNumber;
  lookup(key: PDFName, type: typeof PDFStream): PDFStream;
  lookup(key: PDFName, type: typeof PDFRef): PDFRef;
  lookup(key: PDFName, type: typeof PDFString): PDFString;
  lookup(
    ref: PDFName,
    type1: typeof PDFString,
    type2: typeof PDFHexString,
  ): PDFString | PDFHexString;
  lookup(
    ref: PDFName,
    type1: typeof PDFDict,
    type2: typeof PDFStream,
  ): PDFDict | PDFStream;
  lookup(
    ref: PDFName,
    type1: typeof PDFString,
    type2: typeof PDFHexString,
    type3: typeof PDFArray,
  ): PDFString | PDFHexString | PDFArray;

  lookup(key: PDFName, ...types: any[]) {
    // TODO: `preservePDFNull` is for backwards compatibility. Should be
    // removed in next breaking API change.
    const preservePDFNull = types.includes(PDFNull);

    const value = this.context.lookup(
      this.get(key, preservePDFNull),
      // @ts-ignore
      ...types,
    ) as any;

    if (value === PDFNull && !preservePDFNull) return undefined;

    return value;
  }

  delete(key: PDFName): boolean {
    return this.dict.delete(key);
  }

  asMap(): Map<PDFName, PDFObject> {
    return new Map(this.dict);
  }

  /** Generate a random key that doesn't exist in current key set */
  uniqueKey(tag = ''): PDFName {
    const existingKeys = this.keys();
    let key = PDFName.of(this.context.addRandomSuffix(tag, 10));
    while (existingKeys.includes(key)) {
      key = PDFName.of(this.context.addRandomSuffix(tag, 10));
    }
    return key;
  }

  clone(context?: PDFContext): PDFDict {
    const clone = PDFDict.withContext(context || this.context);
    const entries = this.entries();
    for (let idx = 0, len = entries.length; idx < len; idx++) {
      const [key, value] = entries[idx];
      clone.set(key, value);
    }
    return clone;
  }

  toString(): string {
    let dictString = '<<\n';
    const entries = this.entries();
    for (let idx = 0, len = entries.length; idx < len; idx++) {
      const [key, value] = entries[idx];
      dictString += key.toString() + ' ' + value.toString() + '\n';
    }
    dictString += '>>';
    return dictString;
  }

  sizeInBytes(): number {
    let size = 5;
    const entries = this.entries();
    for (let idx = 0, len = entries.length; idx < len; idx++) {
      const [key, value] = entries[idx];
      size += key.sizeInBytes() + value.sizeInBytes() + 2;
    }
    return size;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): number {
    const initialOffset = offset;

    buffer[offset++] = CharCodes.LessThan;
    buffer[offset++] = CharCodes.LessThan;
    buffer[offset++] = CharCodes.Newline;

    const entries = this.entries();
    for (let idx = 0, len = entries.length; idx < len; idx++) {
      const [key, value] = entries[idx];
      offset += key.copyBytesInto(buffer, offset);
      buffer[offset++] = CharCodes.Space;
      offset += value.copyBytesInto(buffer, offset);
      buffer[offset++] = CharCodes.Newline;
    }

    buffer[offset++] = CharCodes.GreaterThan;
    buffer[offset++] = CharCodes.GreaterThan;

    return offset - initialOffset;
  }
}

export default PDFDict;
