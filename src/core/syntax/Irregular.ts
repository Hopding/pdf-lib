import CharCodes from 'src/core/syntax/CharCodes';
import { IsDelimiter } from 'src/core/syntax/Delimiters';
import { IsWhitespace } from 'src/core/syntax/Whitespace';

export const IsIrregular = new Uint8Array(256);

for (let idx = 0, len = 256; idx < len; idx++) {
  IsIrregular[idx] = IsWhitespace[idx] || IsDelimiter[idx] ? 1 : 0;
}
IsIrregular[CharCodes.Hash] = 1;
