import CharCodes from 'src/core/syntax/CharCodes';

export const IsWhitespace = new Uint8Array(256);

IsWhitespace[CharCodes.Null] = 1;
IsWhitespace[CharCodes.Tab] = 1;
IsWhitespace[CharCodes.Newline] = 1;
IsWhitespace[CharCodes.FormFeed] = 1;
IsWhitespace[CharCodes.CarriageReturn] = 1;
IsWhitespace[CharCodes.Space] = 1;
