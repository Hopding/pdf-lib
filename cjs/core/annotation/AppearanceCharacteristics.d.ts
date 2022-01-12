import PDFDict from "../objects/PDFDict";
import PDFNumber from "../objects/PDFNumber";
import PDFArray from "../objects/PDFArray";
import PDFHexString from "../objects/PDFHexString";
import PDFString from "../objects/PDFString";
declare class AppearanceCharacteristics {
    readonly dict: PDFDict;
    static fromDict: (dict: PDFDict) => AppearanceCharacteristics;
    protected constructor(dict: PDFDict);
    R(): PDFNumber | undefined;
    BC(): PDFArray | undefined;
    BG(): PDFArray | undefined;
    CA(): PDFHexString | PDFString | undefined;
    RC(): PDFHexString | PDFString | undefined;
    AC(): PDFHexString | PDFString | undefined;
    getRotation(): number | undefined;
    getBorderColor(): number[] | undefined;
    getBackgroundColor(): number[] | undefined;
    getCaptions(): {
        normal?: string;
        rollover?: string;
        down?: string;
    };
    setRotation(rotation: number): void;
    setBorderColor(color: number[]): void;
    setBackgroundColor(color: number[]): void;
    setCaptions(captions: {
        normal: string;
        rollover?: string;
        down?: string;
    }): void;
}
export default AppearanceCharacteristics;
//# sourceMappingURL=AppearanceCharacteristics.d.ts.map