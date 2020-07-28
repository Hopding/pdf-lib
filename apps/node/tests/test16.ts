import { Assets } from '..';
import { PDFDocument, PDFName } from '../../..';

// TODO: Fill in DoD form!

const fieldNames = {
  // Page 1
  Single: 'topmostSubform[0].Page1[0].FilingStatus[0].c1_01[0]',
  MarriedFilingJointly: 'topmostSubform[0].Page1[0].FilingStatus[0].c1_01[1]',
  MarriedFilingSeparately:
    'topmostSubform[0].Page1[0].FilingStatus[0].c1_01[2]',
  HeadOfHousehold: 'topmostSubform[0].Page1[0].FilingStatus[0].c1_01[3]',
  QualifyingWidow: 'topmostSubform[0].Page1[0].FilingStatus[0].c1_01[4]',
  FirstNameAndMiddleInitial: 'topmostSubform[0].Page1[0].f1_02[0]',
  LastName: 'topmostSubform[0].Page1[0].f1_03[0]',
  StandardDeduction: 'topmostSubform[0].Page1[0].f1_42[0]',
  QualifiedBusinessDeduction: 'topmostSubform[0].Page1[0].f1_43[0]',
  SumOf9And10: 'topmostSubform[0].Page1[0].f1_44[0]',
  TaxableIncome: 'topmostSubform[0].Page1[0].f1_45[0]',
};

(() => [fieldNames, PDFName])();

export default async (assets: Assets) => {
  const pdfDoc = await PDFDocument.load(assets.pdfs.with_xfa_fields);

  const form = pdfDoc.getForm();

  // TODO: Do this automatically with a warning...
  // form.acroForm.dict.delete(PDFName.of('XFA'));

  const fields = form.getFields();
  fields.forEach((field) => {
    const type = field.constructor.name;
    const namex = field.getName();
    console.log(`${type}: ${namex}`);
  });

  // TODO: Figure out why we're not correctly using the existing APs for these
  //       widgets...
  const mfj = form.getCheckBox(fieldNames.MarriedFilingJointly);
  mfj.check();

  const firstName = form.getTextField(fieldNames.FirstNameAndMiddleInitial);
  firstName.setText('Arthur');

  const lastName = form.getTextField(fieldNames.LastName);
  lastName.setText('Pendragon');

  const standardDeduction = form.getTextField(fieldNames.StandardDeduction);
  standardDeduction.setText('42.36');

  const businessDeduction = form.getTextField(
    fieldNames.QualifiedBusinessDeduction,
  );
  businessDeduction.setText('91.48');

  const sumOf9And10 = form.getTextField(fieldNames.SumOf9And10);
  sumOf9And10.setText('133.84');

  const taxableIncome = form.getTextField(fieldNames.TaxableIncome);
  taxableIncome.setText('9000.01');

  console.log();
  console.log(form.acroForm.dict.toString());

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
