import path from 'path';

import alias from 'rollup-plugin-alias';
import multiEntry from 'rollup-plugin-multi-entry';
import typescript from 'rollup-plugin-typescript2';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

// export default {
//   input: 'dist/**/*.js',
//   output: {
//     format: 'umd',
//     name: 'PDFLib',
//   },
//   plugins: [
//     // typescript({
//     //   exclude: ['src/*.d.ts', 'src/**/*.d.ts'],
//     // }),
//     multiEntry(),
//     // alias({
//     //   core: './dist/src/core',
//     //   helpers: './dist/src/helpers',
//     //   utils: './dist/src/utils',
//     // }),
//   ],
// };

export default {
  // input: 'dist/index.js',
  input: 'dist/**/*.js',
  output: {
    format: 'umd',
    name: 'PDFLib',
    // globals
  },
  plugins: [
    multiEntry(),
    // alias({
    //   // core: './src/core',
    //   // helpers: './src/helpers',
    //   // utils: './src/utils',
    //   core: path.join(__dirname, './dist/src/core'),
    //   // helpers: path.join(__dirname, './src/helpers'),
    //   // utils: path.join(__dirname, './src/utils'),
    // }),
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
