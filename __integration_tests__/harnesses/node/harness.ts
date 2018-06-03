import { execSync } from 'child_process';
import fs from 'fs';
import _ from 'lodash';

import * as tests from '../../tests';

// This needs to be more sophisticated to work on Linux and Windows as well.
const openPdf = (path: string) => execSync(`open ${path}`);

const writePdfToTmp = (pdf: Uint8Array) => {
  const path = `/tmp/${Date.now()}.pdf`;
  fs.writeFileSync(path, pdf);
  return path;
};

const assets = {
  fonts: {},
  images: {},
};

_(tests).forEach(({ kernel, description, checklist }) => {
  console.log('This is a test:', description);
  console.log('With this checklist:', checklist);

  const resultPdf = kernel(assets);
  const path = writePdfToTmp(resultPdf);

  console.log('File written to:', path);
  openPdf(path);
});
