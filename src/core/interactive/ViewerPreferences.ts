import PDFArray from 'src/core/objects/PDFArray';
import PDFBool from 'src/core/objects/PDFBool';
import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFString from 'src/core/objects/PDFString';
import PDFContext from 'src/core/PDFContext';
import { assertEachIs, assertIsOneOf, assertRange } from 'src/utils';
import PDFHexString from '../objects/PDFHexString';

type NonFullScreenPageModeValue = 'UseNone' | 'UseOutlines' | 'UseThumbs' | 'UseOC';
type DirectionValue = 'L2R' | 'R2L';
type PrintScalingValue = 'None' | 'AppDefault';
type DuplexValue = 'Simplex' | 'DuplexFlipShortEdge' | 'DuplexFlipLongEdge';

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

  /*
  * A flag specifying whether to hide the conforming reader’s tool bars when the document is active. Default value: false.
  */
  HideToolbar(): PDFBool | undefined {
    const HideToolbar = this.dict.lookup(PDFName.of('HideToolbar'));
    if (HideToolbar instanceof PDFBool) return HideToolbar;
    return undefined;
  }

  /*
  * A flag specifying whether to hide the conforming reader’s menu bar when the document is active. Default value: false.
  */
  HideMenubar(): PDFBool | undefined {
    const HideMenubar = this.dict.lookup(PDFName.of('HideMenubar'));
    if (HideMenubar instanceof PDFBool) return HideMenubar;
    return undefined;
  }

  /*
  * A flag specifying whether to hide user interface elements in the document’s window (such as scroll bars and navigation controls), leaving only the document’s contents displayed.
  * Default value: false.
  */
  HideWindowUI(): PDFBool | undefined {
    const HideWindowUI = this.dict.lookup(PDFName.of('HideWindowUI'));
    if (HideWindowUI instanceof PDFBool) return HideWindowUI;
    return undefined;
  }

  /*
  * A flag specifying whether to resize the document’s window to fit the size of the first displayed page.
  * Default value: false
  */
  FitWindow(): PDFBool | undefined {
    const FitWindow = this.dict.lookup(PDFName.of('FitWindow'));
    if (FitWindow instanceof PDFBool) return FitWindow;
    return undefined;
  }

  /*
  * A flag specifying whether to position the document’s window in the center of the screen.
  * Default value: false. 
  */
  CenterWindow(): PDFBool | undefined {
    const CenterWindow = this.dict.lookup(PDFName.of('CenterWindow'));
    if (CenterWindow instanceof PDFBool) return CenterWindow;
    return undefined;
  }

  /*
  * A flag specifying whether the window’s title bar should display the document title taken from the Title entry of the document information dictionary.
  * If false, the title bar should instead display the name of the PDF file containing the document.
  * Default value: false.
  */
  DisplayDocTitle(): PDFBool | undefined {
    const DisplayDocTitle = this.dict.lookup(PDFName.of('DisplayDocTitle'));
    if (DisplayDocTitle instanceof PDFBool) return DisplayDocTitle;
    return undefined;
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
  NonFullScreenPageMode(): PDFString | PDFHexString | undefined {
    const NonFullScreenPageMode = this.dict.lookup(PDFName.of('NonFullScreenPageMode'));
    if (NonFullScreenPageMode instanceof PDFString || NonFullScreenPageMode instanceof PDFHexString) return NonFullScreenPageMode;
    return undefined;
  }

  /*
  * The predominant reading order for text:
  * L2R - Left to right
  * R2L - Right to left (including vertical writing systems,  such as Chinese, Japanese, and Korean)
  *
  * This entry has no direct effect on the document’s contents or page numbering but may be used to determine the relative positioning of pages when displayed side by side or printed n-up.
  * Default value: L2R. 
  */
  Direction(): PDFString | PDFHexString | undefined {
    const Direction = this.dict.lookup(PDFName.of('Direction'));
    if (Direction instanceof PDFString || Direction instanceof PDFHexString) return Direction;
    return undefined;
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
  PrintScaling() : PDFString | PDFHexString | undefined {
    const PrintScaling = this.dict.lookup(PDFName.of('PrintScaling'));
    if (PrintScaling instanceof PDFString || PrintScaling instanceof PDFHexString) return PrintScaling;
    return undefined;
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
  Duplex() : PDFString | PDFHexString | undefined {
    const Duplex = this.dict.lookup(PDFName.of('Duplex'));
    if (Duplex instanceof PDFString || Duplex instanceof PDFHexString) return Duplex;
    return undefined;
  }
  
  /*
  * A flag specifying whether the PDF page size shall be used to select the input paper tray.
  * This setting influences only the preset values used to populate the print dialog presented by a conforming reader.
  * If PickTrayByPDFSize is true, the check box in the print dialog associated with input paper tray shall bechecked.
  * This setting has no effect onoperating systems that do not provide the ability to pick the input tray by size.
  * 
  * Default value: as defined by the conforming reader
  */
  PickTrayByPDFSize(): PDFBool | undefined {
    const PickTrayByPDFSize = this.dict.lookup(PDFName.of('PickTrayByPDFSize'));
    if (PickTrayByPDFSize instanceof PDFBool) return PickTrayByPDFSize;
    return undefined;
  }
  
  /*
  * The page numbers used to initialize the print dialog box when the file is printed.
  * The array shall contain an even number of integers to be interpreted in pairs, with each pair specifying the first and last pages in a sub-range of pages to be printed.
  * The first page of the PDF file shall be denoted by 1.
  * 
  * Default value: as defined by the conforming reader
  */
  PrintPageRange(): PDFArray | undefined {
    const PrintPageRange = this.dict.lookup(PDFName.of('PrintPageRange'));
    if (PrintPageRange instanceof PDFArray) return PrintPageRange;
    return undefined;
  }
  
  /*
  * The number of copies that shall be printed when the print dialog is opened for this file.
  * Values outside this range shall be ignored.
  * 
  * Default value: as defined by the conforming reader, but typically 1
  */
  NumCopies(): PDFNumber | undefined {
    const NumCopies = this.dict.lookup(PDFName.of('NumCopies'));
    if (NumCopies instanceof PDFNumber) return NumCopies;
    return undefined;
  }

  getHideToolbar(): boolean {
    return this.HideToolbar()?.asBoolean() ?? false;
  }

  getHideMenubar(): boolean {
    return this.HideMenubar()?.asBoolean() ?? false;
  }

  getHideWindowUI(): boolean {
    return this.HideWindowUI()?.asBoolean() ?? false;
  }

  getFitWindow(): boolean {
    return this.FitWindow()?.asBoolean() ?? false;
  }

  getCenterWindow(): boolean {
    return this.CenterWindow()?.asBoolean() ?? false;
  }

  getDisplayDocTitle(): boolean {
    return this.DisplayDocTitle()?.asBoolean() ?? false;
  }

  getNonFullScreenPageMode(): NonFullScreenPageModeValue {
    return this.NonFullScreenPageMode()?.asString() as NonFullScreenPageModeValue ?? 'UseNone';
  }

  getDirection(): DirectionValue {
    return this.Direction()?.asString() as DirectionValue ?? 'L2R';
  }

  getPrintScaling() : PrintScalingValue {
    return this.PrintScaling()?.asString() as PrintScalingValue ?? 'AppDefault';
  }

  getDuplex() : DuplexValue | undefined {
    return this.Duplex()?.asString() as DuplexValue;
  }

  getPickTrayByPDFSize(): boolean | undefined {
    return this.PickTrayByPDFSize()?.asBoolean();
  }

  getPrintPageRange(): number[] {
    return this.PrintPageRange()?.asArray()?.map(o => (o as PDFNumber).asNumber()) ?? [];
  }

  getNumCopies(): number {
    return this.NumCopies()?.asNumber() ?? 1;
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
    assertIsOneOf(nonFullScreenPageMode, 'nonFullScreenPageMode', ['UseNone', 'UseOutlines', 'UseThumbs', 'UseOC']);
    const NonFullScreenPageMode = PDFHexString.fromText(nonFullScreenPageMode);
    this.dict.set(PDFName.of('NonFullScreenPageMode'), NonFullScreenPageMode);
  }

  setDirection(direction: DirectionValue) {
    assertIsOneOf(direction, 'direction', ['L2R', 'R2L']);
    const Direction = PDFHexString.fromText(direction);
    this.dict.set(PDFName.of('Direction'), Direction);
  }

  setPrintScaling(printScaling: PrintScalingValue) {
    assertIsOneOf(printScaling, 'printScaling', ['None', 'AppDefault']);
    const PrintScaling = PDFHexString.fromText(printScaling);
    this.dict.set(PDFName.of('PrintScaling'), PrintScaling);
  }

  setDuplex(duplex: DuplexValue) {
    assertIsOneOf(duplex, 'duplex', ['Simplex', 'DuplexFlipShortEdge', 'DuplexFlipLongEdge']);
    const Duplex = PDFHexString.fromText(duplex);
    this.dict.set(PDFName.of('Duplex'), Duplex);
  }

  setPickTrayByPDFSize(pickTrayByPDFSize: boolean) {
    const PickTrayByPDFSize = this.dict.context.obj(pickTrayByPDFSize);
    this.dict.set(PDFName.of('PickTrayByPDFSize'), PickTrayByPDFSize);
  }

  setPrintPageRange(printPageRange: number[]) {
    assertEachIs(printPageRange, 'printPageRange', ['number']);
    if (printPageRange.length % 2 !== 0) throw new Error('printPageRange must be in pairs - that is length must be even')
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
