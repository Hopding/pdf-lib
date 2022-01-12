import DecodeStream from "./DecodeStream";
import { StreamType } from "./Stream";
declare class FlateStream extends DecodeStream {
    private stream;
    private codeSize;
    private codeBuf;
    constructor(stream: StreamType, maybeLength?: number);
    protected readBlock(): void;
    private getBits;
    private getCode;
    private generateHuffmanTable;
}
export default FlateStream;
//# sourceMappingURL=FlateStream.d.ts.map