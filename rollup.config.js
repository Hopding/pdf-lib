import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'compiled/src/index.js',
  output: {
    name: 'PDFLib',
  },
  plugins: [
    nodeResolve({
      jsnext: true,
    }),
    commonjs({
      namedExports: {
        'node_modules/lodash/index.js': ['default'],
      },
    }),
  ],
};
