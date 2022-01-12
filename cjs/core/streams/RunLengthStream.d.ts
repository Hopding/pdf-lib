import DecodeStream from "./DecodeStream";
import { StreamType } from "./Stream";
declare class RunLengthStream extends DecodeStream {
    private stream;
    constructor(stream: StreamType, maybeLength?: number);
    protected readBlock(): void;
}
export default RunLengthStream;
//# sourceMappingURL=RunLengthStream.d.ts.map