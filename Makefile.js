// https://github.com/shelljs/shelljs#command-reference
// https://devhints.io/shelljs
// https://github.com/shelljs/shelljs/wiki/The-make-utility
require('shelljs/make');

config.fatal = true;
config.verbose = true;

const inquirer = require('inquirer');
const relative = require('relative');
const { execFileSync } = require('child_process');
const packageJson = require('./package.json');

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

/* =============================== Release ================================== */

const prepareRelease = async () => {
  target.clean();

  const { integrationTestsHaveBeenRun } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'integrationTestsHaveBeenRun',
      message: `Have you run the integration tests?`,
      default: false,
    },
  ]);

  if (integrationTestsHaveBeenRun) {
    exec('yarn install --check-files');
    target.lint();
    exec('yarn test:ci');
    target.build();
  } else {
    console.error(
      'Please run the integration tests with `yarn it:node` before releasing.',
    );
  }

  return integrationTestsHaveBeenRun;
};

target.releaseNext = async () => {
  const version = `${packageJson.version}@next`;
  console.log('Releasing version', version);

  const readyForRelease = await prepareRelease();
  if (!readyForRelease) return;

  cd('compiled');
  execFileSync('yarn', ['publish', '--tag', 'next'], { stdio: 'inherit' });
};

target.releaseLatest = async () => {
  const currentBranch = exec('git rev-parse --abbrev-ref HEAD').stdout.trim();
  if (currentBranch !== 'master') {
    console.error('Must be on `master` branch to cut an @latest release.');
    return;
  }

  const version = `${packageJson.version}@latest`;
  console.log('Releasing version', version);

  const readyForRelease = await prepareRelease();
  if (!readyForRelease) return;

  const { enteredVersion } = await inquirer.prompt([
    {
      type: 'input',
      name: 'enteredVersion',
      message: `Enter "${version}" to proceed with the release:`,
    },
  ]);
  if (enteredVersion !== version) {
    console.error('Entered version does match. Aborting release.');
    return;
  }

  cd('compiled');
  execFileSync('yarn', ['publish', '--tag', 'latest'], { stdio: 'inherit' });
  cd('..');
  console.log();

  const tagName = `v${packageJson.version}`;
  exec(`git commit -am 'Bump version to ${packageJson.version}'`);
  exec('git push');
  exec(`git tag ${tagName}`);
  exec(`git push origin ${tagName}`);
  console.log('Created git tag:', tagName);

  const zipName = `pdf-lib_${tagName}.zip`;
  exec(`zip -r ${zipName} compiled`);
  console.log('Zip archive of', tagName, 'written to', zipName);

  console.log('🎉   Release of', version, 'complete!  🎉');
};

/* ==================== Linting / Docs / Perf Testing ======================= */

target.lint = () => {
  const lintDirs = '{__integration_tests__,__tests__,examples,src}';
  exec(`prettier --loglevel error --write "${lintDirs}/**/*.{ts,js}"`);
  exec('tslint --project ./tsconfig.json --fix');
};

target.docs = () => {
  rm('-rf', 'docs');
  exec('typedoc --options typedoc.js src/');
};

target.runFlamebearerTest = () => {
  target.clean();
  rm('-f', 'isolate*.log');

  exec('tsc');

  env.NODE_PATH = './compiled/src';
  exec('node --prof compiled/__integration_tests__/runners/node/index.js');

  exec('node --prof-process --preprocess -j isolate*.log', {
    silent: true,
  }).exec('flamebearer');
};

/* ============================ Build Project =============================== */

target.clean = () => {
  rm('-rf', 'compiled');
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
  exec('tsc --module CommonJS --outDir compiled/lib');
  exec('tsc --module ES2015 --outDir compiled/es');
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
  exec(`rollup -c rollup.config.js -o compiled/dist/pdf-lib.js`);
};

target.rollupUMDMin = () => {
  target.convertAbsoluteImportsToRelative();
  env.UGLIFY = true;
  exec(`rollup -c rollup.config.js -o compiled/dist/pdf-lib.min.js`);
};
