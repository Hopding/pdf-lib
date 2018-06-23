import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';
import { plugin as analyze } from 'rollup-plugin-analyzer';

const { UGLIFY } = process.env;

export default {
  input: 'compiled/es/src/index.js',
  output: {
    name: 'PDFLib',
    format: 'umd',
  },
  plugins: [
    analyze(),
    nodeResolve({
      jsnext: true,
    }),
    commonjs({
      namedExports: {
        'node_modules/lodash/index.js': ['default'],
      },
    }),
    UGLIFY === 'true' && uglify(),
  ],
};
