import { zlibSync } from 'fflate';
import type { DocumentSnapshot } from '../api';

import PDFHeader from './document/PDFHeader';
import { UnexpectedObjectTypeError } from './errors';
import PDFArray from './objects/PDFArray';
import PDFBool from './objects/PDFBool';
import PDFDict from './objects/PDFDict';
import PDFHexString from './objects/PDFHexString';
import PDFName from './objects/PDFName';
import PDFNull from './objects/PDFNull';
import PDFNumber from './objects/PDFNumber';
import PDFObject from './objects/PDFObject';
import PDFRawStream from './objects/PDFRawStream';
import PDFRef from './objects/PDFRef';
import PDFStream from './objects/PDFStream';
import PDFString from './objects/PDFString';
import PDFOperator from './operators/PDFOperator';
import Ops from './operators/PDFOperatorNames';
import PDFContentStream from './structures/PDFContentStream';
import PDFSecurity from './security/PDFSecurity';
import { typedArrayFor } from '../utils';
import { SimpleRNG } from '../utils/rng';

type LookupKey = PDFRef | PDFObject | undefined;

interface LiteralObject {
  [name: string]: Literal | PDFObject;
}

interface LiteralArray {
  [index: number]: Literal | PDFObject;
}

type Literal =
  | LiteralObject
  | LiteralArray
  | string
  | number
  | boolean
  | null
  | undefined;

interface LiteralConfig {
  deep?: boolean;
  literalRef?: boolean;
  literalStreamDict?: boolean;
  literalString?: boolean;
}

const byAscendingObjectNumber = (
  [a]: [PDFRef, PDFObject],
  [b]: [PDFRef, PDFObject],
) => a.objectNumber - b.objectNumber;

class PDFContext {
  isDecrypted = true;
  static create = () => new PDFContext();

  largestObjectNumber: number;
  header: PDFHeader;
  trailerInfo: {
    Size?: PDFNumber;
    Root?: PDFObject;
    Encrypt?: PDFObject;
    Info?: PDFObject;
    ID?: PDFObject;
  };
  rng: SimpleRNG;
  pdfFileDetails: {
    pdfSize: number;
    prevStartXRef: number;
    useObjectStreams: boolean;
    originalBytes?: Uint8Array;
  };
  snapshot?: DocumentSnapshot;

  security?: PDFSecurity;

  private readonly indirectObjects: Map<PDFRef, PDFObject>;

  private pushGraphicsStateContentStreamRef?: PDFRef;
  private popGraphicsStateContentStreamRef?: PDFRef;

  private constructor() {
    this.largestObjectNumber = 0;
    this.header = PDFHeader.forVersion(1, 7);
    this.trailerInfo = {};

    this.indirectObjects = new Map();
    this.rng = SimpleRNG.withSeed(1);
    this.pdfFileDetails = {
      pdfSize: 0,
      prevStartXRef: 0,
      useObjectStreams: false,
    };
  }

  assign(ref: PDFRef, object: PDFObject): void {
    this.indirectObjects.set(ref, object);
    if (ref.objectNumber > this.largestObjectNumber) {
      this.largestObjectNumber = ref.objectNumber;
    }
  }

  nextRef(): PDFRef {
    this.largestObjectNumber += 1;
    const ref = PDFRef.of(this.largestObjectNumber);
    if (this.snapshot) this.snapshot.markRefForSave(ref);
    return ref;
  }

  register(object: PDFObject): PDFRef {
    const ref = this.nextRef();
    this.assign(ref, object);
    return ref;
  }

  delete(ref: PDFRef): boolean {
    if (this.snapshot) this.snapshot.markDeletedRef(ref);
    return this.indirectObjects.delete(ref);
  }

