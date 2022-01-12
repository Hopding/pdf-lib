export interface StreamType {
    isEmpty: boolean;
    getByte(): number;
    getUint16(): number;
    getInt32(): number;
    getBytes(length: number, forceClamped?: boolean): Uint8Array | Uint8ClampedArray;
    peekByte(): number;
    peekBytes(length: number, forceClamped?: boolean): Uint8Array | Uint8ClampedArray;
    skip(n: number): void;
    reset(): void;
    makeSubStream(start: number, length: number): StreamType;
    decode(): Uint8Array;
}
declare class Stream implements StreamType {
    private bytes;
    private start;
    private pos;
    private end;
    constructor(buffer: Uint8Array, start?: number, length?: number);
    get length(): number;
    get isEmpty(): boolean;
    getByte(): number;
    getUint16(): number;
    getInt32(): number;
    getBytes(length: number, forceClamped?: boolean): Uint8Array | Uint8ClampedArray;
    peekByte(): number;
    peekBytes(length: number, forceClamped?: boolean): Uint8Array | Uint8ClampedArray;
    skip(n: number): void;
    reset(): void;
    moveStart(): void;
    makeSubStream(start: number, length: number): Stream;
    decode(): Uint8Array;
}
export default Stream;
//# sourceMappingURL=Stream.d.ts.map