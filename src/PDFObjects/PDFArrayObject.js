import { charCode, isString, PDFString } from '../utils';

/*
Represents a PDF Array Object.

From PDF 1.7 Specification, "7.3.6 Array Objects"
(http://www.adobe.com/content/dam/Adobe/en/devnet/acrobat/pdfs/PDF32000_2008.pdf):
  An array object is a one-dimensional collection of objects arranged sequentially. Unlike arrays in many other computer languages, PDF arrays may be heterogeneous; that is, an array’s elements may be any combination of numbers, strings, dictionaries, or any other objects, including other arrays. An array may have zero elements.

  An array shall be written as a sequence of objects enclosed in SQUARE BRACKETS (using LEFT SQUARE BRACKET (5Bh) and RIGHT SQUARE BRACKET (5Dh)).

  EXAMPLE:
    [549 3.14 false (Ralph) /SomeName]

  PDF directly supports only one-dimensional arrays. Arrays of higher dimension can be constructed by using arrays as elements of arrays, nested to any depth.
*/
class PDFArrayObject {
  constructor(array) {
    this.array = array;
  }

  toString = () =>
    `[${this.array.map(String).join(' ')}]`;
}

export default (...args) => new PDFArrayObject(...args);
