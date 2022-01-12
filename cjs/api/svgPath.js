"use strict";
// Originated from pdfkit Copyright (c) 2014 Devon Govett
// https://github.com/foliojs/pdfkit/blob/1e62e6ffe24b378eb890df507a47610f4c4a7b24/lib/path.js
// MIT LICENSE
// Updated for pdf-lib & TypeScript by Jeremy Messenger
Object.defineProperty(exports, "__esModule", { value: true });
exports.svgPathToOperators = void 0;
var operators_1 = require("./operators");
var cx = 0;
var cy = 0;
var px = 0;
var py = 0;
var sx = 0;
var sy = 0;
var parameters = new Map([
    ['A', 7],
    ['a', 7],
    ['C', 6],
    ['c', 6],
    ['H', 1],
    ['h', 1],
    ['L', 2],
    ['l', 2],
    ['M', 2],
    ['m', 2],
    ['Q', 4],
    ['q', 4],
    ['S', 4],
    ['s', 4],
    ['T', 2],
    ['t', 2],
    ['V', 1],
    ['v', 1],
    ['Z', 0],
    ['z', 0],
]);
var parse = function (path) {
    var cmd;
    var ret = [];
    var args = [];
    var curArg = '';
    var foundDecimal = false;
    var params = 0;
    for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
        var c = path_1[_i];
        if (parameters.has(c)) {
            params = parameters.get(c);
            if (cmd) {
                // save existing command
                if (curArg.length > 0) {
                    args[args.length] = +curArg;
                }
                ret[ret.length] = { cmd: cmd, args: args };
                args = [];
                curArg = '';
                foundDecimal = false;
            }
            cmd = c;
        }
        else if ([' ', ','].includes(c) ||
            (c === '-' && curArg.length > 0 && curArg[curArg.length - 1] !== 'e') ||
            (c === '.' && foundDecimal)) {
            if (curArg.length === 0) {
                continue;
            }
            if (args.length === params) {
                // handle reused commands
                ret[ret.length] = { cmd: cmd, args: args };
                args = [+curArg];
                // handle assumed commands
                if (cmd === 'M') {
                    cmd = 'L';
                }
                if (cmd === 'm') {
                    cmd = 'l';
                }
            }
            else {
                args[args.length] = +curArg;
            }
            foundDecimal = c === '.';
            // fix for negative numbers or repeated decimals with no delimeter between commands
            curArg = ['-', '.'].includes(c) ? c : '';
        }
        else {
            curArg += c;
            if (c === '.') {
                foundDecimal = true;
            }
        }
    }
    // add the last command
    if (curArg.length > 0) {
        if (args.length === params) {
            // handle reused commands
            ret[ret.length] = { cmd: cmd, args: args };
            args = [+curArg];
            // handle assumed commands
            if (cmd === 'M') {
                cmd = 'L';
            }
            if (cmd === 'm') {
                cmd = 'l';
            }
        }
        else {
            args[args.length] = +curArg;
        }
    }
    ret[ret.length] = { cmd: cmd, args: args };
    return ret;
};
var apply = function (commands) {
    // current point, control point, and subpath starting point
    cx = cy = px = py = sx = sy = 0;
    // run the commands
    var cmds = [];
    for (var i = 0; i < commands.length; i++) {
        var c = commands[i];
        if (c.cmd && typeof runners[c.cmd] === 'function') {
            var cmd = runners[c.cmd](c.args);
            if (Array.isArray(cmd)) {
                cmds = cmds.concat(cmd);
            }
            else {
                cmds.push(cmd);
            }
        }
    }
    return cmds;
};
var runners = {
    M: function (a) {
        cx = a[0];
        cy = a[1];
        px = py = null;
        sx = cx;
        sy = cy;
        return operators_1.moveTo(cx, cy);
    },
    m: function (a) {
        cx += a[0];
        cy += a[1];
        px = py = null;
        sx = cx;
        sy = cy;
        return operators_1.moveTo(cx, cy);
    },
    C: function (a) {
        cx = a[4];
        cy = a[5];
        px = a[2];
        py = a[3];
        return operators_1.appendBezierCurve(a[0], a[1], a[2], a[3], a[4], a[5]);
    },
    c: function (a) {
        var cmd = operators_1.appendBezierCurve(a[0] + cx, a[1] + cy, a[2] + cx, a[3] + cy, a[4] + cx, a[5] + cy);
        px = cx + a[2];
        py = cy + a[3];
        cx += a[4];
        cy += a[5];
        return cmd;
    },
    S: function (a) {
        if (px === null || py === null) {
            px = cx;
            py = cy;
        }
        var cmd = operators_1.appendBezierCurve(cx - (px - cx), cy - (py - cy), a[0], a[1], a[2], a[3]);
        px = a[0];
        py = a[1];
        cx = a[2];
        cy = a[3];
        return cmd;
    },
    s: function (a) {
        if (px === null || py === null) {
            px = cx;
            py = cy;
        }
        var cmd = operators_1.appendBezierCurve(cx - (px - cx), cy - (py - cy), cx + a[0], cy + a[1], cx + a[2], cy + a[3]);
        px = cx + a[0];
        py = cy + a[1];
        cx += a[2];
        cy += a[3];
        return cmd;
    },
    Q: function (a) {
        px = a[0];
        py = a[1];
        cx = a[2];
        cy = a[3];
        return operators_1.appendQuadraticCurve(a[0], a[1], cx, cy);
    },
    q: function (a) {
        var cmd = operators_1.appendQuadraticCurve(a[0] + cx, a[1] + cy, a[2] + cx, a[3] + cy);
        px = cx + a[0];
        py = cy + a[1];
        cx += a[2];
        cy += a[3];
        return cmd;
    },
    T: function (a) {
        if (px === null || py === null) {
            px = cx;
            py = cy;
        }
        else {
            px = cx - (px - cx);
            py = cy - (py - cy);
        }
        var cmd = operators_1.appendQuadraticCurve(px, py, a[0], a[1]);
        px = cx - (px - cx);
        py = cy - (py - cy);
        cx = a[0];
        cy = a[1];
        return cmd;
    },
    t: function (a) {
        if (px === null || py === null) {
            px = cx;
            py = cy;
        }
        else {
            px = cx - (px - cx);
            py = cy - (py - cy);
        }
        var cmd = operators_1.appendQuadraticCurve(px, py, cx + a[0], cy + a[1]);
        cx += a[0];
        cy += a[1];
        return cmd;
    },
    A: function (a) {
        var cmds = solveArc(cx, cy, a);
        cx = a[5];
        cy = a[6];
        return cmds;
    },
    a: function (a) {
        a[5] += cx;
        a[6] += cy;
        var cmds = solveArc(cx, cy, a);
        cx = a[5];
        cy = a[6];
        return cmds;
    },
    L: function (a) {
        cx = a[0];
        cy = a[1];
        px = py = null;
        return operators_1.lineTo(cx, cy);
    },
    l: function (a) {
        cx += a[0];
        cy += a[1];
        px = py = null;
        return operators_1.lineTo(cx, cy);
    },
    H: function (a) {
        cx = a[0];
        px = py = null;
        return operators_1.lineTo(cx, cy);
    },
    h: function (a) {
        cx += a[0];
        px = py = null;
        return operators_1.lineTo(cx, cy);
    },
    V: function (a) {
        cy = a[0];
        px = py = null;
        return operators_1.lineTo(cx, cy);
    },
    v: function (a) {
        cy += a[0];
        px = py = null;
        return operators_1.lineTo(cx, cy);
    },
    Z: function () {
        var cmd = operators_1.closePath();
        cx = sx;
        cy = sy;
        return cmd;
    },
    z: function () {
        var cmd = operators_1.closePath();
        cx = sx;
        cy = sy;
        return cmd;
    },
};
var solveArc = function (x, y, coords) {
    var rx = coords[0], ry = coords[1], rot = coords[2], large = coords[3], sweep = coords[4], ex = coords[5], ey = coords[6];
    var segs = arcToSegments(ex, ey, rx, ry, large, sweep, rot, x, y);
    var cmds = [];
    for (var _i = 0, segs_1 = segs; _i < segs_1.length; _i++) {
        var seg = segs_1[_i];
        var bez = segmentToBezier.apply(void 0, seg);
        cmds.push(operators_1.appendBezierCurve.apply(void 0, bez));
    }
    return cmds;
};
// from Inkscape svgtopdf, thanks!
var arcToSegments = function (x, y, rx, ry, large, sweep, rotateX, ox, oy) {
    var th = rotateX * (Math.PI / 180);
    var sinTh = Math.sin(th);
    var cosTh = Math.cos(th);
    rx = Math.abs(rx);
    ry = Math.abs(ry);
    px = cosTh * (ox - x) * 0.5 + sinTh * (oy - y) * 0.5;
    py = cosTh * (oy - y) * 0.5 - sinTh * (ox - x) * 0.5;
    var pl = (px * px) / (rx * rx) + (py * py) / (ry * ry);
    if (pl > 1) {
        pl = Math.sqrt(pl);
        rx *= pl;
        ry *= pl;
    }
    var a00 = cosTh / rx;
    var a01 = sinTh / rx;
    var a10 = -sinTh / ry;
    var a11 = cosTh / ry;
    var x0 = a00 * ox + a01 * oy;
    var y0 = a10 * ox + a11 * oy;
    var x1 = a00 * x + a01 * y;
    var y1 = a10 * x + a11 * y;
    var d = (x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0);
    var sfactorSq = 1 / d - 0.25;
    if (sfactorSq < 0) {
        sfactorSq = 0;
    }
    var sfactor = Math.sqrt(sfactorSq);
    if (sweep === large) {
        sfactor = -sfactor;
    }
    var xc = 0.5 * (x0 + x1) - sfactor * (y1 - y0);
    var yc = 0.5 * (y0 + y1) + sfactor * (x1 - x0);
    var th0 = Math.atan2(y0 - yc, x0 - xc);
    var th1 = Math.atan2(y1 - yc, x1 - xc);
    var thArc = th1 - th0;
    if (thArc < 0 && sweep === 1) {
        thArc += 2 * Math.PI;
    }
    else if (thArc > 0 && sweep === 0) {
        thArc -= 2 * Math.PI;
    }
    var segments = Math.ceil(Math.abs(thArc / (Math.PI * 0.5 + 0.001)));
    var result = [];
    for (var i = 0; i < segments; i++) {
        var th2 = th0 + (i * thArc) / segments;
        var th3 = th0 + ((i + 1) * thArc) / segments;
        result[i] = [xc, yc, th2, th3, rx, ry, sinTh, cosTh];
    }
    return result;
};
var segmentToBezier = function (cx1, cy1, th0, th1, rx, ry, sinTh, cosTh) {
    var a00 = cosTh * rx;
    var a01 = -sinTh * ry;
    var a10 = sinTh * rx;
    var a11 = cosTh * ry;
    var thHalf = 0.5 * (th1 - th0);
    var t = ((8 / 3) * Math.sin(thHalf * 0.5) * Math.sin(thHalf * 0.5)) /
        Math.sin(thHalf);
    var x1 = cx1 + Math.cos(th0) - t * Math.sin(th0);
    var y1 = cy1 + Math.sin(th0) + t * Math.cos(th0);
    var x3 = cx1 + Math.cos(th1);
    var y3 = cy1 + Math.sin(th1);
    var x2 = x3 + t * Math.sin(th1);
    var y2 = y3 - t * Math.cos(th1);
    var result = [
        a00 * x1 + a01 * y1,
        a10 * x1 + a11 * y1,
        a00 * x2 + a01 * y2,
        a10 * x2 + a11 * y2,
        a00 * x3 + a01 * y3,
        a10 * x3 + a11 * y3,
    ];
    return result;
};
exports.svgPathToOperators = function (path) { return apply(parse(path)); };
//# sourceMappingURL=svgPath.js.map