import PDFArray from "../objects/PDFArray";
import PDFBool from "../objects/PDFBool";
import PDFDict from "../objects/PDFDict";
import PDFName from "../objects/PDFName";
import PDFNumber from "../objects/PDFNumber";
import PDFContext from "../PDFContext";
export declare enum NonFullScreenPageMode {
    /**
     * After exiting FullScreen mode, neither the document outline nor thumbnail
     * images should be visible.
     */
    UseNone = "UseNone",
    /** After exiting FullScreen mode, the document outline should be visible. */
    UseOutlines = "UseOutlines",
    /** After exiting FullScreen mode, thumbnail images should be visible. */
    UseThumbs = "UseThumbs",
    /**
     * After exiting FullScreen mode, the optional content group panel should be
     * visible.
     */
    UseOC = "UseOC"
}
export declare enum ReadingDirection {
    /** The predominant reading order is Left to Right. */
    L2R = "L2R",
    /**
     * The predominant reading order is Right to left (including vertical writing
     * systems, such as Chinese, Japanese and Korean).
     */
    R2L = "R2L"
}
export declare enum PrintScaling {
    /** No page scaling. */
    None = "None",
    AppDefault = "AppDefault"
}
export declare enum Duplex {
    /** The PDF reader should print single-sided. */
    Simplex = "Simplex",
    /**
     * The PDF reader should print double sided and flip on the short edge of the
     * sheet.
     */
    DuplexFlipShortEdge = "DuplexFlipShortEdge",
    /**
     * The PDF reader should print double sided and flip on the long edge of the
     * sheet.
     */
    DuplexFlipLongEdge = "DuplexFlipLongEdge"
}
declare type BoolViewerPrefKey = 'HideToolbar' | 'HideMenubar' | 'HideWindowUI' | 'FitWindow' | 'CenterWindow' | 'DisplayDocTitle' | 'PickTrayByPDFSize';
declare type NameViewerPrefKey = 'NonFullScreenPageMode' | 'Direction' | 'PrintScaling' | 'Duplex';
interface PageRange {
    start: number;
    end: number;
}
declare class ViewerPreferences {
    /** @ignore */
    readonly dict: PDFDict;
    /** @ignore */
    static fromDict: (dict: PDFDict) => ViewerPreferences;
    /** @ignore */
    static create: (context: PDFContext) => ViewerPreferences;
    /** @ignore */
    protected constructor(dict: PDFDict);
    protected lookupBool(key: BoolViewerPrefKey): PDFBool | undefined;
    protected lookupName(key: NameViewerPrefKey): PDFName | undefined;
    /** @ignore */
    HideToolbar(): PDFBool | undefined;
    /** @ignore */
    HideMenubar(): PDFBool | undefined;
    /** @ignore */
    HideWindowUI(): PDFBool | undefined;
    /** @ignore */
    FitWindow(): PDFBool | undefined;
    /** @ignore */
    CenterWindow(): PDFBool | undefined;
    /** @ignore */
    DisplayDocTitle(): PDFBool | undefined;
    /** @ignore */
    NonFullScreenPageMode(): PDFName | undefined;
    /** @ignore */
    Direction(): PDFName | undefined;
    /** @ignore */
    PrintScaling(): PDFName | undefined;
    /** @ignore */
    Duplex(): PDFName | undefined;
    /** @ignore */
    PickTrayByPDFSize(): PDFBool | undefined;
    /** @ignore */
    PrintPageRange(): PDFArray | undefined;
    /** @ignore */
    NumCopies(): PDFNumber | undefined;
    /**
     * Returns `true` if PDF readers should hide the toolbar menus when displaying
     * this document.
     * @returns Whether or not toolbars should be hidden.
     */
    getHideToolbar(): boolean;
    /**
     * Returns `true` if PDF readers should hide the menu bar when displaying this
     * document.
     * @returns Whether or not the menu bar should be hidden.
     */
    getHideMenubar(): boolean;
    /**
     * Returns `true` if PDF readers should hide the user interface elements in
     * the document's window (such as scroll bars and navigation controls),
     * leaving only the document's contents displayed.
     * @returns Whether or not user interface elements should be hidden.
     */
    getHideWindowUI(): boolean;
    /**
     * Returns `true` if PDF readers should resize the document's window to fit
     * the size of the first displayed page.
     * @returns Whether or not the window should be resized to fit.
     */
    getFitWindow(): boolean;
    /**
     * Returns `true` if PDF readers should position the document's window in the
     * center of the screen.
     * @returns Whether or not to center the document window.
     */
    getCenterWindow(): boolean;
    /**
     * Returns `true` if the window's title bar should display the document
     * `Title`, taken from the document metadata (see [[PDFDocument.getTitle]]).
     * Returns `false` if the title bar should instead display the filename of the
     * PDF file.
     * @returns Whether to display the document title.
     */
    getDisplayDocTitle(): boolean;
    /**
     * Returns the page mode, which tells the PDF reader how to display the
     * document after exiting full-screen mode.
     * @returns The page mode after exiting full-screen mode.
     */
    getNonFullScreenPageMode(): NonFullScreenPageMode;
    /**
     * Returns the predominant reading order for text.
     * @returns The text reading order.
     */
    getReadingDirection(): ReadingDirection;
    /**
     * Returns the page scaling option that the PDF reader should select when the
     * print dialog is displayed.
     * @returns The page scaling option.
     */
    getPrintScaling(): PrintScaling;
    /**
     * Returns the paper handling option that should be used when printing the
     * file from the print dialog.
     * @returns The paper handling option.
     */
    getDuplex(): Duplex | undefined;
    /**
     * Returns `true` if the PDF page size should be used to select the input
     * paper tray.
     * @returns Whether or not the PDF page size should be used to select the
     *          input paper tray.
     */
    getPickTrayByPDFSize(): boolean | undefined;
    /**
     * Returns an array of page number ranges, which are the values used to
     * initialize the print dialog box when the file is printed. Each range
     * specifies the first (`start`) and last (`end`) pages in a sub-range of
     * pages to be printed. The first page of the PDF file is denoted by 0.
     * For example:
     * ```js
     * const viewerPrefs = pdfDoc.catalog.getOrCreateViewerPreferences()
     * const includesPage3 = viewerPrefs
     *   .getPrintRanges()
     *   .some(pr => pr.start =< 2 && pr.end >= 2)
     * if (includesPage3) console.log('printRange includes page 3')
     * ```
     * @returns An array of objects, each with the properties `start` and `end`,
     *          denoting page indices. If not, specified an empty array is
     *          returned.
     */
    getPrintPageRange(): PageRange[];
    /**
     * Returns the number of copies to be printed when the print dialog is opened
     * for this document.
     * @returns The default number of copies to be printed.
     */
    getNumCopies(): number;
    /**
     * Choose whether the PDF reader's toolbars should be hidden while the
     * document is active.
     * @param hideToolbar `true` if the toolbar should be hidden.
     */
    setHideToolbar(hideToolbar: boolean): void;
    /**
     * Choose whether the PDF reader's menu bar should be hidden while the
     * document is active.
     * @param hideMenubar `true` if the menu bar should be hidden.
     */
    setHideMenubar(hideMenubar: boolean): void;
    /**
     * Choose whether the PDF reader should hide user interface elements in the
     * document's window (such as scroll bars and navigation controls), leaving
     * only the document's contents displayed.
     * @param hideWindowUI `true` if the user interface elements should be hidden.
     */
    setHideWindowUI(hideWindowUI: boolean): void;
    /**
     * Choose whether the PDF reader should resize the document's window to fit
     * the size of the first displayed page.
     * @param fitWindow `true` if the window should be resized.
     */
    setFitWindow(fitWindow: boolean): void;
    /**
     * Choose whether the PDF reader should position the document's window in the
     * center of the screen.
     * @param centerWindow `true` if the window should be centered.
     */
    setCenterWindow(centerWindow: boolean): void;
    /**
     * Choose whether the window's title bar should display the document `Title`
     * taken from the document metadata (see [[PDFDocument.setTitle]]). If
     * `false`, the title bar should instead display the PDF filename.
     * @param displayTitle `true` if the document title should be displayed.
     */
    setDisplayDocTitle(displayTitle: boolean): void;
    /**
     * Choose how the PDF reader should display the document upon exiting
     * full-screen mode. This entry is meaningful only if the value of the
     * `PageMode` entry in the document's [[PDFCatalog]] is `FullScreen`.
     *
     * For example:
     * ```js
     * import { PDFDocument, NonFullScreenPageMode, PDFName } from 'pdf-lib'
     *
     * const pdfDoc = await PDFDocument.create()
     *
     * // Set the PageMode
     * pdfDoc.catalog.set(PDFName.of('PageMode'),PDFName.of('FullScreen'))
     *
     * // Set what happens when full-screen is closed
     * const viewerPrefs = pdfDoc.catalog.getOrCreateViewerPreferences()
     * viewerPrefs.setNonFullScreenPageMode(NonFullScreenPageMode.UseOutlines)
     * ```
     *
     * @param nonFullScreenPageMode How the document should be displayed upon
     *                              exiting full screen mode.
     */
    setNonFullScreenPageMode(nonFullScreenPageMode: NonFullScreenPageMode): void;
    /**
     * Choose the predominant reading order for text.
     *
     * This entry has no direct effect on the document's contents or page
     * numbering, but may be used to determine the relative positioning of pages
     * when displayed side by side or printed n-up.
     *
     * For example:
     * ```js
     * import { PDFDocument, ReadingDirection } from 'pdf-lib'
     *
     * const pdfDoc = await PDFDocument.create()
     * const viewerPrefs = pdfDoc.catalog.getOrCreateViewerPreferences()
     * viewerPrefs.setReadingDirection(ReadingDirection.R2L)
     * ```
     *
     * @param readingDirection The reading order for text.
     */
    setReadingDirection(readingDirection: ReadingDirection): void;
    /**
     * Choose the page scaling option that should be selected when a print dialog
     * is displayed for this document.
     *
     * For example:
     * ```js
     * import { PDFDocument, PrintScaling } from 'pdf-lib'
     *
     * const pdfDoc = await PDFDocument.create()
     * const viewerPrefs = pdfDoc.catalog.getOrCreateViewerPreferences()
     * viewerPrefs.setPrintScaling(PrintScaling.None)
     * ```
     *
     * @param printScaling The print scaling option.
     */
    setPrintScaling(printScaling: PrintScaling): void;
    /**
     * Choose the paper handling option that should be selected by default in the
     * print dialog.
     *
     * For example:
     * ```js
     * import { PDFDocument, Duplex } from 'pdf-lib'
     *
     * const pdfDoc = await PDFDocument.create()
     * const viewerPrefs = pdfDoc.catalog.getOrCreateViewerPreferences()
     * viewerPrefs.setDuplex(Duplex.DuplexFlipShortEdge)
     * ```
     *
     * @param duplex The double or single sided printing option.
     */
    setDuplex(duplex: Duplex): void;
    /**
     * Choose whether the PDF document's page size should be used to select the
     * input paper tray when printing. This setting influences only the preset
     * values used to populate the print dialog presented by a PDF reader.
     *
     * If PickTrayByPDFSize is true, the check box in the print dialog associated
     * with input paper tray should be checked. This setting has no effect on
     * operating systems that do not provide the ability to pick the input tray
     * by size.
     *
     * @param pickTrayByPDFSize `true` if the document's page size should be used
     *                          to select the input paper tray.
     */
    setPickTrayByPDFSize(pickTrayByPDFSize: boolean): void;
    /**
     * Choose the page numbers used to initialize the print dialog box when the
     * file is printed. The first page of the PDF file is denoted by 0.
     *
     * For example:
     * ```js
     * import { PDFDocument } from 'pdf-lib'
     *
     * const pdfDoc = await PDFDocument.create()
     * const viewerPrefs = pdfDoc.catalog.getOrCreateViewerPreferences()
     *
     * // We can set the default print range to only the first page
     * viewerPrefs.setPrintPageRange({ start: 0, end: 0 })
     *
     * // Or we can supply noncontiguous ranges (e.g. pages 1, 3, and 5-7)
     * viewerPrefs.setPrintPageRange([
     *   { start: 0, end: 0 },
     *   { start: 2, end: 2 },
     *   { start: 4, end: 6 },
     * ])
     * ```
     *
     * @param printPageRange An object or array of objects, each with the
     *                       properties `start` and `end`, denoting a range of
     *                       page indices.
     */
    setPrintPageRange(printPageRange: PageRange[] | PageRange): void;
    /**
     * Choose the default number of copies to be printed when the print dialog is
     * opened for this file.
     * @param numCopies The default number of copies.
     */
    setNumCopies(numCopies: number): void;
}
export default ViewerPreferences;
//# sourceMappingURL=ViewerPreferences.d.ts.map