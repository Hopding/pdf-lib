import PDFRawStream from "../objects/PDFRawStream";
declare class ByteStream {
    static of: (bytes: Uint8Array) => ByteStream;
    static fromPDFRawStream: (rawStream: PDFRawStream) => ByteStream;
    private readonly bytes;
    private readonly length;
    private idx;
    private line;
    private column;
    constructor(bytes: Uint8Array);
    moveTo(offset: number): void;
    next(): number;
    assertNext(expected: number): number;
    peek(): number;
    peekAhead(steps: number): number;
    peekAt(offset: number): number;
    done(): boolean;
    offset(): number;
    slice(start: number, end: number): Uint8Array;
    position(): {
        line: number;
        column: number;
        offset: number;
    };
}
export default ByteStream;
//# sourceMappingURL=ByteStream.d.ts.map