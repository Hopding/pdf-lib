import { Assets } from '..';
import { PDFDocument } from '../../..';

export default async (assets: Assets) => {
  const { pdfs } = assets;

  const pdfDoc = await PDFDocument.load(pdfs.with_xfa_fields);

  const form = pdfDoc.getForm();

  const mfs = form.getTextField('topmostSubform[0].Page1[0].FilingStatus[0].f1_01[0]');
  mfs.acroField.setFontSize(4);
  mfs.setText('My Small Spouse Name');

  const firstName = form.getTextField('topmostSubform[0].Page1[0].f1_02[0]');
  firstName.acroField.setFontSize(20);
  firstName.setText('My Big First Name');

  const lastName = form.getTextField('topmostSubform[0].Page1[0].f1_03[0]');
  lastName.acroField.setFontSize(30);
  lastName.setText('My Bigger Last Name');

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
