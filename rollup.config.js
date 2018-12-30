import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import { terser } from 'rollup-plugin-terser';
import { plugin as analyze } from 'rollup-plugin-analyzer';
import visualizer from 'rollup-plugin-visualizer';

const { UGLIFY } = process.env;

export default {
  input: 'compiled/es/src/index.js',
  output: {
    name: 'PDFLib',
    format: 'umd',
    strict: false,
  },
  plugins: [
    // analyze(),
    // visualizer({
    //   // sourcemap: true,
    //   open: true,
    // }),
    json(),
    nodeResolve({
      jsnext: true,
    }),
    commonjs({
      namedExports: {
        'node_modules/lodash/index.js': ['default'],
      },
    }),
    UGLIFY === 'true' && terser(),
  ],
};
