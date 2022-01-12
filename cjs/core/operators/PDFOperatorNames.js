"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PDFOperatorNames;
(function (PDFOperatorNames) {
    // Non Stroking Color Operators
    PDFOperatorNames["NonStrokingColor"] = "sc";
    PDFOperatorNames["NonStrokingColorN"] = "scn";
    PDFOperatorNames["NonStrokingColorRgb"] = "rg";
    PDFOperatorNames["NonStrokingColorGray"] = "g";
    PDFOperatorNames["NonStrokingColorCmyk"] = "k";
    PDFOperatorNames["NonStrokingColorspace"] = "cs";
    // Stroking Color Operators
    PDFOperatorNames["StrokingColor"] = "SC";
    PDFOperatorNames["StrokingColorN"] = "SCN";
    PDFOperatorNames["StrokingColorRgb"] = "RG";
    PDFOperatorNames["StrokingColorGray"] = "G";
    PDFOperatorNames["StrokingColorCmyk"] = "K";
    PDFOperatorNames["StrokingColorspace"] = "CS";
    // Marked Content Operators
    PDFOperatorNames["BeginMarkedContentSequence"] = "BDC";
    PDFOperatorNames["BeginMarkedContent"] = "BMC";
    PDFOperatorNames["EndMarkedContent"] = "EMC";
    PDFOperatorNames["MarkedContentPointWithProps"] = "DP";
    PDFOperatorNames["MarkedContentPoint"] = "MP";
    PDFOperatorNames["DrawObject"] = "Do";
    // Graphics State Operators
    PDFOperatorNames["ConcatTransformationMatrix"] = "cm";
    PDFOperatorNames["PopGraphicsState"] = "Q";
    PDFOperatorNames["PushGraphicsState"] = "q";
    PDFOperatorNames["SetFlatness"] = "i";
    PDFOperatorNames["SetGraphicsStateParams"] = "gs";
    PDFOperatorNames["SetLineCapStyle"] = "J";
    PDFOperatorNames["SetLineDashPattern"] = "d";
    PDFOperatorNames["SetLineJoinStyle"] = "j";
    PDFOperatorNames["SetLineMiterLimit"] = "M";
    PDFOperatorNames["SetLineWidth"] = "w";
    PDFOperatorNames["SetTextMatrix"] = "Tm";
    PDFOperatorNames["SetRenderingIntent"] = "ri";
    // Graphics Operators
    PDFOperatorNames["AppendRectangle"] = "re";
    PDFOperatorNames["BeginInlineImage"] = "BI";
    PDFOperatorNames["BeginInlineImageData"] = "ID";
    PDFOperatorNames["EndInlineImage"] = "EI";
    PDFOperatorNames["ClipEvenOdd"] = "W*";
    PDFOperatorNames["ClipNonZero"] = "W";
    PDFOperatorNames["CloseAndStroke"] = "s";
    PDFOperatorNames["CloseFillEvenOddAndStroke"] = "b*";
    PDFOperatorNames["CloseFillNonZeroAndStroke"] = "b";
    PDFOperatorNames["ClosePath"] = "h";
    PDFOperatorNames["AppendBezierCurve"] = "c";
    PDFOperatorNames["CurveToReplicateFinalPoint"] = "y";
    PDFOperatorNames["CurveToReplicateInitialPoint"] = "v";
    PDFOperatorNames["EndPath"] = "n";
    PDFOperatorNames["FillEvenOddAndStroke"] = "B*";
    PDFOperatorNames["FillEvenOdd"] = "f*";
    PDFOperatorNames["FillNonZeroAndStroke"] = "B";
    PDFOperatorNames["FillNonZero"] = "f";
    PDFOperatorNames["LegacyFillNonZero"] = "F";
    PDFOperatorNames["LineTo"] = "l";
    PDFOperatorNames["MoveTo"] = "m";
    PDFOperatorNames["ShadingFill"] = "sh";
    PDFOperatorNames["StrokePath"] = "S";
    // Text Operators
    PDFOperatorNames["BeginText"] = "BT";
    PDFOperatorNames["EndText"] = "ET";
    PDFOperatorNames["MoveText"] = "Td";
    PDFOperatorNames["MoveTextSetLeading"] = "TD";
    PDFOperatorNames["NextLine"] = "T*";
    PDFOperatorNames["SetCharacterSpacing"] = "Tc";
    PDFOperatorNames["SetFontAndSize"] = "Tf";
    PDFOperatorNames["SetTextHorizontalScaling"] = "Tz";
    PDFOperatorNames["SetTextLineHeight"] = "TL";
    PDFOperatorNames["SetTextRenderingMode"] = "Tr";
    PDFOperatorNames["SetTextRise"] = "Ts";
    PDFOperatorNames["SetWordSpacing"] = "Tw";
    PDFOperatorNames["ShowText"] = "Tj";
    PDFOperatorNames["ShowTextAdjusted"] = "TJ";
    PDFOperatorNames["ShowTextLine"] = "'";
    PDFOperatorNames["ShowTextLineAndSpace"] = "\"";
    // Type3 Font Operators
    PDFOperatorNames["Type3D0"] = "d0";
    PDFOperatorNames["Type3D1"] = "d1";
    // Compatibility Section Operators
    PDFOperatorNames["BeginCompatibilitySection"] = "BX";
    PDFOperatorNames["EndCompatibilitySection"] = "EX";
})(PDFOperatorNames || (PDFOperatorNames = {}));
exports.default = PDFOperatorNames;
//# sourceMappingURL=PDFOperatorNames.js.map