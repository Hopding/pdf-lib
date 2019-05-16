import CharCodes from 'src/core/CharCodes';

export const DigitChars = [
  CharCodes.Zero,
  CharCodes.One,
  CharCodes.Two,
  CharCodes.Three,
  CharCodes.Four,
  CharCodes.Five,
  CharCodes.Six,
  CharCodes.Seven,
  CharCodes.Eight,
  CharCodes.Nine,
];

export const NumericPrefixChars = [
  CharCodes.Period,
  CharCodes.Plus,
  CharCodes.Minus,
];

export const NumericChars = [...NumericPrefixChars, ...DigitChars];
