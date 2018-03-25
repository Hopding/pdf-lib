const gulp = require('gulp');
const ts = require('gulp-typescript');
const babel = require('gulp-babel');
const exec = require('gulp-exec');

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

gulp.task('lint', () =>
  exec(`
    yarn prettier 
      --config ./.prettierrc.json 
      --loglevel error 
      --write \"{src,integration-tests,__tests__}/**/*.ts\" 
    && 
    tslint 
      --project ./tsconfig.json 
      --fix
  `),
);
