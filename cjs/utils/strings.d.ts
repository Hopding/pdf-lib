export declare const toCharCode: (character: string) => number;
export declare const toCodePoint: (character: string) => number | undefined;
export declare const toHexStringOfMinLength: (num: number, minLength: number) => string;
export declare const toHexString: (num: number) => string;
export declare const charFromCode: (code: number) => string;
export declare const charFromHexCode: (hex: string) => string;
export declare const padStart: (value: string, length: number, padChar: string) => string;
export declare const copyStringIntoBuffer: (str: string, buffer: Uint8Array, offset: number) => number;
export declare const addRandomSuffix: (prefix: string, suffixLength?: number) => string;
export declare const escapeRegExp: (str: string) => string;
export declare const cleanText: (text: string) => string;
export declare const escapedNewlineChars: string[];
export declare const newlineChars: string[];
export declare const isNewlineChar: (text: string) => boolean;
export declare const lineSplit: (text: string) => string[];
export declare const mergeLines: (text: string) => string;
export declare const charAtIndex: (text: string, index: number) => [string, number];
export declare const charSplit: (text: string) => string[];
export declare const breakTextIntoLines: (text: string, wordBreaks: string[], maxWidth: number, computeWidthOfText: (t: string) => number) => string[];
export declare const parseDate: (dateStr: string) => Date | undefined;
export declare const findLastMatch: (value: string, regex: RegExp) => {
    match: RegExpMatchArray | undefined;
    pos: number;
};
//# sourceMappingURL=strings.d.ts.map