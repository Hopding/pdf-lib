import PDFArray from 'src/core/objects/PDFArray';
import PDFBool from 'src/core/objects/PDFBool';
import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFContext from 'src/core/PDFContext';
import { assertEachIs, assertIsOneOf, assertRange } from 'src/utils';

type NonFullScreenPageModeValue = 'UseNone' | 'UseOutlines' | 'UseThumbs' | 'UseOC';
type DirectionValue = 'L2R' | 'R2L';
type PrintScalingValue = 'None' | 'AppDefault';
type DuplexValue = 'Simplex' | 'DuplexFlipShortEdge' | 'DuplexFlipLongEdge';
type BoolViewerPrefKey = 'HideToolbar' | 'HideMenubar' | 'HideWindowUI'| 'FitWindow' |
                        'CenterWindow' | 'DisplayDocTitle'| 'PickTrayByPDFSize';
type NameViewerPrefKey = 'NonFullScreenPageMode' | 'Direction' | 'PrintScaling' | 'Duplex';
type ArrayViewerPrefKey = 'PrintPageRange';
type NumberViewerPrefKey = 'NumCopies';

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

  protected FindBool(key: BoolViewerPrefKey): PDFBool | undefined {
    const returnObj = this.dict.lookup(PDFName.of(key));
    if (returnObj instanceof PDFBool) return returnObj;
    return undefined;
  }

  protected FindNameVal(key: NameViewerPrefKey): PDFName | undefined {
    const returnObj = this.dict.lookup(PDFName.of(key));
    if (returnObj instanceof PDFName) return returnObj;
    return undefined;
  }

  protected FindArray(key: ArrayViewerPrefKey): PDFArray | undefined {
    const returnObj = this.dict.lookup(PDFName.of(key));
    if (returnObj instanceof PDFArray) return returnObj;
    return undefined;
  }

  protected FindNumber(key: NumberViewerPrefKey): PDFNumber | undefined {
    const returnObj = this.dict.lookup(PDFName.of(key));
    if (returnObj instanceof PDFNumber) return returnObj;
    return undefined;
  }

  /*
  * A flag specifying whether to hide the conforming reader’s tool bars when the document is active.
  * Default value: false.
  */
  getHideToolbar(): boolean {
    return this.FindBool('HideToolbar')?.asBoolean() ?? false;
  }

  /*
  * A flag specifying whether to hide the conforming reader’s menu bar when the document is active.
  * Default value: false.
  */
  getHideMenubar(): boolean {
    return this.FindBool('HideMenubar')?.asBoolean() ?? false;
  }

  /*
  * A flag specifying whether to hide user interface elements in the document’s window (such as scroll bars and navigation controls), leaving only the document’s contents displayed.
  * Default value: false.
  */
  getHideWindowUI(): boolean {
    return this.FindBool('HideWindowUI')?.asBoolean() ?? false;
  }

  /*
  * A flag specifying whether to resize the document’s window to fit the size of the first displayed page.
  * Default value: false
  */
  getFitWindow(): boolean {
    return this.FindBool('FitWindow')?.asBoolean() ?? false;
  }

  /*
  * A flag specifying whether to position the document’s window in the center of the screen.
  * Default value: false. 
  */
  getCenterWindow(): boolean {
    return this.FindBool('CenterWindow')?.asBoolean() ?? false;
  }

  /*
  * A flag specifying whether the window’s title bar should display the document title taken from the Title entry of the document information dictionary.
  * If false, the title bar should instead display the name of the PDF file containing the document.
  * Default value: false.
  */
  getDisplayDocTitle(): boolean {
    return this.FindBool('DisplayDocTitle')?.asBoolean() ?? false;
  }

  /*
  * The document’s page mode, specifying how to display the document on exiting full-screen mode:
  * UseNone - Neither document outline nor thumbnail images visible
  * UseOutlines - Document outline visible
  * UseThumbs - Thumbnail images visible
  * UseOC - Optional content group panel visible
  *
  * This entry is meaningful only if the value of the PageMode entry in the Catalog dictionary is FullScreen; it shall be ignored otherwise.
  * Default value: UseNone. 
  */
  getNonFullScreenPageMode(): NonFullScreenPageModeValue {
    return this.FindNameVal('NonFullScreenPageMode')?.asString() as NonFullScreenPageModeValue ?? 'UseNone';
  }

  /*
  * The predominant reading order for text:
  * L2R - Left to right
  * R2L - Right to left (including vertical writing systems,  such as Chinese, Japanese, and Korean)
  *
  * This entry has no direct effect on the document’s contents or page numbering but may be used to determine the relative positioning of pages when displayed side by side or printed n-up.
  * Default value: L2R. 
  */
  getDirection(): DirectionValue {
    return this.FindNameVal('Direction')?.asString() as DirectionValue ?? 'L2R';
  }

  /*
  * The page scaling option that shall be selected when a print dialog is displayed for this document. 
  * Valid values are
  * None - which indicates no page scaling
  * AppDefault - which indicates the conforming reader’s default print scaling.
  * 
  * If this entry has an unrecognized value,  AppDefault shall be used.
  * Default value: AppDefault.
  * If the print dialog is suppressed and its parameters are provided from some other source, this entry nevertheless shall be honored.
  */
  getPrintScaling() : PrintScalingValue {
    return this.FindNameVal('PrintScaling')?.asString() as PrintScalingValue ?? 'AppDefault';
  }

  /*
  * The paper handling option that shall be used when printing the file from the print dialog. 
  * The following values are valid:
  * Simplex - Print single-sided
  * DuplexFlipShortEdge - Duplex and flip on the short edge of the sheet
  * DuplexFlipLongEdge - Duplex and flip on the long edge of the sheet
  * 
  * Default value: none
  */
  getDuplex() : DuplexValue | undefined {
    return this.FindNameVal('Duplex')?.asString() as DuplexValue;
  }

  /*
  * A flag specifying whether the PDF page size shall be used to select the input paper tray.
  * This setting influences only the preset values used to populate the print dialog presented by a conforming reader.
  * If PickTrayByPDFSize is true, the check box in the print dialog associated with input paper tray shall bechecked.
  * This setting has no effect onoperating systems that do not provide the ability to pick the input tray by size.
  * 
  * Default value: as defined by the conforming reader
  */
  getPickTrayByPDFSize(): boolean | undefined {
    return this.FindBool('PickTrayByPDFSize')?.asBoolean();
  }

  /*
  * The page numbers used to initialize the print dialog box when the file is printed.
  * The array shall contain an even number of integers to be interpreted in pairs, with each pair specifying the first and last pages in a sub-range of pages to be printed.
  * The first page of the PDF file shall be denoted by 1.
  * 
  * Default value: as defined by the conforming reader
  */
  getPrintPageRange(): number[] {
    return this.FindArray('PrintPageRange')?.asArray()?.map(o => (o as PDFNumber).asNumber()) ?? [];
  }

  /*
  * The number of copies that shall be printed when the print dialog is opened for this file.
  * Values outside this range shall be ignored.
  * 
  * Default value: as defined by the conforming reader, but typically 1
  */
  getNumCopies(): number {
    return this.FindNumber('NumCopies')?.asNumber() ?? 1;
  }

  setHideToolbar(hideToolbar: boolean) {
    const HideToolbar = this.dict.context.obj(hideToolbar);
    this.dict.set(PDFName.of('HideToolbar'), HideToolbar);
  }

  setHideMenubar(hideMenubar: boolean) {
    const HideMenubar = this.dict.context.obj(hideMenubar);
    this.dict.set(PDFName.of('HideMenubar'), HideMenubar);
  }

  setHideWindowUI(hideWindowUI: boolean) {
    const HideWindowUI = this.dict.context.obj(hideWindowUI);
    this.dict.set(PDFName.of('HideWindowUI'), HideWindowUI);
  }

  setFitWindow(fitWindow: boolean) {
    const FitWindow = this.dict.context.obj(fitWindow);
    this.dict.set(PDFName.of('FitWindow'), FitWindow);
  }

  setCenterWindow(centerWindow: boolean) {
    const CenterWindow = this.dict.context.obj(centerWindow);
    this.dict.set(PDFName.of('CenterWindow'), CenterWindow);
  }

  setDisplayDocTitle(displayTitle: boolean) {
    const DisplayDocTitle = this.dict.context.obj(displayTitle);
    this.dict.set(PDFName.of('DisplayDocTitle'), DisplayDocTitle);
  }

  setNonFullScreenPageMode(nonFullScreenPageMode: NonFullScreenPageModeValue) {
    assertIsOneOf(nonFullScreenPageMode, 'nonFullScreenPageMode', ['UseNone', 'UseOutlines', 'UseThumbs', 'UseOC'] as NonFullScreenPageModeValue[]);
    const NonFullScreenPageMode = PDFName.of(nonFullScreenPageMode);
    this.dict.set(PDFName.of('NonFullScreenPageMode'), NonFullScreenPageMode);
  }

  setDirection(direction: DirectionValue) {
    assertIsOneOf(direction, 'direction', ['L2R', 'R2L'] as DirectionValue[]);
    const Direction = PDFName.of(direction);
    this.dict.set(PDFName.of('Direction'), Direction);
  }

  setPrintScaling(printScaling: PrintScalingValue) {
    assertIsOneOf(printScaling, 'printScaling', ['None', 'AppDefault'] as PrintScalingValue[]);
    const PrintScaling = PDFName.of(printScaling);
    this.dict.set(PDFName.of('PrintScaling'), PrintScaling);
  }

  setDuplex(duplex: DuplexValue) {
    assertIsOneOf(duplex, 'duplex', ['Simplex', 'DuplexFlipShortEdge', 'DuplexFlipLongEdge'] as DuplexValue[]);
    const Duplex = PDFName.of(duplex);
    this.dict.set(PDFName.of('Duplex'), Duplex);
  }

  setPickTrayByPDFSize(pickTrayByPDFSize: boolean) {
    const PickTrayByPDFSize = this.dict.context.obj(pickTrayByPDFSize);
    this.dict.set(PDFName.of('PickTrayByPDFSize'), PickTrayByPDFSize);
  }

  setPrintPageRange(printPageRange: number[]) {
    assertEachIs(printPageRange, 'printPageRange', ['number']);
    if (printPageRange.length % 2 !== 0) throw new Error('printPageRange must be in pairs - therefore array length must be even')
    const PrintPageRange = this.dict.context.obj(printPageRange.map(pr => this.dict.context.obj(pr)));
    this.dict.set(PDFName.of('PrintPageRange'), PrintPageRange);
  }

  setNumCopies(numCopies: number) {
    assertRange(numCopies, 'numCopies', 1, Number.MAX_VALUE);
    // if (!Number.isInteger(numCopies)) but lib must target es2015
    if (numCopies % 1 !== 0) throw new Error('numCopies must be an integer')
    const NumCopies = this.dict.context.obj(numCopies);
    this.dict.set(PDFName.of('NumCopies'), NumCopies);
  }
}

export default ViewerPreferences;
