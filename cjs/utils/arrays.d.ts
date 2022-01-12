export declare const last: <T>(array: T[]) => T;
export declare const typedArrayFor: (value: string | Uint8Array) => Uint8Array;
export declare const mergeIntoTypedArray: (...arrays: (string | Uint8Array)[]) => Uint8Array;
export declare const mergeUint8Arrays: (arrays: Uint8Array[]) => Uint8Array;
export declare const arrayAsString: (array: Uint8Array | number[]) => string;
export declare const byAscendingId: <T extends {
    id: any;
}>(a: T, b: T) => number;
export declare const sortedUniq: <T>(array: T[], indexer: (elem: T) => any) => T[];
export declare const reverseArray: (array: Uint8Array) => Uint8Array;
export declare const sum: (array: number[] | Uint8Array) => number;
export declare const range: (start: number, end: number) => number[];
export declare const pluckIndices: <T>(arr: T[], indices: number[]) => T[];
export declare const canBeConvertedToUint8Array: (input: any) => input is string | Uint8Array | ArrayBuffer;
export declare const toUint8Array: (input: string | ArrayBuffer | Uint8Array) => Uint8Array;
//# sourceMappingURL=arrays.d.ts.map