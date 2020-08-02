import { Assets } from '..';
import { PDFDocument, PDFName, PDFTextField } from '../../..';

// TODO: Fill in DoD form!

const fieldNames = {
  // Page 1
  Single: 'topmostSubform[0].Page1[0].FilingStatus[0].c1_01[0]',
  MarriedFilingJointly: 'topmostSubform[0].Page1[0].FilingStatus[0].c1_01[1]',
  MarriedFilingSeparately:
    'topmostSubform[0].Page1[0].FilingStatus[0].c1_01[2]',
  HeadOfHousehold: 'topmostSubform[0].Page1[0].FilingStatus[0].c1_01[3]',
  QualifyingWidow: 'topmostSubform[0].Page1[0].FilingStatus[0].c1_01[4]',
  FilingPartner: 'topmostSubform[0].Page1[0].FilingStatus[0].f1_01[0]',

  FirstNameAndMiddleInitial: 'topmostSubform[0].Page1[0].f1_02[0]',
  LastName: 'topmostSubform[0].Page1[0].f1_03[0]',
  SSN: 'topmostSubform[0].Page1[0].YourSocial_ReadOrderControl[0].f1_04[0]',
  SpouseFirstNameAndMiddleInitial:
    'topmostSubform[0].Page1[0].YourSocial_ReadOrderControl[0].f1_05[0]',
  SpouseLastName:
    'topmostSubform[0].Page1[0].YourSocial_ReadOrderControl[0].f1_06[0]',
  SpouseSSN: 'topmostSubform[0].Page1[0].ReadOrderControl[0].f1_07[0]',

  HomeAddress:
    'topmostSubform[0].Page1[0].ReadOrderControl[0].Address[0].f1_08[0]',
  AptNo: 'topmostSubform[0].Page1[0].ReadOrderControl[0].Address[0].f1_09[0]',
  CityTownStateZip:
    'topmostSubform[0].Page1[0].ReadOrderControl[0].Address[0].f1_10[0]',
  ForeignCountryName:
    'topmostSubform[0].Page1[0].ReadOrderControl[0].Address[0].f1_11[0]',
  ForeignProvince:
    'topmostSubform[0].Page1[0].ReadOrderControl[0].Address[0].f1_12[0]',
  ForeignPostalCode:
    'topmostSubform[0].Page1[0].ReadOrderControl[0].Address[0].f1_13[0]',

  Dependents: {
    FirstAndLastName: [
      'topmostSubform[0].Page1[0].Dependents[0].Table_Dependents[0].Row1[0].f1_14[0]',
      'topmostSubform[0].Page1[0].Dependents[0].Table_Dependents[0].Row2[0].f1_17[0]',
      'topmostSubform[0].Page1[0].Dependents[0].Table_Dependents[0].Row3[0].f1_20[0]',
      'topmostSubform[0].Page1[0].Dependents[0].Table_Dependents[0].Row4[0].f1_23[0]',
    ],
    SSN: [
      'topmostSubform[0].Page1[0].Dependents[0].Table_Dependents[0].Row1[0].f1_15[0]',
      'topmostSubform[0].Page1[0].Dependents[0].Table_Dependents[0].Row2[0].f1_18[0]',
      'topmostSubform[0].Page1[0].Dependents[0].Table_Dependents[0].Row3[0].f1_21[0]',
      'topmostSubform[0].Page1[0].Dependents[0].Table_Dependents[0].Row4[0].f1_24[0]',
    ],
    Relationship: [
      'topmostSubform[0].Page1[0].Dependents[0].Table_Dependents[0].Row1[0].f1_16[0]',
      'topmostSubform[0].Page1[0].Dependents[0].Table_Dependents[0].Row2[0].f1_19[0]',
      'topmostSubform[0].Page1[0].Dependents[0].Table_Dependents[0].Row3[0].f1_22[0]',
      'topmostSubform[0].Page1[0].Dependents[0].Table_Dependents[0].Row4[0].f1_25[0]',
    ],
  },

  TaxExemptInterest:
    'topmostSubform[0].Page1[0].ReadOrderControl_Lns1-8b[0].f1_27[0]',
  QualifiedDividends:
    'topmostSubform[0].Page1[0].ReadOrderControl_Lns1-8b[0].f1_29[0]',
  IraDistributions:
    'topmostSubform[0].Page1[0].ReadOrderControl_Lns1-8b[0].f1_31[0]',
  Pensions: 'topmostSubform[0].Page1[0].ReadOrderControl_Lns1-8b[0].f1_33[0]',
  SocialSecurity:
    'topmostSubform[0].Page1[0].ReadOrderControl_Lns1-8b[0].f1_35[0]',
  Wages: 'topmostSubform[0].Page1[0].ReadOrderControl_Lns1-8b[0].f1_26[0]',
  TaxableInterest:
    'topmostSubform[0].Page1[0].ReadOrderControl_Lns1-8b[0].f1_28[0]',
  OrdinaryDividends:
    'topmostSubform[0].Page1[0].ReadOrderControl_Lns1-8b[0].f1_30[0]',
  TaxableIraDistributions:
    'topmostSubform[0].Page1[0].ReadOrderControl_Lns1-8b[0].f1_32[0]',
  TaxablePensions:
    'topmostSubform[0].Page1[0].ReadOrderControl_Lns1-8b[0].f1_34[0]',
  TaxableSocialSecurity:
    'topmostSubform[0].Page1[0].ReadOrderControl_Lns1-8b[0].f1_36[0]',
  CapitalGainOrLoss:
    'topmostSubform[0].Page1[0].ReadOrderControl_Lns1-8b[0].f1_37[0]',
  OtherIncome:
    'topmostSubform[0].Page1[0].ReadOrderControl_Lns1-8b[0].f1_38[0]',
  TotalIncome:
    'topmostSubform[0].Page1[0].ReadOrderControl_Lns1-8b[0].f1_39[0]',
  IncomeAdjustments:
    'topmostSubform[0].Page1[0].ReadOrderControl_Lns1-8b[0].f1_40[0]',
  AdjustedGrossIncome:
    'topmostSubform[0].Page1[0].ReadOrderControl_Lns1-8b[0].f1_41[0]',
  StandardDeduction: 'topmostSubform[0].Page1[0].f1_42[0]',
  QualifiedBusinessDeduction: 'topmostSubform[0].Page1[0].f1_43[0]',
  SumOf9And10: 'topmostSubform[0].Page1[0].f1_44[0]',
  TaxableIncome: 'topmostSubform[0].Page1[0].f1_45[0]',
};

