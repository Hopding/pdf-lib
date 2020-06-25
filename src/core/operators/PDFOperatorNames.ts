enum PDFOperatorNames {
  // Non Stroking Color Operators
  NonStrokingColor = 'sc',
  NonStrokingColorN = 'scn',
  NonStrokingColorRgb = 'rg',
  NonStrokingColorGray = 'g',
  NonStrokingColorCmyk = 'k',
  NonStrokingColorspace = 'cs',

  // Stroking Color Operators
  StrokingColor = 'SC',
  StrokingColorN = 'SCN',
  StrokingColorRgb = 'RG',
  StrokingColorGray = 'G',
  StrokingColorCmyk = 'K',
  StrokingColorspace = 'CS',

  // Marked Content Operators
  BeginMarkedContentSequence = 'BDC',
  BeginMarkedContent = 'BMC',
  EndMarkedContent = 'EMC',
  MarkedContentPointWithProps = 'DP',
  MarkedContentPoint = 'MP',
  DrawObject = 'Do',

  // Graphics State Operators
  ConcatTransformationMatrix = 'cm',
  PopGraphicsState = 'Q',
  PushGraphicsState = 'q',
  SetFlatness = 'i',
  SetGraphicsStateParams = 'gs',
  SetLineCapStyle = 'J',
  SetLineDashPattern = 'd',
  SetLineJoinStyle = 'j',
  SetLineMiterLimit = 'M',
  SetLineWidth = 'w',
  SetTextMatrix = 'Tm',
  SetRenderingIntent = 'ri',

  // Graphics Operators
  AppendRectangle = 're',
  BeginInlineImage = 'BI',
  BeginInlineImageData = 'ID',
  EndInlineImage = 'EI',
  ClipEvenOdd = 'W*',
  ClipNonZero = 'W',
  CloseAndStroke = 's',
  CloseFillEvenOddAndStroke = 'b*',
  CloseFillNonZeroAndStroke = 'b',
  ClosePath = 'h',
  AppendBezierCurve = 'c',
  CurveToReplicateFinalPoint = 'y',
  CurveToReplicateInitialPoint = 'v',
  EndPath = 'n',
  FillEvenOddAndStroke = 'B*',
  FillEvenOdd = 'f*',
  FillNonZeroAndStroke = 'B',
  FillNonZero = 'f',
  LegacyFillNonZero = 'F',
  LineTo = 'l',
  MoveTo = 'm',
  ShadingFill = 'sh',
  StrokePath = 'S',

  // Text Operators
  BeginText = 'BT',
  EndText = 'ET',
  MoveText = 'Td',
  MoveTextSetLeading = 'TD',
  NextLine = 'T*',
  SetCharacterSpacing = 'Tc',
  SetFontAndSize = 'Tf',
  SetTextHorizontalScaling = 'Tz',
  SetTextLineHeight = 'TL',
  SetTextRenderingMode = 'Tr',
  SetTextRise = 'Ts',
  SetWordSpacing = 'Tw',
  ShowText = 'Tj',
  ShowTextAdjusted = 'TJ',
  ShowTextLine = "'", // tslint:disable-line quotemark
  ShowTextLineAndSpace = '"',

  // Type3 Font Operators
  Type3D0 = 'd0',
  Type3D1 = 'd1',

  // Compatibility Section Operators
  BeginCompatibilitySection = 'BX',
  EndCompatibilitySection = 'EX',
}

export default PDFOperatorNames;
