import PDFDict, { DictMap } from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFRef from 'src/core/objects/PDFRef';
import PDFContext from 'src/core/PDFContext';
import PDFPageTree from 'src/core/structures/PDFPageTree';

class PDFCatalog extends PDFDict {
  static withContextAndPages = (
    context: PDFContext,
    pages: PDFRef | PDFPageTree,
  ) => {
    const dict = new Map();
    dict.set(PDFName.of('Type'), PDFName.of('Catalog'));
    dict.set(PDFName.of('Pages'), pages);
    return new PDFCatalog(dict, context);
  };

  static fromMapWithContext = (map: DictMap, context: PDFContext) =>
    new PDFCatalog(map, context);

  Pages(): PDFPageTree {
    return this.lookup(PDFName.of('Pages'), PDFDict) as PDFPageTree;
  }
}

export default PDFCatalog;
