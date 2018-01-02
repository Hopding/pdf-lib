/* @flow */
import { PDFIndirectObject, PDFDictionary } from '../pdf-objects';

class PDFPageTree extends PDFDictionary {
  static validKeys = Object.freeze(['Type', 'Parent', 'Kids', 'Count']);

  static from = (object: PDFDictionary): PDFPageTree =>
    new PDFPageTree(object, PDFPageTree.validKeys);

  getKids = () => {
    const kids = this.get('Kids');

    let kidsArr = kids;
    if (kids instanceof PDFIndirectObject) kidsArr = kids.pdfObject;

    return kidsArr.map((elem: PDFIndirectObject) => elem.pdfObject);
  };

  traverse = (visit: Function) => {
    this.getKids().forEach(kid => {
      visit(kid);
      if (kid instanceof PDFPageTree) kid.traverse(visit);
    });
    return this;
  };
}

export default PDFPageTree;
