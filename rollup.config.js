import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';
import { plugin as analyze } from 'rollup-plugin-analyzer';

const { UGLIFY } = process.env;

export default {
  input: 'compiled/src/index.js',
  output: {
    name: 'PDFLib',
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
