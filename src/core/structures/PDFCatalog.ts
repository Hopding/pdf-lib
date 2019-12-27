import PDFDict, { DictMap } from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFRef from 'src/core/objects/PDFRef';
import PDFContext from 'src/core/PDFContext';
import PDFAcroForm from 'src/core/structures/PDFAcroForm';
import PDFPageTree from 'src/core/structures/PDFPageTree';

class PDFCatalog extends PDFDict {
  static withContextAndPages = (
    context: PDFContext,
    pages: PDFPageTree | PDFRef,
  ) => {
    const dict = new Map();
    dict.set(PDFName.Type, PDFName.Catalog);
    dict.set(PDFName.Pages, pages);
    return new PDFCatalog(dict, context);
  };

  static fromMapWithContext = (map: DictMap, context: PDFContext) =>
    new PDFCatalog(map, context);

  Pages(): PDFPageTree {
    return this.lookup(PDFName.Pages, PDFDict) as PDFPageTree;
  }

  AcroForm(): PDFAcroForm | undefined {
    const acroFormDict = this.lookupMaybe(PDFName.of('AcroForm'), PDFDict);
    if (!acroFormDict) {
      return undefined;
    }
    return PDFAcroForm.fromDict(acroFormDict);
  }

  /**
   * Inserts the given ref as a leaf node of this catalog's page tree at the
   * specified index (zero-based). Also increments the `Count` of each node in
   * the page tree hierarchy to accomodate the new page.
   *
   * Returns the ref of the PDFPageTree node into which `leafRef` was inserted.
   */
  insertLeafNode(leafRef: PDFRef, index: number): PDFRef {
    const pagesRef = this.get(PDFName.Pages) as PDFRef;
    const maybeParentRef = this.Pages().insertLeafNode(leafRef, index);
    return maybeParentRef || pagesRef;
  }

  removeLeafNode(index: number): void {
    this.Pages().removeLeafNode(index);
  }
}

export default PDFCatalog;
