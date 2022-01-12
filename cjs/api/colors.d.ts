export declare enum ColorTypes {
    Grayscale = "Grayscale",
    RGB = "RGB",
    CMYK = "CMYK"
}
export interface Grayscale {
    type: ColorTypes.Grayscale;
    gray: number;
}
export interface RGB {
    type: ColorTypes.RGB;
    red: number;
    green: number;
    blue: number;
}
export interface CMYK {
    type: ColorTypes.CMYK;
    cyan: number;
    magenta: number;
    yellow: number;
    key: number;
}
export declare type Color = Grayscale | RGB | CMYK;
export declare const grayscale: (gray: number) => Grayscale;
export declare const rgb: (red: number, green: number, blue: number) => RGB;
export declare const cmyk: (cyan: number, magenta: number, yellow: number, key: number) => CMYK;
export declare const setFillingColor: (color: Color) => import("../core/operators/PDFOperator").default;
export declare const setStrokingColor: (color: Color) => import("../core/operators/PDFOperator").default;
export declare const componentsToColor: (comps?: number[] | undefined, scale?: number) => Grayscale | RGB | CMYK | undefined;
export declare const colorToComponents: (color: Color) => number[];
//# sourceMappingURL=colors.d.ts.map