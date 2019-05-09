import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';
import { terser } from 'rollup-plugin-terser';

const { MINIFY } = process.env;

export default {
  input: 'es/index.js',
  output: {
    name: 'PDFLib',
    format: 'umd',
  },
  plugins: [resolve(), json(), MINIFY === 'true' && terser()],
};
