import DecodeStream from "./DecodeStream";
import { StreamType } from "./Stream";
declare class AsciiHexStream extends DecodeStream {
    private stream;
    private firstDigit;
    constructor(stream: StreamType, maybeLength?: number);
    protected readBlock(): void;
}
export default AsciiHexStream;
//# sourceMappingURL=AsciiHexStream.d.ts.map