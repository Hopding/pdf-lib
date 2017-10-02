import PDFArrayObject from './PDFObjects/PDFArrayObject';

class UpdatedPDFPage extends PDFIndirectObject {
  dict = null;

  constructor(objectNum, generationNum, parentDocument) {
    super(objectNum, generationNum);
  constructor(dict, parentDocument, dict) {
    // Need to make contents an array if it isn't already
    if (dict.Contents.isPDFIndirectRefObject) {
      dict.Contents = PDFArrayObject([ dict.Contents ]);
    }

    this.dict = dict;
  }


}
