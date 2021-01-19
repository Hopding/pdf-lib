import PDFArray from 'src/core/objects/PDFArray';
import PDFBool from 'src/core/objects/PDFBool';
import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFContext from 'src/core/PDFContext';
import { assertEachIs, assertIsOneOf, assertRange } from 'src/utils';

const asEnum = <T extends string | number, U extends { [key: string]: T }>(
  rawValue: T | undefined,
  enumType: U,
): U[keyof U] | undefined => {
  if (rawValue === undefined) return undefined;
  return enumType[rawValue];
};

export enum NonFullScreenPageMode {
  UseNone = 'UseNone',
  UseOutlines = 'UseOutlines',
  UseThumbs = 'UseThumbs',
  UseOC = 'UseOC',
}

export enum Direction {
  L2R = 'L2R',
  R2L = 'R2L',
}

export enum PrintScaling {
  None = 'None',
  AppDefault = 'AppDefault',
}

export enum Duplex {
  Simplex = 'Simplex',
  DuplexFlipShortEdge = 'DuplexFlipShortEdge',
  DuplexFlipLongEdge = 'DuplexFlipLongEdge',
}

type BoolViewerPrefKey =
  | 'HideToolbar'
  | 'HideMenubar'
  | 'HideWindowUI'
  | 'FitWindow'
  | 'CenterWindow'
  | 'DisplayDocTitle'
  | 'PickTrayByPDFSize';
type NameViewerPrefKey =
  | 'NonFullScreenPageMode'
  | 'Direction'
  | 'PrintScaling'
  | 'Duplex';

interface PageRange {
  start: number;
  end: number;
}

class ViewerPreferences {
  readonly dict: PDFDict;

  static fromDict = (dict: PDFDict): ViewerPreferences =>
    new ViewerPreferences(dict);

  static create = (context: PDFContext) => {
    const dict = context.obj({});
    return new ViewerPreferences(dict);
  };

  protected constructor(dict: PDFDict) {
    this.dict = dict;
  }

  protected lookupBool(key: BoolViewerPrefKey): PDFBool | undefined {
    const returnObj = this.dict.lookup(PDFName.of(key));
    if (returnObj instanceof PDFBool) return returnObj;
    return undefined;
  }

  protected lookupNameVal(key: NameViewerPrefKey): PDFName | undefined {
    const returnObj = this.dict.lookup(PDFName.of(key));
    if (returnObj instanceof PDFName) return returnObj;
    return undefined;
  }

  HideToolbar(): PDFBool | undefined {
    return this.lookupBool('HideToolbar');
  }

  HideMenubar(): PDFBool | undefined {
    return this.lookupBool('HideMenubar');
  }

  HideWindowUI(): PDFBool | undefined {
    return this.lookupBool('HideWindowUI');
  }

  FitWindow(): PDFBool | undefined {
    return this.lookupBool('FitWindow');
  }

  CenterWindow(): PDFBool | undefined {
    return this.lookupBool('CenterWindow');
  }

  DisplayDocTitle(): PDFBool | undefined {
    return this.lookupBool('DisplayDocTitle');
  }

  NonFullScreenPageMode(): PDFName | undefined {
    return this.lookupNameVal('NonFullScreenPageMode');
  }

  Direction(): PDFName | undefined {
    return this.lookupNameVal('Direction');
  }

  PrintScaling(): PDFName | undefined {
    return this.lookupNameVal('PrintScaling');
  }

  Duplex(): PDFName | undefined {
    return this.lookupNameVal('Duplex');
  }

  PickTrayByPDFSize(): PDFBool | undefined {
    return this.lookupBool('PickTrayByPDFSize');
  }

  PrintPageRange(): PDFArray | undefined {
    const PrintPageRange = this.dict.lookup(PDFName.of('PrintPageRange'));
    if (PrintPageRange instanceof PDFArray) return PrintPageRange;
    return undefined;
  }

