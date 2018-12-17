# Contributing to pdf-lib

:+1::tada: First off, thanks for taking the time to contribute! :tada::+1:

`pdf-lib` is a TypeScript project designed to create and modify PDF files in any JavaScript environment. We welcome contributions from the open source community! Please read through this document to learn how to setup and run the project on your machine. If you have any questions or run into trouble, please [create an issue](https://github.com/Hopding/pdf-lib/issues/new).

### Table Of Contents

* [Local Setup and Prerequisites](#local-setup-and-prerequisites)
* [Running the Unit Tests](#running-the-unit-tests)
* [Running the Integration Tests](#running-the-integration-tests)
* [Compiling the Project](#compiling-the-project)
* [Running the Linter](#running-the-linter)
* [Running the Type Checker](#running-the-type-checker)

## Local Setup And Prerequisites

You can develop `pdf-lib` on Windows, Mac, or Linux machines. While most of the original code was developed on a Mac, care has been taken to ensure that all scripts and commands needed for development are platform independent. (If you find anything that doesn't work on your machine/platform, please [create an issue](https://github.com/Hopding/pdf-lib/issues/new) or submit a PR!)

In order to work on `pdf-lib`, please ensure you have installed the following:

* **Node.js** provides the runtime needed to run this project. ([Installation instructions](https://nodejs.org/en/download/)).
* **Yarn** is the package manager used for this project. ([Installation instructions](https://yarnpkg.com/en/docs/install)).
* **Git** is the SCM used for this project. ([Installation instructions](https://git-scm.com/downloads))

Next you'll need to clone the project:

```
git clone https://github.com/Hopding/pdf-lib.git
cd pdf-lib
```

After cloning the project, you'll need to install the dependencies. All dependencies are managed within the `package.json` file. This means all you have to do is run:

```
yarn install
```

If you don't see any errors or warnings, then everything should have worked correctly. The next thing you'll want to do is [run the unit tests](#running-the-unit-tests) to verify that everything is is good shape.

## Running the Unit Tests
We use the [Jest](https://jestjs.io/) framework to write unit tests for `pdf-lib`. All unit tests are kept in the [`__tests__`](https://github.com/Hopding/pdf-lib/tree/master/__tests__) directory.

To run the unit tests, execute the following:

```
yarn test
```

This should output something like:

```
yarn run v1.12.3
$ jest --runInBand --no-coverage
 PASS  __tests__/core/pdf-parser/parseObjectStream.spec.ts
 PASS  __tests__/core/pdf-document/PDFObjectCopier.spec.ts
 PASS  __tests__/core/pdf-structures/PDFStandardFontFactory.spec.ts
 ...
 PASS  __tests__/core/pdf-objects/PDFStream.spec.ts
 PASS  __tests__/core/pdf-objects/PDFBoolean.spec.ts
 PASS  __tests__/utils/index.spec.ts

Test Suites: 85 passed, 85 total
Tests:       698 passed, 698 total
Snapshots:   1 passed, 1 total
Time:        8.178s
Ran all test suites.
✨  Done in 8.64s.
```

Hopefully you see that all the tests passed! But if you see errors or warnings, then something must be wrong with your setup. Please ensure you've following the installation steps outlined in the [local setup and prerequisites section](#local-setup-and-prerequisites). If you still can't get the tests running after following these steps, then please [create an issue](https://github.com/Hopding/pdf-lib/issues/new) explaining the problem you're having.

## Running the Integration Tests
In addition to unit tests, we maintain a suite of integration tests. All integration tests are kept in the [`__integration_tests__/tests`](https://github.com/Hopding/pdf-lib/tree/master/__integration_tests__/tests) directory. The goal of these tests is to ensure the project as a whole works correctly, whereas the unit tests ensure individual classes and functions work correctly. The integration tests take longer to run than the unit tests. They also require manual inspection of the PDFs they create to make sure nothing is broken, whereas the unit tests are entirely automatic (they pass/fail without human input).

To run the integration tests, execute the following:

```
yarn it:node
```

This should output something like:

```
yarn run v1.12.3
$ ts-node --module commonjs -r tsconfig-paths/register __integration_tests__/runners/node/index.ts
=====================
= PDF Creation Test =
=====================
This test verifies that a PDF can be created from scratch.
It ensures that we can manipulate the PDF's pages, add fonts and images, and use valid content stream operators.

> PDF file written to: /some/file/path.pdf

? Confirm that there are three pages. (Y/n)
```

There are a few things to be aware of at this point:

* The PDF Creation Test is being run
* The test has generated a PDF file and saved it to `/some/file/path.pdf`
* You are being asked to inspect the generated PDF and confirm that it contains three pages

If you are on a Mac, the PDF will be automatically opened for you. If you're on a Windows or Linux machine, you'll have to open the PDF yourself. Either way, once the document is opened, confirm that it contains three pages, and then hit `<ENTER>`. The test will continue to ask you to verify certain things about the document. Once you finish verifying the document, you will see the following:

```
✅   Test Passed
```

The next integration test will now be started. It will generate a PDF and ask you to verify some things about it. This process will continue until all of the integration tests have been run.

## Compiling the Project
For most development, manual compilation isn't necessary. The unit and integration tests are usually all you need to test your code changes. But manual compilation is sometimes necessary. For example, it is required to build the project in preparation for releasing a new version.

Compiling the project will produce 4 artifacts:

* `compiled/lib` - a directory containing a CommonJS version of the project (uses `require` instead of `import`). This folder contains `.js` and [`.d.ts`](https://stackoverflow.com/a/21247316) files, rather than the `.ts` files that the project source is written in.
* `compiled/es` - a directory containing an ES2015 version of the project (uses `import` instead of `require`). This folder contains `.js` and [`.d.ts`](https://stackoverflow.com/a/21247316) files, rather than the `.ts` files that the project source is written in.
* `compiled/dist/pdf-lib.js` - a single JavaScript file containing a [UMD](https://www.davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/) version of the project.
* `compiled/dist/pdf-lib.min.js` - a single JavaScript file containing a minified [UMD](https://www.davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/) version of the project.

To compile the project, execute the following:
```
yarn make build
```
(Note: `build` is a target specified in the [`Makefile.js`](https://github.com/Hopding/pdf-lib/tree/master/Makefile.js) file)

This should output something like the following:

```
yarn run v1.12.3
$ node Makefile.js build
rm -rf compiled
exec tsc --module CommonJS --outDir compiled/lib
exec tsc --module ES2015 --outDir compiled/es
cd compiled/lib/src
Replacing absolute imports with relative imports in: compiled/lib/src
cd ../../..
cd compiled/es/src
Replacing absolute imports with relative imports in: compiled/es/src
cd ../../..
exec rollup -c rollup.config.js -o compiled/dist/pdf-lib.js
... (omitted rollup output - contains warnings about circular dependencies and `this` being rewritten to `undefined`)
created compiled/dist/pdf-lib.js in 4.3s
exec rollup -c rollup.config.js -o compiled/dist/pdf-lib.min.js
... (omitted rollup output - contains warnings about circular dependencies and `this` being rewritten to `undefined`)
created compiled/dist/pdf-lib.min.js in 21.5s
cp -r package.json README.md LICENSE.md compiled/
rm -rf compiled/lib/__integration_tests__
rm -rf compiled/es/__integration_tests__
mv compiled/lib/src/* compiled/lib
mv compiled/es/src/* compiled/es
rm -rf compiled/lib/src compiled/es/src
✨  Done in 34.37s.
```

As stated above, the compiled artifacts are located in the `compiled/` directory.

## Running the Linter
We use two linters to keep `pdf-lib`'s source code clean, tidy, and consistent:
* [**TSLint**](https://palantir.github.io/tslint/)
* [**Prettier**](https://prettier.io/)

It is recommended that you setup your editor to automatically run these linters for you (either on save, or some other keyboard shortcut). However, this is not required. The linters can be run from the command line as well.

To run the linter, execute the following:

```
yarn lint
```

This should output something like the following:

```
yarn run v1.12.3
$ node Makefile.js lint
exec prettier --loglevel error --write "{__integration_tests__,__tests__,examples,src}/**/*.{ts,js}"
exec tslint --project ./tsconfig.json --fix
Fixed 2 error(s) in .../pdf-lib/__integration_tests__/tests/test1.ts
✨  Done in 10.56s.
```

The linter is very strict about the format and style of your code. Anytime it finds something that doesn't comply with the project's formatting and style standards, it will try to automatically rewrite the file to comply. Note that not all linter errors can be fixed automatically. You will have to manually fix those that can't.

## Running the Type Checker
`pdf-lib` is written in TypeScript. This means that the project's source code is contained in `.ts` files. All source code must be correctly typed in order for the tests to run, and for the project to compile.

To run the type checker, execute the following:

```
yarn typecheck
```

This should output something like the following:

```
yarn run v1.12.3
$ tsc --noEmit
✨  Done in 2.63s.
```

This means your code is correctly typed. If the command fails, then your code has incorrect or missing types somewhere.
