const gulp = require('gulp');
const ts = require('gulp-typescript');
const replace = require('gulp-replace');

const del = require('del');
const relative = require('relative');

const { execSync } = require('child_process');
const path = require('path');

/* ============================ Build Project =============================== */

gulp.task('prepare-release', () =>
  execSync(`
    rm -rf node_modules && \\
    yarn                && \\
    yarn lint           && \\
    yarn test:ci
  `),
);

gulp.task('build-release', ['abs-to-rel', 'rollup'], () =>
  execSync(`
    cp -r  package.json README.md LICENSE.md compiled/ && \\
    rm -rf compiled/lib/__integration_tests__          && \\
    rm -rf compiled/es/__integration_tests__           && \\
    mv compiled/lib/src/* compiled/lib                 && \\
    mv compiled/es/src/* compiled/es                   && \\
    rm -rf compiled/lib/src compiled/es/src
  `),
);

gulp.task('build-dev', ['abs-to-rel', 'rollup']);

/* ========================= Compile TypeScript ============================= */

gulp.task('clean', () => del('compiled/**'));

gulp.task('ts-compile', ['clean', 'ts-compile-commonjs', 'ts-compile-es2015']);

const tsProject = {
  commonjs: ts.createProject('tsconfig.json', { module: 'commonjs' }),
  es2015: ts.createProject('tsconfig.json', { module: 'es2015' }),
};

gulp.task('ts-compile-commonjs', ['clean'], () =>
  tsProject.commonjs
    .src()
    .pipe(tsProject.commonjs())
    .pipe(gulp.dest('compiled/lib')),
);

gulp.task('ts-compile-es2015', ['clean'], () =>
  tsProject.es2015
    .src()
    .pipe(tsProject.es2015())
    .pipe(gulp.dest('compiled/es')),
);

/* =============== Convert Absolute Paths to Relative Paths ================= */

gulp.task('abs-to-rel', ['abs-to-rel-commonjs', 'abs-to-rel-es2015']);

const replacePaths = (moduleTypeDir) => {
  const absolutePathToDir = (dir) =>
    `${__dirname}/compiled/${moduleTypeDir}/src/${dir}/`;

  return replace(
    /(import ['"]|from ['"]|require\(['"])(core|helpers|utils)/g,
    function(match, importOrRequire, dirName) {
      const relativePathToDir = relative(
        this.file.path,
        absolutePathToDir(dirName),
      );
      if (relativePathToDir === dirName) {
        return `${importOrRequire}./${dirName}`;
      }
      return `${importOrRequire}${relativePathToDir}`;
    },
  );
};

gulp.task('abs-to-rel-commonjs', ['ts-compile-commonjs'], () =>
  gulp
    .src('compiled/lib/src/**/*')
    .pipe(replacePaths('lib'))
    .pipe(gulp.dest('compiled/lib/src')),
);

gulp.task('abs-to-rel-es2015', ['ts-compile-es2015'], () =>
  gulp
    .src('compiled/es/src/**/*')
    .pipe(replacePaths('es'))
    .pipe(gulp.dest('compiled/es/src')),
);

/* =============================== Rollup =================================== */

gulp.task('rollup', ['rollup-umd', 'rollup-umd-min']);

const rollup = (minify) => () =>
  execSync(`
    export UGLIFY=${minify}; \\
    yarn rollup              \\
      -c rollup.config.js    \\
      -o compiled/dist/pdf-lib${minify ? '.min' : ''}.js \\
  `);

gulp.task('rollup-umd', ['abs-to-rel-es2015'], rollup());
gulp.task('rollup-umd-min', ['abs-to-rel-es2015'], rollup(true));
