import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import { terser } from 'rollup-plugin-terser';

const { MINIFY } = process.env;

const WarningBlacklist = [
  'Circular dependency: es/api/PDFDocument.js -> es/api/PDFFont.js -> es/api/PDFDocument.js',
  'Circular dependency: es/api/PDFDocument.js -> es/api/PDFImage.js -> es/api/PDFDocument.js',
  'Circular dependency: es/api/PDFDocument.js -> es/api/PDFPage.js -> es/api/PDFDocument.js',
];

// Silence circular dependency warnings we don't care about
const onwarn = (warning, warn) => {
  if (WarningBlacklist.includes(warning.message)) return;
  warn(warning);
};

export default {
  onwarn,
  input: 'es/index.js',
  output: {
    name: 'PDFLib',
    format: 'umd',
    sourcemap: true,
  },
  plugins: [resolve(), commonjs(), json(), MINIFY === 'true' && terser()],
};