  NumCopies(): PDFNumber | undefined {
    const NumCopies = this.dict.lookup(PDFName.of('NumCopies'));
    if (NumCopies instanceof PDFNumber) return NumCopies;
    return undefined;
  }

  /**
   * Returns `true` if PDF readers should hide the toolbar menus when displaying
   * this document.
   * @returns Whether or not toolbars should be hidden.
   */
  getHideToolbar(): boolean {
    return this.HideToolbar()?.asBoolean() ?? false;
  }

  /**
   * Returns `true` if PDF readers should hide the menu bar when displaying this
   * document.
   * @returns Whether or not the menu bar should be hidden.
   */
  getHideMenubar(): boolean {
    return this.HideMenubar()?.asBoolean() ?? false;
  }

  /**
   * Returns `true` if PDF readers should hide the user interface elements in
   * the document’s window (such as scroll bars and navigation controls),
   * leaving only the document’s contents displayed.
   * @returns Whether or not user interface elements should be hidden.
   */
  getHideWindowUI(): boolean {
    return this.HideWindowUI()?.asBoolean() ?? false;
  }

  /**
   * Returns `true` if PDF readers should resize the document’s window to fit
   * the size of the first displayed page.
   * @returns Whether or not the window should be resized to fit.
   */
  getFitWindow(): boolean {
    return this.FitWindow()?.asBoolean() ?? false;
  }

  /**
   * Returns `true` if PDF readers should position the document’s window in the
   * center of the screen.
   * @returns Whether or not to center the document window.
   */
  getCenterWindow(): boolean {
    return this.CenterWindow()?.asBoolean() ?? false;
  }

  /**
   * Returns `true` if the window's title bar should display the document
   * `Title`, taken from the document metadata (see [[PDFDocument.getTitle]]).
   * Returns `false` if the title bar should instead display the filename of the
   * PDF file.
   * @returns Whether to display the document title.
   */
  getDisplayDocTitle(): boolean {
    return this.DisplayDocTitle()?.asBoolean() ?? false;
  }

  /**
   * Returns the page mode, which tells the PDF reader how to display the
   * document after exiting full-screen mode.
   * @returns The page mode after exiting full-screen mode, being one of:
   *          `UseNone` - Neither document outline nor thumbnail images visible.
   *          `UseOutlines` - Document outline visible.
   *          `UseThumbs` - Thumbnail images visible.
   *          `UseOC` - Optional content group panel visible.
   */
  getNonFullScreenPageMode(): NonFullScreenPageMode {
    const mode = this.NonFullScreenPageMode()?.decodeText();
    return asEnum(mode, NonFullScreenPageMode) ?? NonFullScreenPageMode.UseNone;
  }

  /**
   * Returns the predominant reading order for text.
   * @returns The text reading order, being one of:
   *          `L2R` - Left to right.
   *          `R2L` - Right to left (including vertical writing systems, such as
   *                  Chinese, Japanese and Korean).
   */
  getDirection(): Direction {
    const direction = this.Direction()?.decodeText();
    return asEnum(direction, Direction) ?? Direction.L2R;
  }

  /**
   * Returns the page scaling option that the PDF reader should select when the
   * print dialog is displayed.
   * @returns The page scaling option, being one of:
   *          `None` - no page scaling.
   *          `AppDefault` - Use the PDF reader’s default print scaling.
   */
  getPrintScaling(): PrintScaling {
    const scaling = this.PrintScaling()?.decodeText();
    return asEnum(scaling, PrintScaling) ?? PrintScaling.AppDefault;
  }

  /**
   * Returns the paper handling option that should be used when printing the
   * file from the print dialog.
   * @returns The paper handling option, being one of:
   *          `Simplex` - The PDF reader should print single-sided.
   *          `DuplexFlipShortEdge` - The PDF reader should print double sided
   *                                  and flip on the short edge of the sheet.
   *          `DuplexFlipLongEdge` - The PDF reader should print double sided
   *                                 and flip on the long edge of the sheet.
   */
  getDuplex(): Duplex | undefined {
    const duplex = this.Duplex()?.decodeText();
    return asEnum(duplex, Duplex);
  }

