import PDFDict, { DictMap } from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFRef from 'src/core/objects/PDFRef';
import PDFContext from 'src/core/PDFContext';
import PDFPageTree from 'src/core/structures/PDFPageTree';
import { PDFAcroForm } from 'src/core/acroform';
import ViewerPreferences from '../interactive/ViewerPreferences';

class PDFCatalog extends PDFDict {
  static withContextAndPages = (
    context: PDFContext,
    pages: PDFPageTree | PDFRef,
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

  AcroForm(): PDFDict | undefined {
    return this.lookupMaybe(PDFName.of('AcroForm'), PDFDict);
  }

  getAcroForm(): PDFAcroForm | undefined {
    const dict = this.AcroForm();
    if (!dict) return undefined;
    return PDFAcroForm.fromDict(dict);
  }

  getOrCreateAcroForm(): PDFAcroForm {
    let acroForm = this.getAcroForm();
    if (!acroForm) {
      acroForm = PDFAcroForm.create(this.context);
      const acroFormRef = this.context.register(acroForm.dict);
      this.set(PDFName.of('AcroForm'), acroFormRef);
    }
    return acroForm;
  }

  ViewerPreferences(): PDFDict | undefined {
    return this.lookupMaybe(PDFName.of('ViewerPreferences'), PDFDict);
  }

  getViewerPreferences(): ViewerPreferences | undefined {
    const dict = this.ViewerPreferences();
    if (!dict) return undefined;
    return ViewerPreferences.fromDict(dict);
  }

  getOrCreateViewerPreferences(): ViewerPreferences {
    let viewerPrefs = this.getViewerPreferences();
    if (!viewerPrefs) {
      viewerPrefs = ViewerPreferences.create(this.context);
      const viewerPrefsRef = this.context.register(viewerPrefs.dict);
      this.set(PDFName.of('ViewerPreferences'), viewerPrefsRef);
    }
    return viewerPrefs;
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
}

export default PDFCatalog;
