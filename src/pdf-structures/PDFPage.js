/* @flow */
import PDFDictionary from '../pdf-objects/PDFDictionary';
import PDFName from '../pdf-objects/PDFName';
import PDFObject from '../pdf-objects/PDFObject';

class PDFPage extends PDFDictionary {
  static validKeys = Object.freeze([
    'Type',
    'Parent',
    'LastModified',
    'Resources',
    'MediaBox',
    'CropBox',
    'BleedBox',
    'TrimBox',
    'ArtBox',
    'BoxColorInfo',
    'Contents',
    'Rotate',
    'Group',
    'Thumb',
    'B',
    'Dur',
    'Trans',
    'Annots',
    'AA',
    'Metadata',
    'PieceInfo',
    'StructParents',
    'ID',
    'PZ',
    'SeparationInfo',
    'Tabs',
    'TemplateInstantiated',
    'PresSteps',
    'UserUnit',
    'VP',
  ]);

  static isValidKey = (key: string | PDFName) => {
    if (key instanceof PDFName) return PDFPage.validKeys.includes(key.key);
    return PDFPage.validKeys.includes(key);
  };

  set = (key: string | PDFName, val: PDFObject): PDFPage => {
    if (PDFPage.isValidKey(key)) {
      super.set(key, val);
      return this;
    }
    throw new Error(`Invalid key for PDFPage: ${key.toString()}`);
  };
}

export default PDFPage;
