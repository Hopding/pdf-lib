import PDFFont from "../PDFFont";
import { TextAlignment } from "./alignment";
import { PDFHexString } from "../../core";
export interface TextPosition {
    text: string;
    encoded: PDFHexString;
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface LayoutBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface LayoutTextOptions {
    alignment: TextAlignment;
    fontSize?: number;
    font: PDFFont;
    bounds: LayoutBounds;
}
export interface MultilineTextLayout {
    bounds: LayoutBounds;
    lines: TextPosition[];
    fontSize: number;
    lineHeight: number;
}
export declare const layoutMultilineText: (text: string, { alignment, fontSize, font, bounds }: LayoutTextOptions) => MultilineTextLayout;
export interface LayoutCombedTextOptions {
    fontSize?: number;
    font: PDFFont;
    bounds: LayoutBounds;
    cellCount: number;
}
export interface CombedTextLayout {
    bounds: LayoutBounds;
    cells: TextPosition[];
    fontSize: number;
}
export declare const layoutCombedText: (text: string, { fontSize, font, bounds, cellCount }: LayoutCombedTextOptions) => CombedTextLayout;
export interface LayoutSinglelineTextOptions {
    alignment: TextAlignment;
    fontSize?: number;
    font: PDFFont;
    bounds: LayoutBounds;
}
export interface SinglelineTextLayout {
    bounds: LayoutBounds;
    line: TextPosition;
    fontSize: number;
}
export declare const layoutSinglelineText: (text: string, { alignment, fontSize, font, bounds }: LayoutSinglelineTextOptions) => SinglelineTextLayout;
//# sourceMappingURL=layout.d.ts.map