import {
  PDFCrossRef,
  PDFTrailer,
  PDFArrayObject,
  PDFNameObject,
} from './PDFObjects';
import { PDFIndirectObject } from './PDFObjects/PDFIndirectObject';
import _ from 'lodash';
import dedent from 'dedent';

class PDFPageTree extends PDFIndirectObject {
  pagesArrayObj = PDFArrayObject();
  content = {};

  constructor(...args) {
    super(...args);
    this.content = {
      'Type': PDFNameObject('Pages'),
      'Kids': this.pagesArrayObj,
      'Count': 0,
    };
  }

  addPage = (pageObj) => {
    this.pagesArrayObj.push(pageObj.toIndirectRef());
    this.content.Count += 1;
    return this;
  }
}

export default (...args) => new PDFPageTree(...args);
