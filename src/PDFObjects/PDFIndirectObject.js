import { isInt, isString, isObject } from '../utils';
import PDFDictionaryObject from './PDFDictionaryObject';
import PDFArrayObject from './PDFArrayObject';
import dedent from 'dedent';
import _ from 'lodash';

/*
Represents a PDF Indirect Object.

From PDF 1.7 Specification, "7.3.10 Indirect Objects"
(http://www.adobe.com/content/dam/Adobe/en/devnet/acrobat/pdfs/PDF32000_2008.pdf):
  Any object in a PDF file may be labelled as an indirect object. This gives the object a unique object identifier by which other objects can refer to it (for example, as an element of an array or as the value of a dictionary entry). The object identifier shall consist of two parts:

  • A positive integer object number. Indirect objects may be numbered sequentially within a PDF file, but this is not required; object numbers may be assigned in any arbitrary order.
  • A non-negative integer generation number. In a newly created file, all indirect objects shall have generation numbers of 0. Nonzero generation numbers may be introduced when the file is later updated; see sub- clauses 7.5.4, "Cross-Reference Table" and 7.5.6, "Incremental Updates."

  Together, the combination of an object number and a generation number shall uniquely identify an indirect object.

  The definition of an indirect object in a PDF file shall consist of its object number and generation number (separated by white space), followed by the value of the object bracketed between the keywords obj and endobj.

  EXAMPLE Indirect object definition:
    12 0 obj
      ( Brillig )
    endobj
    Defines an indirect string object with an object number of 12, a generation number of 0, and the value Brillig.

  The object may be referred to from elsewhere in the file by an indirect reference. Such indirect references shall consist of the object number, the generation number, and the keyword R (with white space separating each part):
    12 0 R
*/
export class PDFIndirectObject {
  isPDFIndirectObject = true;

  constructor(objectNum, generationNum, content) {
    if (!isInt(objectNum) && objectNum >= 0) throw new Error(
      'PDF Indirect Objects must have integer object numbers >= 0'
    );
    if (!isInt(generationNum) && generationNum >= 0) throw new Error(
      'PDF Indirect Objects must have integer generation numbers >= 0'
    );
    this.objectNum = objectNum;
    this.generationNum = generationNum;
    this.content = content;
  }

  setContent = (content) => { this.content = content; }

  toIndirectRef = () => `${this.objectNum} ${this.generationNum} R`;

  toString = () => dedent(`
    ${this.objectNum} ${this.generationNum} obj
    ${  _.isObject(this.content) ? PDFDictionaryObject(this.content)
      : _.isArray(this.content)  ? PDFArrayObject(this.content)
      : this.content}
    endobj
  `) + '\n\n';
}

export default (...args) => new PDFIndirectObject(...args);
