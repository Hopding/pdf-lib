export declare const encodeToBase64: (bytes: Uint8Array) => string;
export declare const decodeFromBase64: (base64: string) => Uint8Array;
/**
 * If the `dataUri` input is a data URI, then the data URI prefix must not be
 * longer than 100 characters, or this function will fail to decode it.
 *
 * @param dataUri a base64 data URI or plain base64 string
 * @returns a Uint8Array containing the decoded input
 */
export declare const decodeFromBase64DataUri: (dataUri: string) => Uint8Array;
//# sourceMappingURL=base64.d.ts.map