  /**
   * Returns `true` if the PDF page size should be used to select the input
   * paper tray.
   * @returns Whether or not the PDF page size should be used to select the
   *          input paper tray.
   */
  getPickTrayByPDFSize(): boolean | undefined {
    return this.PickTrayByPDFSize()?.asBoolean();
  }

  /**
   * Returns an array of page number ranges, which are the values used to
   * initialize the print dialog box when the file is printed. Each range
   * specifyies the first (`start`) and last (`end`) pages in a sub-range of
   * pages to be printed. The first page of the PDF file is denoted by 1. For
   * example:
   * ```js
   * const viewerPrefs = pdfDoc.catalog.getOrCreateViewerPreferences();
   * if (viewerPrefs.getPrintRanges().some(pr => pr.start =< 3 && pr.end >= 3))
   *    console.log('printRange includes page 3')
   * ```
   * @returns An array of objects, each with the properties `start` and `end`,
   *          denoting page numbers. If not, specified an empty array is
   *          returned.
   */
  getPrintPageRange(): PageRange[] {
    const rng = this.PrintPageRange();
    const pageRanges: PageRange[] = [];
    if (rng) {
      for (let i = 0; i < rng.size(); i += 2) {
        pageRanges.push({
          start: (rng.get(i) as PDFNumber).asNumber() + 1,
          end: (rng.get(i + 1) as PDFNumber).asNumber() + 1,
        });
      }
    }
    return pageRanges;
  }

  /**
   * Returns the number of copies to be printed when the print dialog is opened
   * for this document.
   * @returns The default number of copies to be printed.
   */
  getNumCopies(): number {
    return this.NumCopies()?.asNumber() ?? 1;
  }

  /**
   * Choose whether the PDF reader’s toolbars should be hidden while the
   * document is active.
   * @param hideToolbar `true` if the toolbar should be hidden.
   */
  setHideToolbar(hideToolbar: boolean) {
    const HideToolbar = this.dict.context.obj(hideToolbar);
    this.dict.set(PDFName.of('HideToolbar'), HideToolbar);
  }

  /**
   * Choose whether the PDF reader’s menu bar should be hidden while the
   * document is active.
   * @param hideMenubar `true` if the menu bar should be hidden.
   */
  setHideMenubar(hideMenubar: boolean) {
    const HideMenubar = this.dict.context.obj(hideMenubar);
    this.dict.set(PDFName.of('HideMenubar'), HideMenubar);
  }

  /**
   * Choose whether the PDF reader should hide user interface elements in the
   * document’s window (such as scroll bars and navigation controls), leaving
   * only the document’s contents displayed.
   * @param hideWindowUI `true` if the user interface elements should be hidden.
   */
  setHideWindowUI(hideWindowUI: boolean) {
    const HideWindowUI = this.dict.context.obj(hideWindowUI);
    this.dict.set(PDFName.of('HideWindowUI'), HideWindowUI);
  }

  /**
   * Choose whether the PDF reader should resize the document’s window to fit
   * the size of the first displayed page.
   * @param fitWindow `true` if the window should be resized.
   */
  setFitWindow(fitWindow: boolean) {
    const FitWindow = this.dict.context.obj(fitWindow);
    this.dict.set(PDFName.of('FitWindow'), FitWindow);
  }

  /**
   * Choose whether the PDF reader should position the document’s window in the
   * center of the screen.
   * @param centerWindow `true` if the window should be centered.
   */
  setCenterWindow(centerWindow: boolean) {
    const CenterWindow = this.dict.context.obj(centerWindow);
    this.dict.set(PDFName.of('CenterWindow'), CenterWindow);
  }

