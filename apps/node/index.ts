import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';

import test1 from './tests/test1';

// This needs to be more sophisticated to work on Linux and Windows as well.
const openPdf = (path: string) => {
  if (process.platform === 'darwin') {
    execSync(`open ${path}`);
  } else {
    const msg1 = `Note: Automatically opening PDFs currently only works on Macs. If you're using a Windows or Linux machine, please consider contributing to expand support for this feature`;
    const msg2 = `(https://github.com/Hopding/pdf-lib/blob/master/apps/node/index.ts#L8-L17)\n`;
    console.warn(msg1);
    console.warn(msg2);
  }
};

const writePdfToTmp = (pdf: Uint8Array) => {
  const path = `${os.tmpdir()}/${Date.now()}.pdf`;
  fs.writeFileSync(path, pdf);
  return path;
};

const main = async () => {
  const tests = [test1];

  let idx = 1;
  for (const test of tests) {
    console.log(`Running test #${idx}`);
    const pdfBytes = await test();
    const path = writePdfToTmp(pdfBytes);
    console.log(`PDF written to: ${path}`);
    openPdf(path);
    idx += 1;
  }
};

main();
