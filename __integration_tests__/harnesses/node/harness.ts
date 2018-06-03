import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs';
import inquirer from 'inquirer';
import _ from 'lodash';

import * as tests from '../../tests';

const { log } = console;

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

const renderTitle = (title: string) => {
  const borderLine = '='.repeat(title.length + 4);
  log(borderLine);
  log(`= ${chalk.bold(title)} =`);
  log(borderLine);
};

const renderChecklist = async (checklist: string[]) => {
  const failed = [] as string[];
  for (const item of checklist) {
    await inquirer
      .prompt([
        { type: 'confirm', name: 'confirmed', message: `Confirm that ${item}` },
      ])
      .then(({ confirmed }) => {
        if (!confirmed) failed.push(item);
      });
  }

  log();
  if (failed.length === 0) {
    log('✅   Test Passed');
  } else {
    log('❌   Test Failed');
  }
};

const main = async () => {
  for (const { kernel, title, description, checklist } of _.values(tests)) {
    renderTitle(title);
    log(description);
    const resultPdf = kernel(assets);
    const path = writePdfToTmp(resultPdf);

    log();
    log(`${chalk.bold('>')} PDF file written to: ${chalk.underline(path)}`);
    log();

    openPdf(path);
    await renderChecklist(checklist);
    log();
  }
};

main();
