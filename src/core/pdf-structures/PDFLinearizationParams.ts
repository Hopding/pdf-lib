import { PDFDictionary } from 'core/pdf-objects';
import { isInstance, validate } from 'utils/validate';

class PDFLinearizationParams extends PDFDictionary {
  static fromDict = (dict: PDFDictionary): PDFLinearizationParams => {
    validate(dict, isInstance(PDFDictionary), '"dict" must be a PDFDictionary');
    return new PDFLinearizationParams(dict.map, dict.index);
  };
}

export default PDFLinearizationParams;
