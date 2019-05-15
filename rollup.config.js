import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import { terser } from 'rollup-plugin-terser';

const { MINIFY } = process.env;

export default {
  input: 'es/index.js',
  output: {
    name: 'PDFLib',
    format: 'umd',
  },
  plugins: [resolve(), commonjs(), json(), MINIFY === 'true' && terser()],
};
