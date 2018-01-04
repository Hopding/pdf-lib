/* @flow */
import PDFDictionary from '../pdf-objects/PDFDictionary';

class PDFLinearizationParams extends PDFDictionary {
  static validKeys = Object.freeze(['L', 'H', 'O', 'E', 'N', 'T', 'P']);

  static from = (object: PDFDictionary): PDFLinearizationParams =>
    new PDFLinearizationParams(object, PDFLinearizationParams.validKeys);
}

export default PDFLinearizationParams;