  lookupMaybe(ref: LookupKey, type: typeof PDFArray): PDFArray | undefined;
  lookupMaybe(ref: LookupKey, type: typeof PDFBool): PDFBool | undefined;
  lookupMaybe(ref: LookupKey, type: typeof PDFDict): PDFDict | undefined;
  lookupMaybe(
    ref: LookupKey,
    type: typeof PDFHexString,
  ): PDFHexString | undefined;
  lookupMaybe(ref: LookupKey, type: typeof PDFName): PDFName | undefined;
  lookupMaybe(ref: LookupKey, type: typeof PDFNull): typeof PDFNull | undefined;
  lookupMaybe(ref: LookupKey, type: typeof PDFNumber): PDFNumber | undefined;
  lookupMaybe(ref: LookupKey, type: typeof PDFStream): PDFStream | undefined;
  lookupMaybe(ref: LookupKey, type: typeof PDFRef): PDFRef | undefined;
  lookupMaybe(ref: LookupKey, type: typeof PDFString): PDFString | undefined;
  lookupMaybe(
    ref: LookupKey,
    type1: typeof PDFString,
    type2: typeof PDFHexString,
  ): PDFString | PDFHexString | undefined;

  lookupMaybe(ref: LookupKey, ...types: any[]) {
    // TODO: `preservePDFNull` is for backwards compatibility. Should be
    // removed in next breaking API change.
    const preservePDFNull = types.includes(PDFNull);

    const result = ref instanceof PDFRef ? this.indirectObjects.get(ref) : ref;

    if (!result || (result === PDFNull && !preservePDFNull)) return undefined;

    for (let idx = 0, len = types.length; idx < len; idx++) {
      const type = types[idx];
      if (type === PDFNull) {
        if (result === PDFNull) return result;
      } else {
        if (result instanceof type) return result;
      }
    }
    throw new UnexpectedObjectTypeError(types, result);
  }

  lookup(ref: LookupKey): PDFObject | undefined;
  lookup(ref: LookupKey, type: typeof PDFArray): PDFArray;
  lookup(ref: LookupKey, type: typeof PDFBool): PDFBool;
  lookup(ref: LookupKey, type: typeof PDFDict): PDFDict;
  lookup(ref: LookupKey, type: typeof PDFHexString): PDFHexString;
  lookup(ref: LookupKey, type: typeof PDFName): PDFName;
  lookup(ref: LookupKey, type: typeof PDFNull): typeof PDFNull;
  lookup(ref: LookupKey, type: typeof PDFNumber): PDFNumber;
  lookup(ref: LookupKey, type: typeof PDFStream): PDFStream;
  lookup(ref: LookupKey, type: typeof PDFRef): PDFRef;
  lookup(ref: LookupKey, type: typeof PDFString): PDFString;
  lookup(
    ref: LookupKey,
    type1: typeof PDFString,
    type2: typeof PDFHexString,
  ): PDFString | PDFHexString;

  lookup(ref: LookupKey, ...types: any[]) {
    const result = ref instanceof PDFRef ? this.indirectObjects.get(ref) : ref;

    if (types.length === 0) return result;

    for (let idx = 0, len = types.length; idx < len; idx++) {
      const type = types[idx];
      if (type === PDFNull) {
        if (result === PDFNull) return result;
      } else {
        if (result instanceof type) return result;
      }
    }

    throw new UnexpectedObjectTypeError(types, result);
  }

  getRef(pdfObject: PDFObject | PDFRef): PDFRef | undefined {
    if (pdfObject instanceof PDFRef) return pdfObject;
    return this.getObjectRef(pdfObject);
  }

  getObjectRef(pdfObject: PDFObject): PDFRef | undefined {
    const entries = Array.from(this.indirectObjects.entries());
    for (let idx = 0, len = entries.length; idx < len; idx++) {
      const [ref, object] = entries[idx];
      if (object === pdfObject) {
        return ref;
      }
    }

    return undefined;
  }

  enumerateIndirectObjects(): [PDFRef, PDFObject][] {
    return Array.from(this.indirectObjects.entries()).sort(
      byAscendingObjectNumber,
    );
  }

  obj(literal: null | undefined): typeof PDFNull;
  obj(literal: string): PDFName;
  obj(literal: number): PDFNumber;
  obj(literal: boolean): PDFBool;
  obj(literal: LiteralObject): PDFDict;
  obj(literal: LiteralArray): PDFArray;

