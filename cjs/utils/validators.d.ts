export declare const backtick: (val: any) => string;
export declare const singleQuote: (val: any) => string;
declare type Primitive = string | number | boolean | undefined | null;
export declare const createValueErrorMsg: (value: any, valueName: string, values: Primitive[]) => string;
export declare const assertIsOneOf: (value: any, valueName: string, allowedValues: Primitive[] | {
    [key: string]: Primitive;
}) => void;
export declare const assertIsOneOfOrUndefined: (value: any, valueName: string, allowedValues: Primitive[] | {
    [key: string]: Primitive;
}) => void;
export declare const assertIsSubset: (values: any[], valueName: string, allowedValues: Primitive[] | {
    [key: string]: Primitive;
}) => void;
export declare const getType: (val: any) => any;
export declare type TypeDescriptor = 'null' | 'undefined' | 'string' | 'number' | 'boolean' | 'symbol' | 'bigint' | DateConstructor | ArrayConstructor | Uint8ArrayConstructor | ArrayBufferConstructor | FunctionConstructor | [Function, string];
export declare const isType: (value: any, type: TypeDescriptor) => boolean;
export declare const createTypeErrorMsg: (value: any, valueName: string, types: TypeDescriptor[]) => string;
export declare const assertIs: (value: any, valueName: string, types: TypeDescriptor[]) => void;
export declare const assertOrUndefined: (value: any, valueName: string, types: TypeDescriptor[]) => void;
export declare const assertEachIs: (values: any[], valueName: string, types: TypeDescriptor[]) => void;
export declare const assertRange: (value: any, valueName: string, min: number, max: number) => void;
export declare const assertRangeOrUndefined: (value: any, valueName: string, min: number, max: number) => void;
export declare const assertMultiple: (value: any, valueName: string, multiplier: number) => void;
export declare const assertInteger: (value: any, valueName: string) => void;
export declare const assertPositive: (value: number, valueName: string) => void;
export {};
//# sourceMappingURL=validators.d.ts.map