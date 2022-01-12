import PDFDict from "../objects/PDFDict";
import PDFString from "../objects/PDFString";
import PDFHexString from "../objects/PDFHexString";
import PDFName from "../objects/PDFName";
import PDFObject from "../objects/PDFObject";
import PDFNumber from "../objects/PDFNumber";
import PDFArray from "../objects/PDFArray";
import PDFRef from "../objects/PDFRef";
declare class PDFAcroField {
    readonly dict: PDFDict;
    readonly ref: PDFRef;
    protected constructor(dict: PDFDict, ref: PDFRef);
    T(): PDFString | PDFHexString | undefined;
    Ff(): PDFNumber | undefined;
    V(): PDFObject | undefined;
    Kids(): PDFArray | undefined;
    DA(): PDFString | PDFHexString | undefined;
    setKids(kids: PDFObject[]): void;
    getParent(): PDFAcroField | undefined;
    setParent(parent: PDFRef | undefined): void;
    getFullyQualifiedName(): string | undefined;
    getPartialName(): string | undefined;
    setPartialName(partialName: string | undefined): void;
    setDefaultAppearance(appearance: string): void;
    getDefaultAppearance(): string | undefined;
    setFontSize(fontSize: number): void;
    getFlags(): number;
    setFlags(flags: number): void;
    hasFlag(flag: number): boolean;
    setFlag(flag: number): void;
    clearFlag(flag: number): void;
    setFlagTo(flag: number, enable: boolean): void;
    getInheritableAttribute(name: PDFName): PDFObject | undefined;
    ascend(visitor: (node: PDFAcroField) => any): void;
}
export default PDFAcroField;
//# sourceMappingURL=PDFAcroField.d.ts.map