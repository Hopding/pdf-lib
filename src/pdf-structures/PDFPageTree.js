/* @flow */
import PDFDictionary from '../pdf-objects/PDFDictionary';
import PDFName from '../pdf-objects/PDFName';
import PDFObject from '../pdf-objects/PDFObject';

class PDFPageTree extends PDFDictionary {
  static validKeys = Object.freeze(['Type', 'Parent', 'Kids', 'Count']);

  static isValidKey = (key: string | PDFName) => {
    if (key instanceof PDFName) return PDFPageTree.validKeys.includes(key.key);
    return PDFPageTree.validKeys.includes(key);
  };

  set = (key: string | PDFName, val: PDFObject): PDFPageTree => {
    if (PDFPageTree.isValidKey(key)) {
      super.set(key, val);
      return this;
    }
    throw new Error(`Invalid key for PDFPageTree: ${key.toString()}`);
  };
}

export default PDFPageTree;
