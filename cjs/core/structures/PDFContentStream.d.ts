import PDFDict from "../objects/PDFDict";
import PDFOperator from "../operators/PDFOperator";
import PDFContext from "../PDFContext";
import PDFFlateStream from "./PDFFlateStream";
declare class PDFContentStream extends PDFFlateStream {
    static of: (dict: PDFDict, operators: PDFOperator[], encode?: boolean) => PDFContentStream;
    private readonly operators;
    private constructor();
    push(...operators: PDFOperator[]): void;
    clone(context?: PDFContext): PDFContentStream;
    getContentsString(): string;
    getUnencodedContents(): Uint8Array;
    getUnencodedContentsSize(): number;
}
export default PDFContentStream;
//# sourceMappingURL=PDFContentStream.d.ts.map