import { Font } from "../../types/fontkit";
export interface FontFlagOptions {
    fixedPitch?: boolean;
    serif?: boolean;
    symbolic?: boolean;
    script?: boolean;
    nonsymbolic?: boolean;
    italic?: boolean;
    allCap?: boolean;
    smallCap?: boolean;
    forceBold?: boolean;
}
export declare const deriveFontFlags: (font: Font) => number;
//# sourceMappingURL=FontFlags.d.ts.map