import PDFDict from 'src/core/objects/PDFDict';
import PDFName from '../objects/PDFName';
import PDFStream from '../objects/PDFStream';

class PDFAnnotation {
  readonly dict: PDFDict;

  static fromDict = (dict: PDFDict): PDFAnnotation => new PDFAnnotation(dict);

  protected constructor(dict: PDFDict) {
    this.dict = dict;
  }

  AP(): PDFDict | undefined {
    return this.dict.lookupMaybe(PDFName.of('AP'), PDFDict);
  }

  setAppearanceState(state: PDFName) {
    this.dict.set(PDFName.of('AS'), state);
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

// function getIfType<A extends Function>(
//   x: any,
//   typeA: A,
// ): A['prototype'] | undefined {
//   if (x instanceof typeA) return x;
//   return undefined;
// }

// function isType<A extends Function>(x: any, typeA: A): x is number | undefined {
//   if (x instanceof typeA) return true;
//   return false;
// }

// function checkType<A extends Function>(
//   x: any,
//   typeA: A,
// ): asserts x is A['prototype'] {
//   if (x instanceof typeA) return;
//   throw new UnexpectedObjectTypeError(x, typeA);
// }

// function checkType<A extends Function, B extends Function>(
//   x: any,
//   typeA: A,
//   typeB: B,
// ): asserts x is A['prototype'] | B['prototype'] {
//   if (x instanceof typeA) return;
//   if (x instanceof typeB) return;
//   throw new UnexpectedObjectTypeError(x, [typeA, typeB]);
// }

// function checkType<A extends Function[]>(
//   x: any,
//   ...types: A
// ): asserts x is A[number]['prototype'] {
//   if (types.find((t) => x instanceof t)) return;
//   throw new UnexpectedObjectTypeError(x, types);
// }

// type Maybe<T> = T | number;

// function checkTypeMaybe<A extends Function[]>(
//   x: any,
//   ...types: A
// ): asserts x is Maybe<number> {
//   if (types.find((t) => x instanceof t)) return;
//   throw new UnexpectedObjectTypeError(x, types);
// }

// function checkType<A extends Function>(
//   x: any,
//   typeA: A,
// ): asserts x is A['prototype'];

// function checkType<A extends Function, B extends Function>(
//   x: any,
//   typeA: A,
//   typeB: B,
// ): asserts x is A['prototype'] | B['prototype'];

// function checkType(x: any, ...types: any[]) {
//   if (types.find((t) => x instanceof t)) return;
//   throw new UnexpectedObjectTypeError(x, types);
// }

// function checkTypeMaybe<A extends Function>(
//   x: any,
//   typeA: A,
// ): asserts x is A['prototype'] | undefined;

// function checkTypeMaybe<A extends Function, B extends Function>(
//   x: any,
//   typeA: A,
//   typeB: B,
// ): asserts x is A['prototype'] | B['prototype'] | undefined;

// function checkTypeMaybe(x: any, ...types: any[]) {
//   if (types.find((t) => x instanceof t)) return;
//   throw new UnexpectedObjectTypeError(x, types);
// }

export default PDFAnnotation;
