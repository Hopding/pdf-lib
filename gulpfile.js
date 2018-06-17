const gulp = require('gulp');
const ts = require('gulp-typescript');
const babel = require('gulp-babel');
const del = require('del');
const filter = require('gulp-filter');
const { execSync } = require('child_process');

const tsProject = ts.createProject('tsconfig.json');

const babelrc = {
  presets: ['env'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./dist/src'],
        alias: {
          core: './dist/src/core',
          utils: './dist/src/utils',
        },
      },
    ],
  ],
};

gulp.task('release-build', ['clean', 'build-ts-and-babel', 'clean-dist']);

gulp.task('clean', () => del('dist/**'));

const jsFilter = filter(['**/*.js'], { restore: true });

gulp.task('build', ['clean'], () =>
  tsProject
    .src()
    .pipe(tsProject())
    .pipe(jsFilter)
    .pipe(babel(babelrc))
    .pipe(jsFilter.restore)
    .pipe(gulp.dest('dist')),
);

gulp.task('clean-dist', ['build-ts-and-babel'], () =>
  del('dist/__integration_tests__/**'),
);

gulp.task('docs', () =>
  execSync(`rm -rf docs && yarn typedoc --options typedoc.js src/`),
);

const { version } = require('./package.json');

gulp.task('prepublish', () =>
  execSync(`
    rm -rf node_modules && \\
    yarn                && \\
    yarn lint           && \\
    yarn test:ci        && \\
    yarn docs           && \\
    yarn build          && \\
    git tag ${version}  && \\
    git push origin ${version}
  `),
);
