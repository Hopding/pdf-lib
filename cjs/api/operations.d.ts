import { Color } from "./colors";
import { scale, LineCapStyle } from "./operators";
import { Rotation } from "./rotations";
import { PDFHexString, PDFName, PDFNumber, PDFOperator } from "../core";
export interface DrawTextOptions {
    color: Color;
    font: string | PDFName;
    size: number | PDFNumber;
    rotate: Rotation;
    xSkew: Rotation;
    ySkew: Rotation;
    x: number | PDFNumber;
    y: number | PDFNumber;
    graphicsState?: string | PDFName;
}
export declare const drawText: (line: PDFHexString, options: DrawTextOptions) => PDFOperator[];
export interface DrawLinesOfTextOptions extends DrawTextOptions {
    lineHeight: number | PDFNumber;
}
export declare const drawLinesOfText: (lines: PDFHexString[], options: DrawLinesOfTextOptions) => PDFOperator[];
export declare const drawImage: (name: string | PDFName, options: {
    x: number | PDFNumber;
    y: number | PDFNumber;
    width: number | PDFNumber;
    height: number | PDFNumber;
    rotate: Rotation;
    xSkew: Rotation;
    ySkew: Rotation;
    graphicsState?: string | PDFName;
}) => PDFOperator[];
export declare const drawPage: (name: string | PDFName, options: {
    x: number | PDFNumber;
    y: number | PDFNumber;
    xScale: number | PDFNumber;
    yScale: number | PDFNumber;
    rotate: Rotation;
    xSkew: Rotation;
    ySkew: Rotation;
    graphicsState?: string | PDFName;
}) => PDFOperator[];
export declare const drawLine: (options: {
    start: {
        x: number | PDFNumber;
        y: number | PDFNumber;
    };
    end: {
        x: number | PDFNumber;
        y: number | PDFNumber;
    };
    thickness: number | PDFNumber;
    color: Color | undefined;
    dashArray?: (number | PDFNumber)[];
    dashPhase?: number | PDFNumber;
    lineCap?: LineCapStyle;
    graphicsState?: string | PDFName;
}) => PDFOperator[];
export declare const drawRectangle: (options: {
    x: number | PDFNumber;
    y: number | PDFNumber;
    width: number | PDFNumber;
    height: number | PDFNumber;
    borderWidth: number | PDFNumber;
    color: Color | undefined;
    borderColor: Color | undefined;
    rotate: Rotation;
    xSkew: Rotation;
    ySkew: Rotation;
    borderLineCap?: LineCapStyle;
    borderDashArray?: (number | PDFNumber)[];
    borderDashPhase?: number | PDFNumber;
    graphicsState?: string | PDFName;
}) => PDFOperator[];
/** @deprecated */
export declare const drawEllipsePath: (config: {
    x: number | PDFNumber;
    y: number | PDFNumber;
    xScale: number | PDFNumber;
    yScale: number | PDFNumber;
}) => PDFOperator[];
export declare const drawEllipse: (options: {
    x: number | PDFNumber;
    y: number | PDFNumber;
    xScale: number | PDFNumber;
    yScale: number | PDFNumber;
    rotate?: Rotation;
    color: Color | undefined;
    borderColor: Color | undefined;
    borderWidth: number | PDFNumber;
    borderDashArray?: (number | PDFNumber)[];
    borderDashPhase?: number | PDFNumber;
    graphicsState?: string | PDFName;
    borderLineCap?: LineCapStyle;
}) => PDFOperator[];
export declare const drawSvgPath: (path: string, options: {
    x: number | PDFNumber;
    y: number | PDFNumber;
    rotate?: Rotation;
    scale: number | PDFNumber | undefined;
    color: Color | undefined;
    borderColor: Color | undefined;
    borderWidth: number | PDFNumber;
    borderDashArray?: (number | PDFNumber)[];
    borderDashPhase?: number | PDFNumber;
    borderLineCap?: LineCapStyle;
    graphicsState?: string | PDFName;
}) => PDFOperator[];
export declare const drawCheckMark: (options: {
    x: number | PDFNumber;
    y: number | PDFNumber;
    size: number | PDFNumber;
    thickness: number | PDFNumber;
    color: Color | undefined;
}) => PDFOperator[];
export declare const rotateInPlace: (options: {
    width: number | PDFNumber;
    height: number | PDFNumber;
    rotation: 0 | 90 | 180 | 270;
}) => PDFOperator[];
export declare const drawCheckBox: (options: {
    x: number | PDFNumber;
    y: number | PDFNumber;
    width: number | PDFNumber;
    height: number | PDFNumber;
    thickness: number | PDFNumber;
    borderWidth: number | PDFNumber;
    markColor: Color | undefined;
    color: Color | undefined;
    borderColor: Color | undefined;
    filled: boolean;
}) => PDFOperator[];
export declare const drawRadioButton: (options: {
    x: number | PDFNumber;
    y: number | PDFNumber;
    width: number | PDFNumber;
    height: number | PDFNumber;
    borderWidth: number | PDFNumber;
    dotColor: Color | undefined;
    color: Color | undefined;
    borderColor: Color | undefined;
    filled: boolean;
}) => PDFOperator[];
export declare const drawButton: (options: {
    x: number | PDFNumber;
    y: number | PDFNumber;
    width: number | PDFNumber;
    height: number | PDFNumber;
    borderWidth: number | PDFNumber;
    color: Color | undefined;
    borderColor: Color | undefined;
    textLines: {
        encoded: PDFHexString;
        x: number;
        y: number;
    }[];
    textColor: Color;
    font: string | PDFName;
    fontSize: number | PDFNumber;
}) => PDFOperator[];
export interface DrawTextLinesOptions {
    color: Color;
    font: string | PDFName;
    size: number | PDFNumber;
    rotate: Rotation;
    xSkew: Rotation;
    ySkew: Rotation;
}
export declare const drawTextLines: (lines: {
    encoded: PDFHexString;
    x: number;
    y: number;
}[], options: DrawTextLinesOptions) => PDFOperator[];
export declare const drawTextField: (options: {
    x: number | PDFNumber;
    y: number | PDFNumber;
    width: number | PDFNumber;
    height: number | PDFNumber;
    borderWidth: number | PDFNumber;
    color: Color | undefined;
    borderColor: Color | undefined;
    textLines: {
        encoded: PDFHexString;
        x: number;
        y: number;
    }[];
    textColor: Color;
    font: string | PDFName;
    fontSize: number | PDFNumber;
    padding: number | PDFNumber;
}) => PDFOperator[];
export declare const drawOptionList: (options: {
    x: number | PDFNumber;
    y: number | PDFNumber;
    width: number | PDFNumber;
    height: number | PDFNumber;
    borderWidth: number | PDFNumber;
    color: Color | undefined;
    borderColor: Color | undefined;
    textLines: {
        encoded: PDFHexString;
        x: number;
        y: number;
        height: number;
    }[];
    textColor: Color;
    font: string | PDFName;
    fontSize: number | PDFNumber;
    lineHeight: number | PDFNumber;
    selectedLines: number[];
    selectedColor: Color;
    padding: number | PDFNumber;
}) => PDFOperator[];
//# sourceMappingURL=operations.d.ts.map