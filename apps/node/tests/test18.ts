import { Assets } from '..';
import { PDFDocument } from '../../..';

export default async (assets: Assets) => {
  const pdfDoc = await PDFDocument.load(assets.pdfs.form_to_flatten);

  const form = pdfDoc.getForm();

  form.getTextField('Text1').setText('Some Text');
  
  form.getRadioGroup('Group2').select('Choice1');
  form.getRadioGroup('Group3').select('Choice3');
  form.getRadioGroup('Group4').select('Choice1');

  form.getCheckBox('Check Box3').check();
  form.getCheckBox('Check Box4').uncheck();
  
  form.flatten();

  const pdfBytes = await pdfDoc.save();

  return pdfBytes;
};
