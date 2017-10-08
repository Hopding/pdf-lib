/* @flow */
import PDFObject from './PDFObject';

class PDFNull extends PDFObject {
  toString = () => 'null';
}

export default PDFNull;