  /**
   * Choose whether the window’s title bar should display the document `Title`
   * taken from the document metadata (see [[PDFDocument.setTitle]]). If
   * `false`, the title bar should instead display the PDF filename.
   * @param displayTitle `true` if the document title should be displayed.
   */
  setDisplayDocTitle(displayTitle: boolean) {
    const DisplayDocTitle = this.dict.context.obj(displayTitle);
    this.dict.set(PDFName.of('DisplayDocTitle'), DisplayDocTitle);
  }

  /**
   * Choose how the PDF reader should display the document on exiting
   * full-screen mode. This entry is meaningful only if the value of the
   * PageMode entry in the document's Catalog dictionary is FullScreen.
   * The `NonFullScreenPageMode` option has the possible values:
   * - `UseNone` - Neither document outline nor thumbnail images visible.
   * - `UseOutlines` - Document outline visible.
   * - `UseThumbs` - Thumbnail images visible.
   * - `UseOC` - Optional content group panel visible.
   * For example:
   * ```js
   * import { PDFDocument, NonFullScreenPageMode } from 'pdf-lib'
   * const pdfDoc = await PDFDocument.create()
   * // set the PageMode
   * pdfDoc.catalog.set(PDFName.of('PageMode'),PDFName.of('FullScreen'))
   * // set what happens when fullScreen is closed
   * const viewerPrefs = pdfDoc.catalog.getOrCreateViewerPreferences()
   * viewerPrefs.setNonFullScreenPageMode(NonFullScreenPageMode.UseOutlines)
   * ```
   * @param nonFullScreenPageMode How the document should be displayed on
   *                              exiting full screen mode
   */
  setNonFullScreenPageMode(nonFullScreenPageMode: NonFullScreenPageMode) {
    assertIsOneOf(
      nonFullScreenPageMode,
      'nonFullScreenPageMode',
      NonFullScreenPageMode,
    );
    const mode = PDFName.of(nonFullScreenPageMode);
    this.dict.set(PDFName.of('NonFullScreenPageMode'), mode);
  }

  /**
   * Choose the predominant reading order for text.
   * This entry has no direct effect on the document’s contents or page
   * numbering, but may be used to determine the relative positioning of pages
   * when displayed side by side or printed n-up.
   * The `Direction` option has the possible values:
   * - `L2R` - Left to right.
   * - `R2L` - Right to left (including vertical writing systems, such as
   * Chinese, Japanese, and Korean).
   * For example:
   * ```js
   * import { PDFDocument, Direction } from 'pdf-lib'
   * const pdfDoc = await PDFDocument.create()
   * const viewerPrefs = pdfDoc.catalog.getOrCreateViewerPreferences()
   * viewerPrefs.setDirection(Direction.R2L)
   * ```
   * @param direction The reading order for text
   */
  setDirection(direction: Direction) {
    assertIsOneOf(direction, 'direction', Direction);
    const dir = PDFName.of(direction);
    this.dict.set(PDFName.of('Direction'), dir);
  }

  /**
   * Choose the page scaling option that should be selected when a print dialog
   * is displayed for this document.
   * The `PrintScaling` option has the possible values:
   * - `None` - No page scaling
   * - `AppDefault` - The PDF reader’s default print scaling.
   * * For example:
   * ```js
   * import { PDFDocument, PrintScaling } from 'pdf-lib'
   * const pdfDoc = await PDFDocument.create()
   * const viewerPrefs = pdfDoc.catalog.getOrCreateViewerPreferences()
   * viewerPrefs.setPrintScaling(PrintScaling.None)
   * ```
   * @param printScaling The print scaling option.
   */
  setPrintScaling(printScaling: PrintScaling) {
    assertIsOneOf(printScaling, 'printScaling', PrintScaling);
    const scaling = PDFName.of(printScaling);
    this.dict.set(PDFName.of('PrintScaling'), scaling);
  }

