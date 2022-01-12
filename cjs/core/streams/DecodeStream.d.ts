import Stream, { StreamType } from "./Stream";
/**
 * Super class for the decoding streams
 */
declare class DecodeStream implements StreamType {
    protected bufferLength: number;
    protected buffer: Uint8Array;
    protected eof: boolean;
    private pos;
    private minBufferLength;
    constructor(maybeMinBufferLength?: number);
    get isEmpty(): boolean;
    getByte(): number;
    getUint16(): number;
    getInt32(): number;
    getBytes(length: number, forceClamped?: boolean): Uint8Array | Uint8ClampedArray;
    peekByte(): number;
    peekBytes(length: number, forceClamped?: boolean): Uint8Array | Uint8ClampedArray;
    skip(n: number): void;
    reset(): void;
    makeSubStream(start: number, length: number): Stream;
    decode(): Uint8Array;
    protected readBlock(): void;
    protected ensureBuffer(requested: number): Uint8Array;
}
export default DecodeStream;
//# sourceMappingURL=DecodeStream.d.ts.map