/* @flow */
import { PDFObject, PDFDictionary, PDFIndirectObject } from '../pdf-objects';
import { validate, validateArr, isInstance } from '../utils/validate';

class PDFObjectStream extends PDFObject {
  dict: PDFDictionary;
  objects: PDFIndirectObject[];

  constructor(dictionary: PDFDictionary, objects: PDFIndirectObject[]) {
    super();
    validate(
      dictionary,
      isInstance(PDFDictionary),
      'PDFObjectStream.dictionary must be a PDFDictionary',
    );
    validateArr(
      objects,
      isInstance(PDFIndirectObject),
      'PDFObjectStream.objects must be an array of PDFIndirectObject',
    );
    this.objects = objects;
  }

  static from = (dictionary: PDFDictionary, objects: PDFIndirectObject[]) =>
    new PDFObjectStream(dictionary, objects);
}

export default PDFObjectStream;
