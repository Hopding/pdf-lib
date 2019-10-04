// Originated from pdfkit Copyright (c) 2014 Devon Govett
// https://github.com/foliojs/pdfkit/blob/1e62e6ffe24b378eb890df507a47610f4c4a7b24/lib/path.js
// MIT LICENSE
// Updated for pdf-lib & TypeScript by Jeremy Messenger

import {
  appendBezierCurve,
  appendQuadraticCurve,
  closePath,
  lineTo,
  moveTo,
} from 'src/api/operators';
import { PDFOperator } from 'src/core';

let cx: number = 0;
let cy: number = 0;
let px: number | null = 0;
let py: number | null = 0;
let sx: number = 0;
let sy: number = 0;

const parameters = new Map<string, number>([
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

interface Cmd {
  cmd?: string;
  args: number[];
}

const parse = (path: string) => {
  let cmd;
  const ret: Cmd[] = [];
  let args: number[] = [];
  let curArg = '';
  let foundDecimal = false;
  let params = 0;

  for (const c of path) {
    if (parameters.has(c)) {
      params = parameters.get(c)!;
      if (cmd) {
        // save existing command
        if (curArg.length > 0) {
          args[args.length] = +curArg;
        }
        ret[ret.length] = { cmd, args };

        args = [];
        curArg = '';
        foundDecimal = false;
      }

      cmd = c;
    } else if (
      [' ', ','].includes(c) ||
      (c === '-' && curArg.length > 0 && curArg[curArg.length - 1] !== 'e') ||
      (c === '.' && foundDecimal)
    ) {
      if (curArg.length === 0) {
        continue;
      }

      if (args.length === params) {
        // handle reused commands
        ret[ret.length] = { cmd, args };
        args = [+curArg];

        // handle assumed commands
        if (cmd === 'M') {
          cmd = 'L';
        }
        if (cmd === 'm') {
          cmd = 'l';
        }
      } else {
        args[args.length] = +curArg;
      }

      foundDecimal = c === '.';

      // fix for negative numbers or repeated decimals with no delimeter between commands
      curArg = ['-', '.'].includes(c) ? c : '';
    } else {
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
      ret[ret.length] = { cmd, args };
      args = [+curArg];

      // handle assumed commands
      if (cmd === 'M') {
        cmd = 'L';
      }
      if (cmd === 'm') {
        cmd = 'l';
      }
    } else {
      args[args.length] = +curArg;
    }
  }

  ret[ret.length] = { cmd, args };

  return ret;
};

const apply = (commands: Cmd[]) => {
  // current point, control point, and subpath starting point
  cx = cy = px = py = sx = sy = 0;

  // run the commands
  let cmds: PDFOperator[] = [];
  for (let i = 0; i < commands.length; i++) {
    const c = commands[i];
    if (c.cmd && typeof runners[c.cmd] === 'function') {
      const cmd = runners[c.cmd](c.args);
      if (Array.isArray(cmd)) {
        cmds = cmds.concat(cmd);
      } else {
        cmds.push(cmd);
      }
    }
  }
  return cmds;
};

interface CmdToOperatorsMap {
  [cmd: string]: (a: number[]) => PDFOperator | PDFOperator[];
}

const runners: CmdToOperatorsMap = {
  M(a) {
    cx = a[0];
    cy = a[1];
    px = py = null;
    sx = cx;
    sy = cy;
    return moveTo(cx, cy);
  },

  m(a) {
    cx += a[0];
    cy += a[1];
    px = py = null;
    sx = cx;
    sy = cy;
    return moveTo(cx, cy);
  },

  C(a) {
    cx = a[4];
    cy = a[5];
    px = a[2];
    py = a[3];
    return appendBezierCurve(a[0], a[1], a[2], a[3], a[4], a[5]);
  },

  c(a) {
    const cmd = appendBezierCurve(
      a[0] + cx,
      a[1] + cy,
      a[2] + cx,
      a[3] + cy,
      a[4] + cx,
      a[5] + cy,
    );
    px = cx + a[2];
    py = cy + a[3];
    cx += a[4];
    cy += a[5];
    return cmd;
  },

  S(a) {
    if (px === null || py === null) {
      px = cx;
      py = cy;
    }

    const cmd = appendBezierCurve(
      cx - (px - cx),
      cy - (py - cy),
      a[0],
      a[1],
      a[2],
      a[3],
    );
    px = a[0];
    py = a[1];
    cx = a[2];
    cy = a[3];
    return cmd;
  },

  s(a) {
    if (px === null || py === null) {
      px = cx;
      py = cy;
    }

    const cmd = appendBezierCurve(
      cx - (px - cx),
      cy - (py - cy),
      cx + a[0],
      cy + a[1],
      cx + a[2],
      cy + a[3],
    );
    px = cx + a[0];
    py = cy + a[1];
    cx += a[2];
    cy += a[3];
    return cmd;
  },

  Q(a) {
    px = a[0];
    py = a[1];
    cx = a[2];
    cy = a[3];
    return appendQuadraticCurve(a[0], a[1], cx, cy);
  },

  q(a) {
    const cmd = appendQuadraticCurve(
      a[0] + cx,
      a[1] + cy,
      a[2] + cx,
      a[3] + cy,
    );
    px = cx + a[0];
    py = cy + a[1];
    cx += a[2];
    cy += a[3];
    return cmd;
  },

  T(a) {
    if (px === null || py === null) {
      px = cx;
      py = cy;
    } else {
      px = cx - (px - cx);
      py = cy - (py - cy);
    }

    const cmd = appendQuadraticCurve(px, py, a[0], a[1]);
    px = cx - (px - cx);
    py = cy - (py - cy);
    cx = a[0];
    cy = a[1];
    return cmd;
  },

  t(a) {
    if (px === null || py === null) {
      px = cx;
      py = cy;
    } else {
      px = cx - (px - cx);
      py = cy - (py - cy);
    }

    const cmd = appendQuadraticCurve(px, py, cx + a[0], cy + a[1]);
    cx += a[0];
    cy += a[1];
    return cmd;
  },

  A(a) {
    const cmds = solveArc(cx, cy, a);
    cx = a[5];
    cy = a[6];
    return cmds;
  },

  a(a) {
    a[5] += cx;
    a[6] += cy;
    const cmds = solveArc(cx, cy, a);
    cx = a[5];
    cy = a[6];
    return cmds;
  },

  L(a) {
    cx = a[0];
    cy = a[1];
    px = py = null;
    return lineTo(cx, cy);
  },

  l(a) {
    cx += a[0];
    cy += a[1];
    px = py = null;
    return lineTo(cx, cy);
  },

  H(a) {
    cx = a[0];
    px = py = null;
    return lineTo(cx, cy);
  },

  h(a) {
    cx += a[0];
    px = py = null;
    return lineTo(cx, cy);
  },

  V(a) {
    cy = a[0];
    px = py = null;
    return lineTo(cx, cy);
  },

  v(a) {
    cy += a[0];
    px = py = null;
    return lineTo(cx, cy);
  },

  Z() {
    const cmd = closePath();
    cx = sx;
    cy = sy;
    return cmd;
  },

  z() {
    const cmd = closePath();
    cx = sx;
    cy = sy;
    return cmd;
  },
};

const solveArc = (x: number, y: number, coords: number[]) => {
  const [rx, ry, rot, large, sweep, ex, ey] = coords;
  const segs = arcToSegments(ex, ey, rx, ry, large, sweep, rot, x, y);

  const cmds: PDFOperator[] = [];
  for (const seg of segs) {
    const bez = segmentToBezier(...seg);
    cmds.push(appendBezierCurve(...bez));
  }
  return cmds;
};

type Segment = [number, number, number, number, number, number, number, number];
type Bezier = [number, number, number, number, number, number];

// from Inkscape svgtopdf, thanks!
const arcToSegments = (
  x: number,
  y: number,
  rx: number,
  ry: number,
  large: number,
  sweep: number,
  rotateX: number,
  ox: number,
  oy: number,
) => {
  const th = rotateX * (Math.PI / 180);
  const sinTh = Math.sin(th);
  const cosTh = Math.cos(th);
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  px = cosTh * (ox - x) * 0.5 + sinTh * (oy - y) * 0.5;
  py = cosTh * (oy - y) * 0.5 - sinTh * (ox - x) * 0.5;
  let pl = (px * px) / (rx * rx) + (py * py) / (ry * ry);
  if (pl > 1) {
    pl = Math.sqrt(pl);
    rx *= pl;
    ry *= pl;
  }

  const a00 = cosTh / rx;
  const a01 = sinTh / rx;
  const a10 = -sinTh / ry;
  const a11 = cosTh / ry;
  const x0 = a00 * ox + a01 * oy;
  const y0 = a10 * ox + a11 * oy;
  const x1 = a00 * x + a01 * y;
  const y1 = a10 * x + a11 * y;

  const d = (x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0);
  let sfactorSq = 1 / d - 0.25;
  if (sfactorSq < 0) {
    sfactorSq = 0;
  }
  let sfactor = Math.sqrt(sfactorSq);
  if (sweep === large) {
    sfactor = -sfactor;
  }

  const xc = 0.5 * (x0 + x1) - sfactor * (y1 - y0);
  const yc = 0.5 * (y0 + y1) + sfactor * (x1 - x0);

  const th0 = Math.atan2(y0 - yc, x0 - xc);
  const th1 = Math.atan2(y1 - yc, x1 - xc);

  let thArc = th1 - th0;
  if (thArc < 0 && sweep === 1) {
    thArc += 2 * Math.PI;
  } else if (thArc > 0 && sweep === 0) {
    thArc -= 2 * Math.PI;
  }

  const segments = Math.ceil(Math.abs(thArc / (Math.PI * 0.5 + 0.001)));
  const result: Segment[] = [];

  for (let i = 0; i < segments; i++) {
    const th2 = th0 + (i * thArc) / segments;
    const th3 = th0 + ((i + 1) * thArc) / segments;
    result[i] = [xc, yc, th2, th3, rx, ry, sinTh, cosTh];
  }

  return result;
};

const segmentToBezier = (
  cx1: number,
  cy1: number,
  th0: number,
  th1: number,
  rx: number,
  ry: number,
  sinTh: number,
  cosTh: number,
) => {
  const a00 = cosTh * rx;
  const a01 = -sinTh * ry;
  const a10 = sinTh * rx;
  const a11 = cosTh * ry;

  const thHalf = 0.5 * (th1 - th0);
  const t =
    ((8 / 3) * Math.sin(thHalf * 0.5) * Math.sin(thHalf * 0.5)) /
    Math.sin(thHalf);
  const x1 = cx1 + Math.cos(th0) - t * Math.sin(th0);
  const y1 = cy1 + Math.sin(th0) + t * Math.cos(th0);
  const x3 = cx1 + Math.cos(th1);
  const y3 = cy1 + Math.sin(th1);
  const x2 = x3 + t * Math.sin(th1);
  const y2 = y3 - t * Math.cos(th1);

  const result: Bezier = [
    a00 * x1 + a01 * y1,
    a10 * x1 + a11 * y1,
    a00 * x2 + a01 * y2,
    a10 * x2 + a11 * y2,
    a00 * x3 + a01 * y3,
    a10 * x3 + a11 * y3,
  ];
  return result;
};

export const svgPathToOperators = (path: string) => apply(parse(path));
