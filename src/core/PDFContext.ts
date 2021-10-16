import pako from 'pako';

import PDFHeader from 'src/core/document/PDFHeader';
import { UnexpectedObjectTypeError } from 'src/core/errors';
import PDFArray from 'src/core/objects/PDFArray';
import PDFBool from 'src/core/objects/PDFBool';
import PDFDict from 'src/core/objects/PDFDict';
import PDFHexString from 'src/core/objects/PDFHexString';
import PDFName from 'src/core/objects/PDFName';
import PDFNull from 'src/core/objects/PDFNull';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFObject from 'src/core/objects/PDFObject';
import PDFRawStream from 'src/core/objects/PDFRawStream';
import PDFRef from 'src/core/objects/PDFRef';
import PDFStream from 'src/core/objects/PDFStream';
import PDFString from 'src/core/objects/PDFString';
import PDFOperator from 'src/core/operators/PDFOperator';
import Ops from 'src/core/operators/PDFOperatorNames';
import PDFContentStream from 'src/core/structures/PDFContentStream';
import { typedArrayFor } from 'src/utils';
import { SimpleRNG } from 'src/utils/rng';

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

const byAscendingObjectNumber = (
  [a]: [PDFRef, PDFObject],
  [b]: [PDFRef, PDFObject],
) => a.objectNumber - b.objectNumber;

class PDFContext {
  static create = () => new PDFContext();

  largestObjectNumber: number;
  header: PDFHeader;
  trailerInfo: {
    Root?: PDFObject;
    Encrypt?: PDFObject;
    Info?: PDFObject;
    ID?: PDFObject;
  };
  rng: SimpleRNG;

  private readonly indirectObjects: Map<PDFRef, PDFObject>;

  private pushGraphicsStateContentStreamRef?: PDFRef;
  private popGraphicsStateContentStreamRef?: PDFRef;

  private constructor() {
    this.largestObjectNumber = 0;
    this.header = PDFHeader.forVersion(1, 7);
    this.trailerInfo = {};

    this.indirectObjects = new Map();
    this.rng = SimpleRNG.withSeed(1);
  }

  assign(ref: PDFRef, object: PDFObject): void {
    this.indirectObjects.set(ref, object);
    if (ref.objectNumber > this.largestObjectNumber) {
      this.largestObjectNumber = ref.objectNumber;
    }
  }

  nextRef(): PDFRef {
    this.largestObjectNumber += 1;
    return PDFRef.of(this.largestObjectNumber);
  }

  register(object: PDFObject): PDFRef {
    const ref = this.nextRef();
    this.assign(ref, object);
    return ref;
  }

  delete(ref: PDFRef): boolean {
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
    return this.stream(pako.deflate(typedArrayFor(contents)), {
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
}

export default PDFContext;
