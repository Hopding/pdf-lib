import CharCodes from 'src/core/CharCodes';

export const EndstreamEolChars = [CharCodes.Newline, CharCodes.CarriageReturn];

export const Keywords = {
  true: [CharCodes.t, CharCodes.r, CharCodes.u, CharCodes.e],
  false: [CharCodes.f, CharCodes.a, CharCodes.l, CharCodes.s, CharCodes.e],
  null: [CharCodes.n, CharCodes.u, CharCodes.l, CharCodes.l],
  stream: [
    CharCodes.s,
    CharCodes.t,
    CharCodes.r,
    CharCodes.e,
    CharCodes.a,
    CharCodes.m,
  ],
  endstream: [
    CharCodes.e,
    CharCodes.n,
    CharCodes.d,
    CharCodes.s,
    CharCodes.t,
    CharCodes.r,
    CharCodes.e,
    CharCodes.a,
    CharCodes.m,
  ],
};
