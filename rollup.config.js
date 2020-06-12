import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';

const { MINIFY, MODULE_TYPE } = process.env;

const IgnoredWarnings = [
  // Mac & Linux
  'Circular dependency: es/api/PDFDocument.js -> es/api/PDFFont.js -> es/api/PDFDocument.js',
  'Circular dependency: es/api/PDFDocument.js -> es/api/PDFImage.js -> es/api/PDFDocument.js',
  'Circular dependency: es/api/PDFDocument.js -> es/api/PDFPage.js -> es/api/PDFDocument.js',
  'Circular dependency: es/api/PDFDocument.js -> es/api/PDFEmbeddedPage.js -> es/api/PDFDocument.js',
  'Circular dependency: es/api/PDFDocument.js -> es/api/PDFOutline.js -> es/api/PDFDocument.js',
  'Circular dependency: es/api/PDFDocument.js -> es/api/PDFOutline.js -> es/api/PDFPage.js -> es/api/PDFDocument.js',

  // Windows
  'Circular dependency: es\\api\\PDFDocument.js -> es\\api\\PDFFont.js -> es\\api\\PDFDocument.js',
  'Circular dependency: es\\api\\PDFDocument.js -> es\\api\\PDFImage.js -> es\\api\\PDFDocument.js',
  'Circular dependency: es\\api\\PDFDocument.js -> es\\api\\PDFPage.js -> es\\api\\PDFDocument.js',
  'Circular dependency: es\\api\\PDFDocument.js -> es\\api\\PDFEmbeddedPage.js -> es\\api\\PDFDocument.js',
  'Circular dependency: es\\api\\PDFDocument.js -> es\\api\\PDFOutline.js -> es\\api\\PDFDocument.js',
  'Circular dependency: es\\api\\PDFDocument.js -> es\\api\\PDFOutline.js -> es\\api\\PDFPage.js -> es\\api\\PDFDocument.js',
];

// Silence circular dependency warnings we don't care about
const onwarn = (warning, warn) => {
  if (IgnoredWarnings.includes(warning.message)) return;
  warn(warning);
};

export default {
  onwarn,
  input: 'es/index.js',
  output: {
    name: 'PDFLib',
    format: MODULE_TYPE,
    sourcemap: true,
  },
  plugins: [resolve(), commonjs(), json(), MINIFY === 'true' && terser()],
};