import type { QuantizeResult } from './types';

/** Raw second-moment accumulators for a set of RGBA samples. */
interface Stats {
  R: number[];
  m: number[];
  N: number;
}

/** Derived statistics: covariance, mean, principal axis and palette color. */
interface EStats {
  Cov: number[];
  q: number[];
  e: number[];
  L: number;
  eMq255: number;
  eMq: number;
  rgba: number;
}

/** Node of the color-space KD-tree; leaves become palette entries. */
export interface KDNode {
  i0: number;
  i1: number;
  bst: Stats;
  est: EStats;
  tdst: number;
  ind: number;
  left: KDNode | null;
  right: KDNode | null;
}

const M4 = {
  multVec(m: number[], v: number[]): number[] {
    return [
      m[0] * v[0] + m[1] * v[1] + m[2] * v[2] + m[3] * v[3],
      m[4] * v[0] + m[5] * v[1] + m[6] * v[2] + m[7] * v[3],
      m[8] * v[0] + m[9] * v[1] + m[10] * v[2] + m[11] * v[3],
      m[12] * v[0] + m[13] * v[1] + m[14] * v[2] + m[15] * v[3],
    ];
  },
  dot(x: number[], y: number[]): number {
    return x[0] * y[0] + x[1] * y[1] + x[2] * y[2] + x[3] * y[3];
  },
  sml(a: number, y: number[]): number[] {
    return [a * y[0], a * y[1], a * y[2], a * y[3]];
  },
};

function stats(nimg: Uint8Array, i0: number, i1: number): Stats {
  const R = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const m = [0, 0, 0, 0];
  const N = (i1 - i0) >> 2;

  for (let i = i0; i < i1; i += 4) {
    const r = nimg[i] * (1 / 255);
    const g = nimg[i + 1] * (1 / 255);
    const b = nimg[i + 2] * (1 / 255);
    const a = nimg[i + 3] * (1 / 255);
    m[0] += r;
    m[1] += g;
    m[2] += b;
    m[3] += a;

    R[0] += r * r;
    R[1] += r * g;
    R[2] += r * b;
    R[3] += r * a;
    R[5] += g * g;
    R[6] += g * b;
    R[7] += g * a;
    R[10] += b * b;
    R[11] += b * a;
    R[15] += a * a;
  }
  R[4] = R[1];
  R[8] = R[2];
  R[9] = R[6];
  R[12] = R[3];
  R[13] = R[7];
  R[14] = R[11];

  return { R, m, N };
}

function estats(st: Stats): EStats {
  const R = st.R;
  const m = st.m;
  const N = st.N;

  // When all samples are equal but N is large, Rj can be non-zero (precision).
  const m0 = m[0];
  const m1 = m[1];
  const m2 = m[2];
  const m3 = m[3];
  const iN = N === 0 ? 0 : 1 / N;
  const Rj = [
    R[0] - m0 * m0 * iN,
    R[1] - m0 * m1 * iN,
    R[2] - m0 * m2 * iN,
    R[3] - m0 * m3 * iN,
    R[4] - m1 * m0 * iN,
    R[5] - m1 * m1 * iN,
    R[6] - m1 * m2 * iN,
    R[7] - m1 * m3 * iN,
    R[8] - m2 * m0 * iN,
    R[9] - m2 * m1 * iN,
    R[10] - m2 * m2 * iN,
    R[11] - m2 * m3 * iN,
    R[12] - m3 * m0 * iN,
    R[13] - m3 * m1 * iN,
    R[14] - m3 * m2 * iN,
    R[15] - m3 * m3 * iN,
  ];

  // Power iteration for the dominant eigenvector of the covariance matrix.
  let b = [Math.random(), Math.random(), Math.random(), Math.random()];
  let mi = 0;
  let tmi = 0;
  if (N !== 0) {
    for (let i = 0; i < 16; i++) {
      b = M4.multVec(Rj, b);
      tmi = Math.sqrt(M4.dot(b, b));
      b = M4.sml(1 / tmi, b);
      if (i !== 0 && Math.abs(tmi - mi) < 1e-9) break;
      mi = tmi;
    }
  }

  const q = [m0 * iN, m1 * iN, m2 * iN, m3 * iN];
  const eMq255 = M4.dot(M4.sml(255, q), b);

  return {
    Cov: Rj,
    q,
    e: b,
    L: mi,
    eMq255,
    eMq: M4.dot(b, q),
    rgba:
      ((Math.round(255 * q[3]) << 24) |
        (Math.round(255 * q[2]) << 16) |
        (Math.round(255 * q[1]) << 8) |
        Math.round(255 * q[0])) >>>
      0,
  };
}

function vecDot(nimg: Uint8Array, i: number, e: number[]): number {
  return (
    nimg[i] * e[0] +
    nimg[i + 1] * e[1] +
    nimg[i + 2] * e[2] +
    nimg[i + 3] * e[3]
  );
}

