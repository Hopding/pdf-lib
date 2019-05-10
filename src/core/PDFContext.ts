import PDFArray from 'src/core/objects/PDFArray';
import PDFBool from 'src/core/objects/PDFBool';
import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFNull from 'src/core/objects/PDFNull';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFObject from 'src/core/objects/PDFObject';
import PDFString from 'src/core/objects/PDFString';

interface LiteralObject {
  [name: string]: Literal | PDFObject;
}

interface LiteralArray {
  [index: number]: Literal | PDFObject;
}

type Literal = LiteralObject | LiteralArray | string | number | boolean | null;

class PDFContext {
  obj(literal: null): typeof PDFNull;
  obj(literal: string): PDFString;
  obj(literal: number): PDFNumber;
  obj(literal: boolean): PDFBool;
  obj(literal: LiteralArray): PDFArray;
  obj(literal: LiteralObject): PDFDict;

  obj(literal: Literal) {
    if (literal instanceof PDFObject) {
      return literal;
    } else if (literal === null) {
      return PDFNull;
    } else if (typeof literal === 'string') {
      return PDFString.of(literal);
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
        dict.set(PDFName.of(key), this.obj(value));
      }
      return dict;
    }
  }
}

export default PDFContext;