  obj(literal: Literal) {
    if (literal instanceof PDFObject) {
      return literal;
    } else if (literal === null || literal === undefined) {
      return PDFNull;
    } else if (typeof literal === 'string') {
      return PDFName.of(literal);
    } else if (typeof literal === 'number') {
      return PDFNumber.of(literal);
    } else if (typeof literal === 'boolean') {
      return literal ? PDFBool.True : PDFBool.False;
    } else if (literal instanceof Uint8Array) {
      return PDFHexString.fromBytes(literal);
    } else if (Array.isArray(literal)) {
      const array = PDFArray.withContext(this);
      for (let idx = 0, len = literal.length; idx < len; idx++) {
        array.push(this.obj(literal[idx]));
      }
      return array;
    } else {
      const dict = PDFDict.withContext(this);
      const keys = Object.keys(literal);
      for (let idx = 0, len = keys.length; idx < len; idx++) {
        const key = keys[idx];
        const value = (literal as LiteralObject)[key] as any;
        if (value !== undefined) dict.set(PDFName.of(key), this.obj(value));
      }
      return dict;
    }
  }

  /*
   * @param obj The input PDFObject to convert to a literal.
   * @param cfg The configuration to be used when converting the object.
   * @param cfg.deep Recursively call this function on all encountered PDFArray elements and PDFDict values.
   * @param cfg.literalRef Also convert PDFRef to a (literal) object number.
   * @param cfg.literalStreamDict Also convert PDFStream to its associated dictionary's (literal) representation.
   * @param cfg.literalString Also convert PDFString and PDFHexString to a (literal) string value.
   * @returns Resolves with a document loaded from the input.
   */
  getLiteral(obj: PDFArray, cfg?: LiteralConfig): LiteralArray;
  getLiteral(obj: PDFBool, cfg?: LiteralConfig): boolean;
  getLiteral(obj: PDFDict, cfg?: LiteralConfig): LiteralObject;
  getLiteral(obj: PDFHexString, cfg?: LiteralConfig): PDFHexString | string;
  getLiteral(obj: PDFName, cfg?: LiteralConfig): string;
  getLiteral(obj: typeof PDFNull, cfg?: LiteralConfig): null;
  getLiteral(obj: PDFNumber, cfg?: LiteralConfig): number;
  getLiteral(obj: PDFRef, cfg?: LiteralConfig): PDFRef | number;
  getLiteral(obj: PDFStream, cfg?: LiteralConfig): PDFStream | LiteralObject;
  getLiteral(obj: PDFString, cfg?: LiteralConfig): PDFString | string;
  getLiteral(obj: PDFObject, cfg?: LiteralConfig): PDFObject;
  getLiteral(
    obj: PDFObject,
    {
      deep = true,
      literalRef = false,
      literalStreamDict = false,
      literalString = false,
    }: LiteralConfig = {},
  ): Literal | PDFObject {
    const cfg = { deep, literalRef, literalStreamDict, literalString };
    if (obj instanceof PDFArray) {
      const lit = obj.asArray();
      return deep ? lit.map((value) => this.getLiteral(value, cfg)) : lit;
    } else if (obj instanceof PDFBool) {
      return obj.asBoolean();
    } else if (obj instanceof PDFDict) {
      const lit: LiteralObject = {};
      const entries = obj.entries();
      for (let idx = 0, len = entries.length; idx < len; idx++) {
        const [name, value] = entries[idx];
        lit[this.getLiteral(name)] = deep ? this.getLiteral(value, cfg) : value;
      }
      return lit;
    } else if (obj instanceof PDFName) {
      return obj.decodeText();
    } else if (obj === PDFNull) {
      return null;
    } else if (obj instanceof PDFNumber) {
      return obj.asNumber();
    } else if (obj instanceof PDFRef && literalRef) {
      return obj.objectNumber;
    } else if (obj instanceof PDFStream && literalStreamDict) {
      return this.getLiteral(obj.dict, cfg);
    } else if (
      (obj instanceof PDFString || obj instanceof PDFHexString) &&
      literalString
    ) {
      return obj.asString();
    }
    return obj;
  }

