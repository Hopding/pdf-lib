import PDFDict, { DictMap } from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFRef from 'src/core/objects/PDFRef';
import PDFContext from 'src/core/PDFContext';
import PDFOutlines from 'src/core/structures/PDFOutlines';
import PDFPageTree from 'src/core/structures/PDFPageTree';

class PDFCatalog extends PDFDict {
  static withContextAndPages = (
    context: PDFContext,
    pages: PDFPageTree | PDFRef,
    outlines?: PDFOutlines | PDFRef,
  ) => {
    const dict = new Map();
    dict.set(PDFName.of('Type'), PDFName.of('Catalog'));
    dict.set(PDFName.of('Pages'), pages);
    dict.set(PDFName.Outlines, outlines);
    return new PDFCatalog(dict, context);
  };

  static fromMapWithContext = (map: DictMap, context: PDFContext) =>
    new PDFCatalog(map, context);

  Pages(): PDFPageTree {
    return this.lookup(PDFName.of('Pages'), PDFDict) as PDFPageTree;
  }

  Outlines(): PDFOutlines {
    return this.lookup(PDFName.Outlines, PDFDict) as PDFOutlines;
  }

  /**
   * Inserts the given ref as a leaf node of this catalog's page tree at the
   * specified index (zero-based). Also increments the `Count` of each node in
   * the page tree hierarchy to accomodate the new page.
   *
   * Returns the ref of the PDFPageTree node into which `leafRef` was inserted.
   */
  insertLeafNode(leafRef: PDFRef, index: number): PDFRef {
    const pagesRef = this.get(PDFName.of('Pages')) as PDFRef;
    const maybeParentRef = this.Pages().insertLeafNode(leafRef, index);
    return maybeParentRef || pagesRef;
  }

  removeLeafNode(index: number): void {
    this.Pages().removeLeafNode(index);
  }

  /**
   * Inserts the given ref as a top-level outline of this catalog's outlines at the
   * specified index (zero-based). The `Count` will be recalculated before
   * save.
   *
   * Returns the ref of the PDFOutline into which `outlineRef` was inserted.
   */
  insertOutlineItem(outlineRef: PDFRef, index: number): PDFRef {
    const outlinesRef = this.get(PDFName.Outlines) as PDFRef;
    this.Outlines().insertOutlineItem(outlinesRef, outlineRef, index);
    return outlinesRef;
  }
}

export default PDFCatalog;
