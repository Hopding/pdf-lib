import { PDFIndirectReference, PDFName, PDFObject } from 'core/pdf-objects';
import PDFDictionary from 'core/pdf-objects/PDFDictionary';
import { PDFPageTree } from 'core/pdf-structures';
import { isInstance, validate } from 'utils/validate';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';

class PDFCatalog extends PDFDictionary {
  static create = (
    pageTree: PDFIndirectReference<PDFPageTree>,
    index: PDFObjectIndex,
  ): PDFCatalog => {
    validate(
      pageTree,
      isInstance(PDFIndirectReference),
      '"pageTree" must be an indirect reference',
    );
    return new PDFCatalog(
      {
        Type: PDFName.from('Catalog'),
        Pages: pageTree,
      },
      index,
    );
  };

  static fromObject = (
    object: { [key: string]: PDFObject },
    index: PDFObjectIndex,
  ): PDFCatalog => new PDFCatalog(object, index);

  static fromDict = (dict: PDFDictionary) => {
    validate(dict, isInstance(PDFDictionary), '"dict" must be a PDFDictionary');
    return new PDFCatalog(dict.map, dict.index);
  };

  get Pages() {
    const Pages = this.get('Pages');
    return this.index.lookup(Pages) as PDFPageTree;
  }
}

export default PDFCatalog;
