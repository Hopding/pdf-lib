import CharCodes from 'src/core/syntax/CharCodes';

export const IsDelimiter = new Uint8Array(256);

IsDelimiter[CharCodes.LeftParen] = 1;
IsDelimiter[CharCodes.RightParen] = 1;
IsDelimiter[CharCodes.LessThan] = 1;
IsDelimiter[CharCodes.GreaterThan] = 1;
IsDelimiter[CharCodes.LeftSquareBracket] = 1;
IsDelimiter[CharCodes.RightSquareBracket] = 1;
IsDelimiter[CharCodes.LeftCurly] = 1;
IsDelimiter[CharCodes.RightCurly] = 1;
IsDelimiter[CharCodes.ForwardSlash] = 1;
IsDelimiter[CharCodes.Percent] = 1;
