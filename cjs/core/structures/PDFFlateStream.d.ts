import PDFDict from "../objects/PDFDict";
import PDFStream from "../objects/PDFStream";
import { Cache } from "../../utils";
declare class PDFFlateStream extends PDFStream {
    protected readonly contentsCache: Cache<Uint8Array>;
    protected readonly encode: boolean;
    constructor(dict: PDFDict, encode: boolean);
    computeContents: () => Uint8Array;
    getContents(): Uint8Array;
    getContentsSize(): number;
    getUnencodedContents(): Uint8Array;
}
export default PDFFlateStream;
//# sourceMappingURL=PDFFlateStream.d.ts.map