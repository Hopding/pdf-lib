const gulp = require('gulp');
const ts = require('gulp-typescript');
const babel = require('gulp-babel');
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

gulp.task('build', () =>
  tsProject
    .src()
    .pipe(tsProject())
    .js.pipe(babel(babelrc))
    .pipe(gulp.dest('dist')),
);

gulp.task('docs', () =>
  execSync(`
    yarn typedoc       \\
      --theme markdown \\
      --out   docs     \\
      src/core/pdf-operators/helpers
  `),
);
