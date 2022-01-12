"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Keywords = void 0;
var tslib_1 = require("tslib");
var CharCodes_1 = tslib_1.__importDefault(require("./CharCodes"));
var Space = CharCodes_1.default.Space, CarriageReturn = CharCodes_1.default.CarriageReturn, Newline = CharCodes_1.default.Newline;
var stream = [
    CharCodes_1.default.s,
    CharCodes_1.default.t,
    CharCodes_1.default.r,
    CharCodes_1.default.e,
    CharCodes_1.default.a,
    CharCodes_1.default.m,
];
var endstream = [
    CharCodes_1.default.e,
    CharCodes_1.default.n,
    CharCodes_1.default.d,
    CharCodes_1.default.s,
    CharCodes_1.default.t,
    CharCodes_1.default.r,
    CharCodes_1.default.e,
    CharCodes_1.default.a,
    CharCodes_1.default.m,
];
exports.Keywords = {
    header: [
        CharCodes_1.default.Percent,
        CharCodes_1.default.P,
        CharCodes_1.default.D,
        CharCodes_1.default.F,
        CharCodes_1.default.Dash,
    ],
    eof: [
        CharCodes_1.default.Percent,
        CharCodes_1.default.Percent,
        CharCodes_1.default.E,
        CharCodes_1.default.O,
        CharCodes_1.default.F,
    ],
    obj: [CharCodes_1.default.o, CharCodes_1.default.b, CharCodes_1.default.j],
    endobj: [
        CharCodes_1.default.e,
        CharCodes_1.default.n,
        CharCodes_1.default.d,
        CharCodes_1.default.o,
        CharCodes_1.default.b,
        CharCodes_1.default.j,
    ],
    xref: [CharCodes_1.default.x, CharCodes_1.default.r, CharCodes_1.default.e, CharCodes_1.default.f],
    trailer: [
        CharCodes_1.default.t,
        CharCodes_1.default.r,
        CharCodes_1.default.a,
        CharCodes_1.default.i,
        CharCodes_1.default.l,
        CharCodes_1.default.e,
        CharCodes_1.default.r,
    ],
    startxref: [
        CharCodes_1.default.s,
        CharCodes_1.default.t,
        CharCodes_1.default.a,
        CharCodes_1.default.r,
        CharCodes_1.default.t,
        CharCodes_1.default.x,
        CharCodes_1.default.r,
        CharCodes_1.default.e,
        CharCodes_1.default.f,
    ],
    true: [CharCodes_1.default.t, CharCodes_1.default.r, CharCodes_1.default.u, CharCodes_1.default.e],
    false: [CharCodes_1.default.f, CharCodes_1.default.a, CharCodes_1.default.l, CharCodes_1.default.s, CharCodes_1.default.e],
    null: [CharCodes_1.default.n, CharCodes_1.default.u, CharCodes_1.default.l, CharCodes_1.default.l],
    stream: stream,
    streamEOF1: tslib_1.__spreadArrays(stream, [Space, CarriageReturn, Newline]),
    streamEOF2: tslib_1.__spreadArrays(stream, [CarriageReturn, Newline]),
    streamEOF3: tslib_1.__spreadArrays(stream, [CarriageReturn]),
    streamEOF4: tslib_1.__spreadArrays(stream, [Newline]),
    endstream: endstream,
    EOF1endstream: tslib_1.__spreadArrays([CarriageReturn, Newline], endstream),
    EOF2endstream: tslib_1.__spreadArrays([CarriageReturn], endstream),
    EOF3endstream: tslib_1.__spreadArrays([Newline], endstream),
};
//# sourceMappingURL=Keywords.js.map