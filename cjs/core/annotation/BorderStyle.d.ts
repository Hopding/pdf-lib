import PDFDict from "../objects/PDFDict";
import PDFNumber from "../objects/PDFNumber";
declare class BorderStyle {
    readonly dict: PDFDict;
    static fromDict: (dict: PDFDict) => BorderStyle;
    protected constructor(dict: PDFDict);
    W(): PDFNumber | undefined;
    getWidth(): number | undefined;
    setWidth(width: number): void;
}
export default BorderStyle;
//# sourceMappingURL=BorderStyle.d.ts.map