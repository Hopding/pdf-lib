import PDFDict from "../objects/PDFDict";
import PDFName from "../objects/PDFName";
import PDFStream from "../objects/PDFStream";
import PDFArray from "../objects/PDFArray";
import PDFRef from "../objects/PDFRef";
import PDFNumber from "../objects/PDFNumber";
declare class PDFAnnotation {
    readonly dict: PDFDict;
    static fromDict: (dict: PDFDict) => PDFAnnotation;
    protected constructor(dict: PDFDict);
    Rect(): PDFArray | undefined;
    AP(): PDFDict | undefined;
    F(): PDFNumber | undefined;
    getRectangle(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    setRectangle(rect: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): void;
    getAppearanceState(): PDFName | undefined;
    setAppearanceState(state: PDFName): void;
    setAppearances(appearances: PDFDict): void;
    ensureAP(): PDFDict;
    getNormalAppearance(): PDFRef | PDFDict;
    /** @param appearance A PDFDict or PDFStream (direct or ref) */
    setNormalAppearance(appearance: PDFRef | PDFDict): void;
    /** @param appearance A PDFDict or PDFStream (direct or ref) */
    setRolloverAppearance(appearance: PDFRef | PDFDict): void;
    /** @param appearance A PDFDict or PDFStream (direct or ref) */
    setDownAppearance(appearance: PDFRef | PDFDict): void;
    removeRolloverAppearance(): void;
    removeDownAppearance(): void;
    getAppearances(): {
        normal: PDFStream | PDFDict;
        rollover?: PDFStream | PDFDict;
        down?: PDFStream | PDFDict;
    } | undefined;
    getFlags(): number;
    setFlags(flags: number): void;
    hasFlag(flag: number): boolean;
    setFlag(flag: number): void;
    clearFlag(flag: number): void;
    setFlagTo(flag: number, enable: boolean): void;
}
export default PDFAnnotation;
//# sourceMappingURL=PDFAnnotation.d.ts.map