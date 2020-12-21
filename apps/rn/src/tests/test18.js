import { PDFDocument } from 'pdf-lib';

import { fetchAsset } from './assets';

export default async () => {
  const formToFlattenPdf = await fetchAsset('pdfs/form_to_flatten.pdf');

  const pdfDoc = await PDFDocument.load(formToFlattenPdf);

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

  const base64Pdf = await pdfDoc.saveAsBase64({ dataUri: true });

  return { base64Pdf };
};
