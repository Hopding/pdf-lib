import { PDFDictionary, PDFObject } from 'core/pdf-objects';
import { error } from 'utils';
import { isInstance, validate } from 'utils/validate';

class PDFStream extends PDFObject {
  dictionary: PDFDictionary;

  constructor(dictionary: PDFDictionary) {
    super();
    validate(
      dictionary,
      isInstance(PDFDictionary),
      'PDFStream.dictionary must be of type PDFDictionary',
    );
    this.dictionary = dictionary;
  }

  validateDictionary = () => {
    if (!this.dictionary.getMaybe('Length')) {
      error('"Length" is a required field for PDFStream dictionaries');
    }
  };

  // cloneDeep = (...args: any[]): any =>
    // error('Method "cloneDeep" is not implemented on PDFStream.');

  clone = (...args: any[]): any =>
    error('Method "clone" is not implemented on PDFStream.');
}

export default PDFStream;