/** Partition samples in place around the plane `e·x = eMq`; returns the split. */
function splitPixels(
  nimg: Uint8Array,
  nimg32: Uint32Array,
  i0: number,
  i1: number,
  e: number[],
  eMq: number,
): number {
  i1 -= 4;
  while (i0 < i1) {
    while (vecDot(nimg, i0, e) <= eMq) i0 += 4;
    while (vecDot(nimg, i1, e) > eMq) i1 -= 4;
    if (i0 >= i1) break;

    const t = nimg32[i0 >> 2];
    nimg32[i0 >> 2] = nimg32[i1 >> 2];
    nimg32[i1 >> 2] = t;

    i0 += 4;
    i1 -= 4;
  }
  while (vecDot(nimg, i0, e) > eMq) i0 -= 4;
  return i0 + 4;
}

function planeDst(
  est: EStats,
  r: number,
  g: number,
  b: number,
  a: number,
): number {
  const e = est.e;
  return e[0] * r + e[1] * g + e[2] * b + e[3] * a - est.eMq;
}

function dist(q: number[], r: number, g: number, b: number, a: number): number {
  const d0 = r - q[0];
  const d1 = g - q[1];
  const d2 = b - q[2];
  const d3 = a - q[3];
  return d0 * d0 + d1 * d1 + d2 * d2 + d3 * d3;
}

function makeNode(i0: number, i1: number, bst: Stats): KDNode {
  return {
    i0,
    i1,
    bst,
    est: estats(bst),
    tdst: 0,
    ind: 0,
    left: null,
    right: null,
  };
}

/**
 * Build a KD-tree over `nimg` (reordered in place) with up to `ps` leaves.
 * Returns the root and the leaves sorted by descending pixel count.
 */
export function getKDtree(
  nimg: Uint8Array,
  ps: number,
  err = 0.0001,
): [KDNode, KDNode[]] {
  const nimg32 = new Uint32Array(nimg.buffer);

  const root = makeNode(0, nimg.length, stats(nimg, 0, nimg.length));
  const leafs: KDNode[] = [root];

  while (leafs.length < ps) {
    let maxL = 0;
    let mi = 0;
    for (let i = 0; i < leafs.length; i++) {
      if (leafs[i].est.L > maxL) {
        maxL = leafs[i].est.L;
        mi = i;
      }
    }
    if (maxL < err) break;
    const node = leafs[mi];

    const s0 = splitPixels(
      nimg,
      nimg32,
      node.i0,
      node.i1,
      node.est.e,
      node.est.eMq255,
    );
    if (node.i0 >= s0 || node.i1 <= s0) {
      node.est.L = 0;
      continue;
    }

    const ln = makeNode(node.i0, s0, stats(nimg, node.i0, s0));

    const rbst: Stats = { R: [], m: [], N: node.bst.N - ln.bst.N };
    for (let i = 0; i < 16; i++) rbst.R[i] = node.bst.R[i] - ln.bst.R[i];
    for (let i = 0; i < 4; i++) rbst.m[i] = node.bst.m[i] - ln.bst.m[i];
    const rn = makeNode(s0, node.i1, rbst);

    node.left = ln;
    node.right = rn;
    leafs[mi] = ln;
    leafs.push(rn);
  }

  leafs.sort((a, b) => b.bst.N - a.bst.N);
  for (let i = 0; i < leafs.length; i++) leafs[i].ind = i;
  return [root, leafs];
}

/** Exact nearest leaf lookup with plane-distance pruning. */
export function getNearest(
  nd: KDNode,
  r: number,
  g: number,
  b: number,
  a: number,
): KDNode {
  if (nd.left === null) {
    nd.tdst = dist(nd.est.q, r, g, b, a);
    return nd;
  }
  const pd = planeDst(nd.est, r, g, b, a);

  let node0 = nd.left;
  let node1 = nd.right!;
  if (pd > 0) {
    node0 = nd.right!;
    node1 = nd.left;
  }

  const ln = getNearest(node0, r, g, b, a);
  if (ln.tdst <= pd * pd) return ln;
  const rn = getNearest(node1, r, g, b, a);
  return rn.tdst < ln.tdst ? rn : ln;
}

function remap(inds: Uint8Array, tb32: Uint32Array, pl32: Uint32Array): void {
  for (let i = 0; i < inds.length; i++) tb32[i] = pl32[inds[i]];
}

function updatePalette(
  sb: Uint8Array,
  inds: Uint8Array,
  plte: Uint8Array,
): void {
  const K = plte.length >>> 2;
  const sums = new Uint32Array(K * 4);
  const cnts = new Uint32Array(K);

  for (let i = 0; i < sb.length; i += 4) {
    const ind = inds[i >>> 2];
    const qi = ind * 4;
    cnts[ind]++;
    sums[qi] += sb[i];
    sums[qi + 1] += sb[i + 1];
    sums[qi + 2] += sb[i + 2];
    sums[qi + 3] += sb[i + 3];
  }
  for (let i = 0; i < plte.length; i++) {
    plte[i] = Math.round(sums[i] / cnts[i >>> 2]);
  }
}

