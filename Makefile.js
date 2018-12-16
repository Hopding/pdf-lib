// https://github.com/shelljs/shelljs#command-reference
// https://devhints.io/shelljs
// https://github.com/shelljs/shelljs/wiki/The-make-utility
require('shelljs/make');

config.fatal = true;
config.verbose = true;

const relative = require('relative');

/* ========================= Help / List Targets ============================ */

['all', 'help', 'list', 'targets'].forEach((targetName) => {
  target[targetName] = () => {
    console.log('\nUsage: yarn make [target]\n');
    console.log('The available targets are:\n');
    Object.keys(target)
      .filter((key) => !['all', 'help', 'list', 'targets'].includes(key))
      .forEach((key) => console.log('  ' + key));
    console.log();
  };
});

/* ==================== Linting / Docs / Perf Testing ======================= */

target.lint = () => {
  const lintDirs = '{__integration_tests__,__tests__,examples,src}';
  exec(`prettier --loglevel error --write "${lintDirs}/**/*.{ts,js}"`);
  exec('tslint --project ./tsconfig.json --fix');
};

/* ============================ Build Project =============================== */

target.clean = () => {
  rm('-rf', 'compiled');
};

target.prerelease = () => {
  exec('yarn install --check-files');
  exec('yarn lint');
  exec('yarn test:ci');
};

target.build = () => {
  target.clean();
  target.compileTS();
  target.convertAbsoluteImportsToRelative();
  target.rollupUMD();
  target.rollupUMDMin();

  cp('-r', 'package.json', 'README.md', 'LICENSE.md', 'compiled/');
  rm('-rf', 'compiled/lib/__integration_tests__');
  rm('-rf', 'compiled/es/__integration_tests__');
  mv('compiled/lib/src/*', 'compiled/lib');
  mv('compiled/es/src/*', 'compiled/es');
  rm('-rf', 'compiled/lib/src', 'compiled/es/src');
};

target.compileTS = () => {
  target.clean();
  exec('yarn tsc --module CommonJS --outDir compiled/lib');
  exec('yarn tsc --module ES2015 --outDir compiled/es');
};

target.convertAbsoluteImportsToRelative = () => {
  target.compileTS();

  const pattern = /(import ['"]|from ['"]|require\(['"])(core|helpers|utils)/g;

  ['lib', 'es'].forEach((moduleType) => {
    const workingDir = `compiled/${moduleType}/src`;
    const absolutePathToDir = (dir) => `${__dirname}/${workingDir}/${dir}/`;

    cd(workingDir);

    console.log(
      'Replacing absolute imports with relative imports in:',
      workingDir,
    );

    config.verbose = false;
    ls('-R', './**/*.{js,d.ts}').forEach((file) => {
      const replacer = (match, importOrRequire, dirName) => {
        const relativePathToDir = relative(file, absolutePathToDir(dirName));
        return relativePathToDir === dirName
          ? `${importOrRequire}./${dirName}`
          : `${importOrRequire}${relativePathToDir}`;
      };

      sed('-i', pattern, replacer, file);
    });
    config.verbose = true;

    cd('../../..');
  });
};

target.rollupUMD = () => {
  target.convertAbsoluteImportsToRelative();
  env.UGLIFY = false;
  exec(`yarn rollup -c rollup.config.js -o compiled/dist/pdf-lib.js`);
};

target.rollupUMDMin = () => {
  target.convertAbsoluteImportsToRelative();
  env.UGLIFY = true;
  exec(`yarn rollup -c rollup.config.js -o compiled/dist/pdf-lib.min.js`);
};
