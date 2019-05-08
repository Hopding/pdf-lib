import json from 'rollup-plugin-json';
import { terser } from 'rollup-plugin-terser';

const { MINIFY } = process.env;

export default {
  input: 'es/index.js',
  output: {
    name: 'PDFLib',
    format: 'umd',
  },
  plugins: [json(), MINIFY === 'true' && terser()],
};
