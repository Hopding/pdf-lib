import { Assets } from '../index.ts';

// @deno-types="../dummy.d.ts"
import { PDFDocument } from '../../../dist/pdf-lib.esm.js';

export default async (assets: Assets) => {
  const pdfDoc = await PDFDocument.load(assets.pdfs.form_to_flatten);

  const form = pdfDoc.getForm();

  form.getTextField('Text1').setText('Some Text');

  form.getRadioGroup('Group2').select('Choice1');
  form.getRadioGroup('Group3').select('Choice3');
  form.getRadioGroup('Group4').select('Choice1');

  form.getCheckBox('Check Box3').check();
  form.getCheckBox('Check Box4').uncheck();

  form.getDropdown('Dropdown7').select('Infinity');

  form.getOptionList('List Box6').select('Honda');

  form.flatten();

  const pdfBytes = await pdfDoc.save();

  return pdfBytes;
};
