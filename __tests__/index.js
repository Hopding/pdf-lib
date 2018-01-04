/* eslint-disable no-restricted-syntax */
import _ from 'lodash';
import fs from 'fs';
import file from 'file';
import { writeToDebugFile } from '../src/utils';

import PDFDocumentFactory from '../src/core/pdf-document/PDFDocumentFactory';
import PDFParser from '../src/core/pdf-parser/PDFParser';

const testPdfsDir = `${__dirname}/../test-pdfs/pdf`;

const pdfParser = new PDFParser();
const testLoadPdf = filePath => {
  const bytes = fs.readFileSync(filePath);

  let parsedPdf;
  const time = Date.now();
  try {
    parsedPdf = pdfParser.parse(bytes);
  } catch (e) {
    return [
      null,
      {
        path: filePath,
        cause: 'PARSING',
        time: Date.now() - time,
        message: e.message,
      },
    ];
  }

  const dereferenceFailures = [];
  try {
    dereferenceFailures.push(...PDFDocumentFactory.normalize(parsedPdf));
    if (dereferenceFailures.length > 0) {
      return [
        null,
        {
          path: filePath,
          CAUSE: 'DEREFERENCE',
          time: Date.now() - time,
          message: 'Failed to dereference one or more references',
          dereferenceFailures,
        },
      ];
    }
    return [{ path: filePath, time: Date.now() - time }, null];
  } catch (e) {
    return [
      null,
      {
        path: filePath,
        CAUSE: 'NORMALIZE',
        time: Date.now() - time,
        message: e.message,
      },
    ];
  }
};

const testAllPdfs = () => {
  const allPdfs = [];
  file.walkSync(testPdfsDir, (dirPath, dirs, files) => {
    files.forEach(fileName => allPdfs.push(`${dirPath}/${fileName}`));
  });

  const successes = [];
  const errors = [];
  for (const pdf of allPdfs) {
    if (pdf.substring(pdf.length - 4) !== '.pdf') continue;
    console.log(`Parsing file: "${pdf}"`);
    const [success, error] = testLoadPdf(pdf);
    if (success) successes.push(success);
    else errors.push(error);
  }

  writeToDebugFile(JSON.stringify(successes, null, ' '), '-succeses');
  writeToDebugFile(JSON.stringify(errors, null, ' '), '-errors');
  console.log(`TOTAL FILES: ${allPdfs.length}`);
};

const successes = JSON.parse(fs.readFileSync(`${__dirname}/../debug-succeses`));
const errors = JSON.parse(fs.readFileSync(`${__dirname}/../debug-errors`));

const total = successes.length + errors.length;
console.log(`Total successes: ${successes.length}`);
console.log(`Total errors: ${errors.length}`);
console.log(`Total attempts: ${total}`);
console.log(`Success Rate: ${successes.length / total}`);
console.log(`Failure Rate: ${errors.length / total}`);

// const typeCount = {};
const drFailures = {};
errors.forEach(error => {
  if (error.dereferenceFailures) {
    _(error.dereferenceFailures)
      .flattenDeep()
      .filter(str => str.charAt(0) === '/' || str.charAt(0) === 'A')
      .forEach(key => {
        if (!drFailures[key]) drFailures[key] = 1;
        else drFailures[key] += 1;
      });
  }
  // if (error.message && error.message.includes('dereference')) {
  // const [type] = error.message.match(/\(([^]*,)/);
  // if (!typeCount[type]) typeCount[type] = 1;
  // else typeCount[type] += 1;
  // }
});

console.log(
  _(drFailures)
    .pickBy(count => count < 25)
    .value(),
);
console.log('================================================================');
console.log(
  _(drFailures)
    .pickBy(count => count > 25)
    .value(),
);

// testAllPdfs();
