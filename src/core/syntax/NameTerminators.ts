import CharCodes from 'src/core/CharCodes';
import { WhitespaceChars } from 'src/core/syntax/Whitespace';

export const NameTerminatorChars = [
  ...WhitespaceChars,
  CharCodes.LeftSquareBracket,
  CharCodes.RightSquareBracket,
  CharCodes.LessThan,
  CharCodes.GreaterThan,
  CharCodes.LeftParen,
  CharCodes.RightParen,
  CharCodes.ForwardSlash,
];