  stream(
    contents: string | Uint8Array,
    dict: LiteralObject = {},
  ): PDFRawStream {
    return PDFRawStream.of(this.obj(dict), typedArrayFor(contents));
  }

  flateStream(
    contents: string | Uint8Array,
    dict: LiteralObject = {},
  ): PDFRawStream {
    return this.stream(zlibSync(typedArrayFor(contents)), {
      ...dict,
      Filter: 'FlateDecode',
    });
  }

  contentStream(
    operators: PDFOperator[],
    dict: LiteralObject = {},
  ): PDFContentStream {
    return PDFContentStream.of(this.obj(dict), operators);
  }

  formXObject(
    operators: PDFOperator[],
    dict: LiteralObject = {},
  ): PDFContentStream {
    return this.contentStream(operators, {
      BBox: this.obj([0, 0, 0, 0]),
      Matrix: this.obj([1, 0, 0, 1, 0, 0]),
      ...dict,
      Type: 'XObject',
      Subtype: 'Form',
    });
  }

  /*
   * Reference to PDFContentStream that contains a single PDFOperator: `q`.
   * Used by [[PDFPageLeaf]] instances to ensure that when content streams are
   * added to a modified PDF, they start in the default, unchanged graphics
   * state.
   */
  getPushGraphicsStateContentStream(): PDFRef {
    if (this.pushGraphicsStateContentStreamRef) {
      return this.pushGraphicsStateContentStreamRef;
    }
    const dict = this.obj({});
    const op = PDFOperator.of(Ops.PushGraphicsState);
    const stream = PDFContentStream.of(dict, [op]);
    this.pushGraphicsStateContentStreamRef = this.register(stream);
    return this.pushGraphicsStateContentStreamRef;
  }

  /*
   * Reference to PDFContentStream that contains a single PDFOperator: `Q`.
   * Used by [[PDFPageLeaf]] instances to ensure that when content streams are
   * added to a modified PDF, they start in the default, unchanged graphics
   * state.
   */
  getPopGraphicsStateContentStream(): PDFRef {
    if (this.popGraphicsStateContentStreamRef) {
      return this.popGraphicsStateContentStreamRef;
    }
    const dict = this.obj({});
    const op = PDFOperator.of(Ops.PopGraphicsState);
    const stream = PDFContentStream.of(dict, [op]);
    this.popGraphicsStateContentStreamRef = this.register(stream);
    return this.popGraphicsStateContentStreamRef;
  }

  addRandomSuffix(prefix: string, suffixLength = 4): string {
    return `${prefix}-${Math.floor(this.rng.nextInt() * 10 ** suffixLength)}`;
  }

  registerObjectChange(obj: PDFObject) {
    if (!this.snapshot) return;

    const ref = this.getObjectRef(obj);
    if (ref) {
      this.snapshot.markRefForSave(ref);
      return;
    }

    const containingRef = this.findContainingIndirectObject(obj);
    if (containingRef) {
      this.snapshot.markRefForSave(containingRef);
    }
  }

  private findContainingIndirectObject(target: PDFObject): PDFRef | undefined {
    const entries = Array.from(this.indirectObjects.entries());
    for (let idx = 0, len = entries.length; idx < len; idx++) {
      const [ref, object] = entries[idx];
      if (this.objectContains(object, target)) {
        return ref;
      }
    }
    return undefined;
  }

  private objectContains(container: PDFObject, target: PDFObject): boolean {
    if (container === target) return true;

    if (container instanceof PDFDict) {
      const values = container.values();
      for (let i = 0, len = values.length; i < len; i++) {
        if (this.objectContains(values[i], target)) return true;
      }
    } else if (container instanceof PDFArray) {
      for (let i = 0, len = container.size(); i < len; i++) {
        if (this.objectContains(container.get(i), target)) return true;
      }
    } else if (container instanceof PDFStream) {
      if (this.objectContains(container.dict, target)) return true;
    }

    return false;
  }
}

export default PDFContext;