(() => [fieldNames, PDFName, PDFTextField])();

export default async (assets: Assets) => {
  const pdfDoc = await PDFDocument.load(assets.pdfs.with_xfa_fields);

  const form = pdfDoc.getForm();

  // TODO: Do this automatically with a warning...
  // form.acroForm.dict.delete(PDFName.of('XFA'));

  const fields = form.getFields();
  fields.forEach((field) => {
    // const type = field.constructor.name;
    const namex = field.getName();
    // console.log(`${type}: ${namex}`);
    console.log(`'${namex}',`);

    // if (field instanceof PDFTextField) {
    //   field.setMaxLength();
    //   field.setText(field.getName());
    // }
  });

  // TODO: Figure out why we're not correctly using the existing APs for these
  //       widgets...
  const mfs = form.getCheckBox(fieldNames.MarriedFilingSeparately);
  mfs.check();

  const filingPartner = form.getTextField(fieldNames.FilingPartner);
  filingPartner.setText('Guinevere Pendragon');

  const firstName = form.getTextField(fieldNames.FirstNameAndMiddleInitial);
  firstName.setText('Arthur F');

  const lastName = form.getTextField(fieldNames.LastName);
  lastName.setText('Pendragon');

  const ssn = form.getTextField(fieldNames.SSN);
  ssn.setText('123456789');

  const spouseFirst = form.getTextField(
    fieldNames.SpouseFirstNameAndMiddleInitial,
  );
  spouseFirst.setText('Guinevere Q');

  const spouseLast = form.getTextField(fieldNames.SpouseLastName);
  spouseLast.setText('Pendragon');

  const spouseSsn = form.getTextField(fieldNames.SpouseSSN);
  spouseSsn.setText('987654321');

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

  const homeAddress = form.getTextField(fieldNames.HomeAddress);
  homeAddress.setText('Camelot');

  const aptNo = form.getTextField(fieldNames.AptNo);
  aptNo.setText('42');

  const cityTownStateZip = form.getTextField(fieldNames.CityTownStateZip);
  cityTownStateZip.setText('Yorkshire 29381');

  console.log();
  console.log(form.acroForm.dict.toString());

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
