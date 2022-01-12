import PDFObject from "../objects/PDFObject";
import PDFString from "../objects/PDFString";
import PDFHexString from "../objects/PDFHexString";
import PDFArray from "../objects/PDFArray";
import PDFName from "../objects/PDFName";
import PDFRef from "../objects/PDFRef";
import PDFAcroTerminal from "./PDFAcroTerminal";
declare class PDFAcroButton extends PDFAcroTerminal {
    Opt(): PDFString | PDFHexString | PDFArray | undefined;
    setOpt(opt: PDFObject[]): void;
    getExportValues(): (PDFString | PDFHexString)[] | undefined;
    removeExportValue(idx: number): void;
    normalizeExportValues(): void;
    /**
     * Reuses existing opt if one exists with the same value (assuming
     * `useExistingIdx` is `true`). Returns index of existing (or new) opt.
     */
    addOpt(opt: PDFHexString | PDFString, useExistingOptIdx: boolean): number;
    addWidgetWithOpt(widget: PDFRef, opt: PDFHexString | PDFString, useExistingOptIdx: boolean): PDFName;
}
export default PDFAcroButton;
//# sourceMappingURL=PDFAcroButton.d.ts.map