/** Assign every sample to its nearest palette color; returns the mean error. */
export function findNearest(
  sb: Uint8Array,
  inds: Uint8Array,
  plte: Uint8Array,
): number {
  let terr = 0;
  const K = plte.length >>> 2;

  // Squared half-distance to the nearest other palette color.
  const nd: number[] = [];
  for (let i = 0; i < K; i++) {
    const qi = i * 4;
    const r = plte[qi];
    const g = plte[qi + 1];
    const b = plte[qi + 2];
    const a = plte[qi + 3];
    let te = 1e9;
    for (let j = 0; j < K; j++) {
      if (i === j) continue;
      const qj = j * 4;
      const dr = r - plte[qj];
      const dg = g - plte[qj + 1];
      const db = b - plte[qj + 2];
      const da = a - plte[qj + 3];
      const err = dr * dr + dg * dg + db * db + da * da;
      if (err < te) te = err;
    }
    const hd = Math.sqrt(te) * 0.5;
    nd[i] = hd * hd;
  }

  for (let i = 0; i < sb.length; i += 4) {
    const r = sb[i];
    const g = sb[i + 1];
    const b = sb[i + 2];
    const a = sb[i + 3];
    let ti = inds[i >>> 2];
    let qi = ti * 4;
    let dr = r - plte[qi];
    let dg = g - plte[qi + 1];
    let db = b - plte[qi + 2];
    let da = a - plte[qi + 3];
    let te = dr * dr + dg * dg + db * db + da * da;
    if (te > nd[ti]) {
      for (let j = 0; j < K; j++) {
        qi = j * 4;
        dr = r - plte[qi];
        dg = g - plte[qi + 1];
        db = b - plte[qi + 2];
        da = a - plte[qi + 3];
        const err = dr * dr + dg * dg + db * db + da * da;
        if (err < te) {
          te = err;
          ti = j;
          if (te < nd[j]) break;
        }
      }
    }
    inds[i >>> 2] = ti;
    terr += te;
  }
  return terr / (sb.length >>> 2);
}

function kmeans(sb: Uint8Array, inds: Uint8Array, plte: Uint8Array): number {
  updatePalette(sb, inds, plte);
  return findNearest(sb, inds, plte);
}

/**
 * Reduce an RGBA8 buffer to at most `ps` colors using a KD-tree over the
 * color space, optionally refined with k-means.
 *
 * Returns the quantized RGBA buffer, the per-pixel palette indices and the
 * palette itself (leaf nodes, color in `est.rgba`).
 */
export function quantize(
  abuf: ArrayBuffer,
  ps: number,
  doKmeans?: boolean,
): QuantizeResult {
  const sb = new Uint8Array(abuf);
  const tb = sb.slice(0);
  const tb32 = new Uint32Array(tb.buffer);

  const [root, leafs] = getKDtree(tb, ps);
  const K = leafs.length;

  const cl32 = new Uint32Array(K);
  const clr8 = new Uint8Array(cl32.buffer);
  for (let i = 0; i < K; i++) cl32[i] = leafs[i].est.rgba;

  const len = sb.length;
  const inds = new Uint8Array(len >> 2);

  if (K <= 60) {
    findNearest(sb, inds, clr8);
    remap(inds, tb32, cl32);
  } else if (len < 32e6) {
    // Precise, but slow.
    for (let i = 0; i < len; i += 4) {
      const nd = getNearest(
        root,
        sb[i] * (1 / 255),
        sb[i + 1] * (1 / 255),
        sb[i + 2] * (1 / 255),
        sb[i + 3] * (1 / 255),
      );
      inds[i >> 2] = nd.ind;
      tb32[i >> 2] = nd.est.rgba;
    }
  } else {
    for (let i = 0; i < len; i += 4) {
      const r = sb[i] * (1 / 255);
      const g = sb[i + 1] * (1 / 255);
      const b = sb[i + 2] * (1 / 255);
      const a = sb[i + 3] * (1 / 255);
      let nd = root;
      while (nd.left) {
        nd = planeDst(nd.est, r, g, b, a) <= 0 ? nd.left : nd.right!;
      }
      inds[i >> 2] = nd.ind;
      tb32[i >> 2] = nd.est.rgba;
    }
  }

  if (doKmeans || len * K < 10 * 4e6) {
    let le = 1e9;
    for (let i = 0; i < 10; i++) {
      const ce = kmeans(sb, inds, clr8);
      if (ce / le > 0.997) break;
      le = ce;
    }
    for (let i = 0; i < K; i++) leafs[i].est.rgba = cl32[i];
    remap(inds, tb32, cl32);
  }

  return { abuf: tb.buffer as ArrayBuffer, inds, plte: leafs };
}