  /**
   * Choose the paper handling option which should be the default displayed in
   * the print dialog.
   * The `Duplex` option has the possible values:
   * - `Simplex` - Print single-sided
   * - `DuplexFlipShortEdge` - Duplex and flip on the short edge of the sheet
   * - `DuplexFlipLongEdge` - Duplex and flip on the long edge of the sheet
   * For example:
   * ```js
   * import { PDFDocument, Duplex } from 'pdf-lib'
   * const pdfDoc = await PDFDocument.create()
   * const viewerPrefs = pdfDoc.catalog.getOrCreateViewerPreferences()
   * viewerPrefs.setDuplex(Duplex.DuplexFlipShortEdge)
   * @param duplex The double or single sided printing option.
   */
  setDuplex(duplex: Duplex) {
    assertIsOneOf(duplex, 'duplex', Duplex);
    const dup = PDFName.of(duplex);
    this.dict.set(PDFName.of('Duplex'), dup);
  }

  /**
   * Choose whether the PDF document's page size should be used to select the
   * input paper tray when printing. This setting influences only the preset
   * values used to populate the print dialog presented by a PDF reader.
   * If PickTrayByPDFSize is true, the check box in the print dialog associated
   * with input paper tray should be checked. This setting has no effect on
   * operating systems that do not provide the ability to pick the input tray by
   * size.
   * @param pickTrayByPDFSize `true` if the document's page size should be used
   *                          to select the input paper tray.
   */
  setPickTrayByPDFSize(pickTrayByPDFSize: boolean) {
    const PickTrayByPDFSize = this.dict.context.obj(pickTrayByPDFSize);
    this.dict.set(PDFName.of('PickTrayByPDFSize'), PickTrayByPDFSize);
  }

  /**
   * Choose the page numbers used to initialize the print dialog box when the
   * file is printed. The first page of the PDF file is denoted by 1.
   * For example:
   * ```js
   * import { PDFDocument, PrintScaling } from 'pdf-lib'
   * const pdfDoc = await PDFDocument.create()
   * const viewerPrefs = pdfDoc.catalog.getOrCreateViewerPreferences()
   * // to set the default to print only the first page
   * viewerPrefs.setPrintPageRange({ start: 1, end: 1 })
   * // or alternatively if discontinuous ranges of pages should be the default,
   * // for example page 1, page 3 and pages 5-7, provide an array:
   * viewerPrefs.setPrintPageRange([
   *   { start: 1, end: 1 },
   *   { start: 3, end: 3 },
   *   { start: 5, end: 7 },
   * ])
   * ```
   * @param printPageRange An object or array of objects, each with the
   *                       properties `start` and `end`, denoting a range of
   *                       page numbers
   */
  setPrintPageRange(printPageRange: PageRange[] | PageRange) {
    if (!Array.isArray(printPageRange)) printPageRange = [printPageRange];
    let flatRange = printPageRange.reduce(
      (accum, pgRng) => accum.concat(pgRng.start, pgRng.end),
      [] as number[],
    );
    assertEachIs(flatRange, 'printPageRange', ['number']);
    flatRange = flatRange.map((r) => r - 1);
    const pageRanges = this.dict.context.obj(flatRange);
    this.dict.set(PDFName.of('PrintPageRange'), pageRanges);
  }

  /**
   * Choose the default number of copies to be printed when the print dialog is
   * opened for this file.
   * @param numCopies The default number of copies.
   */
  setNumCopies(numCopies: number) {
    assertRange(numCopies, 'numCopies', 1, Number.MAX_VALUE);
    if (!Number.isInteger(numCopies)) {
      throw new Error('numCopies must be an integer');
    }
    const NumCopies = this.dict.context.obj(numCopies);
    this.dict.set(PDFName.of('NumCopies'), NumCopies);
  }
}

export default ViewerPreferences;
