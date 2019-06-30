import CharCodes from 'src/core/syntax/CharCodes';

export const IsDigit = new Uint8Array(256);

IsDigit[CharCodes.Zero] = 1;
IsDigit[CharCodes.One] = 1;
IsDigit[CharCodes.Two] = 1;
IsDigit[CharCodes.Three] = 1;
IsDigit[CharCodes.Four] = 1;
IsDigit[CharCodes.Five] = 1;
IsDigit[CharCodes.Six] = 1;
IsDigit[CharCodes.Seven] = 1;
IsDigit[CharCodes.Eight] = 1;
IsDigit[CharCodes.Nine] = 1;

export const IsNumericPrefix = new Uint8Array(256);

IsNumericPrefix[CharCodes.Period] = 1;
IsNumericPrefix[CharCodes.Plus] = 1;
IsNumericPrefix[CharCodes.Minus] = 1;

export const IsNumeric = new Uint8Array(256);

for (let idx = 0, len = 256; idx < len; idx++) {
  IsNumeric[idx] = IsDigit[idx] || IsNumericPrefix[idx] ? 1 : 0;
}
