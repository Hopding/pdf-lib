import { Assets } from '..';
import { PDFDocument } from '../../..';

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

    // Checkboxes
    ChildTaxCredit: [
      'topmostSubform[0].Page1[0].Dependents[0].Table_Dependents[0].Row1[0].c1_12[0]',
      'topmostSubform[0].Page1[0].Dependents[0].Table_Dependents[0].Row2[0].c1_14[0]',
      'topmostSubform[0].Page1[0].Dependents[0].Table_Dependents[0].Row3[0].c1_16[0]',
      'topmostSubform[0].Page1[0].Dependents[0].Table_Dependents[0].Row4[0].c1_18[0]',
    ],
    OtherDependentsCredit: [
      'topmostSubform[0].Page1[0].Dependents[0].Table_Dependents[0].Row1[0].c1_13[0]',
      'topmostSubform[0].Page1[0].Dependents[0].Table_Dependents[0].Row2[0].c1_15[0]',
      'topmostSubform[0].Page1[0].Dependents[0].Table_Dependents[0].Row3[0].c1_17[0]',
      'topmostSubform[0].Page1[0].Dependents[0].Table_Dependents[0].Row4[0].c1_19[0]',
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

  TaxFormLabel: 'topmostSubform[0].Page2[0].Lines12a-12b_ReadOrder[0].f2_01[0]',
  TaxFormValue: 'topmostSubform[0].Page2[0].Lines12a-12b_ReadOrder[0].f2_02[0]',
  ScheduleTotal12b: 'topmostSubform[0].Page2[0].f2_03[0]',
  ChildTaxCredit:
    'topmostSubform[0].Page2[0].Lines13a-13b_ReadOrder[0].f2_04[0]',
  ScheduleTotal13b: 'topmostSubform[0].Page2[0].f2_05[0]',
  Subtract14: 'topmostSubform[0].Page2[0].f2_06[0]',
  OtherTaxes: 'topmostSubform[0].Page2[0].f2_07[0]',
  TotalTax: 'topmostSubform[0].Page2[0].f2_08[0]',
  WithheldIncomeTax: 'topmostSubform[0].Page2[0].f2_09[0]',
  EarnedIncomeCredit: 'topmostSubform[0].Page2[0].Line18_ReadOrder[0].f2_10[0]',
  AdditionalChildTaxCredit:
    'topmostSubform[0].Page2[0].Line18_ReadOrder[0].f2_11[0]',
  OpportunityCredit: 'topmostSubform[0].Page2[0].Line18_ReadOrder[0].f2_12[0]',
  Schedule18d: 'topmostSubform[0].Page2[0].Line18_ReadOrder[0].f2_13[0]',
  RefundableCredits: 'topmostSubform[0].Page2[0].f2_14[0]',
  TotalPayments: 'topmostSubform[0].Page2[0].f2_15[0]',
  AmountOverpaid: 'topmostSubform[0].Page2[0].f2_16[0]',
  AmountRefunded: 'topmostSubform[0].Page2[0].f2_17[0]',
  RoutingNumber: 'topmostSubform[0].Page2[0].RoutingNo[0].f2_18[0]',
  AccountNumber: 'topmostSubform[0].Page2[0].AccountNo[0].f2_19[0]',
  EstimatedTax2020: 'topmostSubform[0].Page2[0].f2_20[0]',
  AmountYouOwe: 'topmostSubform[0].Page2[0].f2_21[0]',
  EstimatedTaxPenalty: 'topmostSubform[0].Page2[0].f2_22[0]',
  DesigneeName: 'topmostSubform[0].Page2[0].ThirdPartyDesignee[0].f2_23[0]',
  DesigneePhoneNo: 'topmostSubform[0].Page2[0].ThirdPartyDesignee[0].f2_24[0]',
  DesigneePIN: 'topmostSubform[0].Page2[0].ThirdPartyDesignee[0].f2_25[0]',
  YourOccupation: 'topmostSubform[0].Page2[0].Signatures[0].f2_26[0]',
  YourIdentityPIN: 'topmostSubform[0].Page2[0].Signatures[0].f2_27[0]',
  SpouseOccupation: 'topmostSubform[0].Page2[0].Signatures[0].f2_28[0]',
  SpouseIdentityPIN: 'topmostSubform[0].Page2[0].Signatures[0].f2_29[0]',
  PhoneNo: 'topmostSubform[0].Page2[0].Signatures[0].f2_30[0]',
  EmailAddress: 'topmostSubform[0].Page2[0].Signatures[0].f2_31[0]',
  PreparerName:
    'topmostSubform[0].Page2[0].PaidPreparer[0].Preparer[0].f2_32[0]',
  PTIN: 'topmostSubform[0].Page2[0].PaidPreparer[0].Preparer[0].f2_33[0]',
  PreparerFirmName:
    'topmostSubform[0].Page2[0].PaidPreparer[0].Preparer[0].f2_34[0]',
  PreparerPhoneNo:
    'topmostSubform[0].Page2[0].PaidPreparer[0].Preparer[0].f2_35[0]',
  PreparerAddress:
    'topmostSubform[0].Page2[0].PaidPreparer[0].Preparer[0].f2_36[0]',
  PreparerEIN:
    'topmostSubform[0].Page2[0].PaidPreparer[0].Preparer[0].f2_37[0]',

  // Checkboxes
  PresidentialElectionFund:
    'topmostSubform[0].Page1[0].ReadOrderControl[1].PresidentialElection[0].c1_02[0]',
  PresidentialElectionFundSpouse:
    'topmostSubform[0].Page1[0].ReadOrderControl[1].PresidentialElection[0].c1_03[0]',
  YouAsDependent:
    'topmostSubform[0].Page1[0].ReadOrderControl[1].StandardDeduction[0].c1_04[0]',
  SpouseAsDependent:
    'topmostSubform[0].Page1[0].ReadOrderControl[1].StandardDeduction[0].c1_05[0]',
  SpouseItemizes:
    'topmostSubform[0].Page1[0].ReadOrderControl[1].StandardDeduction[0].c1_06[0]',
  BlindBefore1995:
    'topmostSubform[0].Page1[0].ReadOrderControl[1].AgeBlindness[0].c1_07[0]',
  AreBlind:
    'topmostSubform[0].Page1[0].ReadOrderControl[1].AgeBlindness[0].c1_08[0]',
  SpouseBlindBefore1995:
    'topmostSubform[0].Page1[0].ReadOrderControl[1].AgeBlindness[0].c1_09[0]',
  SpouseIsBlind:
    'topmostSubform[0].Page1[0].ReadOrderControl[1].AgeBlindness[0].c1_10[0]',
  MoreThanFourDependents:
    'topmostSubform[0].Page1[0].IfMoreThanFour[0].c1_11[0]',
  CapitalGainOrLossRequired:
    'topmostSubform[0].Page1[0].ReadOrderControl_Lns1-8b[0].c1_20[0]',
  TaxForm8814: 'topmostSubform[0].Page2[0].Lines12a-12b_ReadOrder[0].c2_01[0]',
  TaxForm4972: 'topmostSubform[0].Page2[0].Lines12a-12b_ReadOrder[0].c2_02[0]',
  TaxFormCustom:
    'topmostSubform[0].Page2[0].Lines12a-12b_ReadOrder[0].c2_03[0]',
  Form8888Attached: 'topmostSubform[0].Page2[0].c2_04[0]',
  CheckingAccountType: 'topmostSubform[0].Page2[0].c2_05[0]',
  SavingsAccountType: 'topmostSubform[0].Page2[0].c2_05[1]',
  AllowOthersToDiscussReturn:
    'topmostSubform[0].Page2[0].ThirdPartyDesignee[0].c2_06[0]',
  DoNotAllowOthersToDiscussReturn:
    'topmostSubform[0].Page2[0].ThirdPartyDesignee[0].c2_06[1]',
  Is3rdPartyDesignee:
    'topmostSubform[0].Page2[0].PaidPreparer[0].Preparer[0].CheckIf[0].c2_07[0]',
  IsSelfEmployed:
    'topmostSubform[0].Page2[0].PaidPreparer[0].Preparer[0].CheckIf[0].c2_07[1]',
};

export default async (assets: Assets) => {
  const pdfDoc = await PDFDocument.load(assets.pdfs.with_xfa_fields);

  const form = pdfDoc.getForm();

  const mfs = form.getCheckBox(fieldNames.MarriedFilingSeparately);
  mfs.check();

  const filingPartner = form.getTextField(fieldNames.FilingPartner);
  filingPartner.setText('Guinevere Pendragon');
  filingPartner.setFontSize(4);

  const firstName = form.getTextField(fieldNames.FirstNameAndMiddleInitial);
  firstName.setText('Arthur F');
  firstName.setFontSize(20);

  const lastName = form.getTextField(fieldNames.LastName);
  lastName.setText('Pendragon');
  lastName.setFontSize(30);

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

  const foreignCountryName = form.getTextField(fieldNames.ForeignCountryName);
  foreignCountryName.setText('England');

  const foreignProvince = form.getTextField(fieldNames.ForeignProvince);
  foreignProvince.setText('Yorkshire and the Humber');

  const foreignPostalCode = form.getTextField(fieldNames.ForeignPostalCode);
  foreignPostalCode.setText('29381');

  [
    'Caesar Augustus',
    'Marcus Aurelius',
    'Livia Augustus',
    'Claudia Octavia',
  ].forEach((firstAndLast, idx) => {
    const field = form.getTextField(
      fieldNames.Dependents.FirstAndLastName[idx],
    );
    field.setText(firstAndLast);
  });

  ['917073905', '671723254', '261182980', '629137689'].forEach(
    (dependentSsn, idx) => {
      const field = form.getTextField(fieldNames.Dependents.SSN[idx]);
      field.setText(dependentSsn);
    },
  );

  ['Son', 'Grandson', 'Daughter', 'Granddaughter'].forEach(
    (relationship, idx) => {
      const field = form.getTextField(fieldNames.Dependents.Relationship[idx]);
      field.setText(relationship);
    },
  );

  const taxExemptInterest = form.getTextField(fieldNames.TaxExemptInterest);
  taxExemptInterest.setText('6359.25');

  const qualifiedDividends = form.getTextField(fieldNames.QualifiedDividends);
  qualifiedDividends.setText('7116.60');

  const iraDistributions = form.getTextField(fieldNames.IraDistributions);
  iraDistributions.setText('8903.54');

  const pensions = form.getTextField(fieldNames.Pensions);
  pensions.setText('3996.73');

  const socialSecurity = form.getTextField(fieldNames.SocialSecurity);
  socialSecurity.setText('3633.69');

  const wages = form.getTextField(fieldNames.Wages);
  wages.setText('1600.61');

  const taxableInterest = form.getTextField(fieldNames.TaxableInterest);
  taxableInterest.setText('9705.03');

  const ordinaryDividends = form.getTextField(fieldNames.OrdinaryDividends);
  ordinaryDividends.setText('1567.57');

  const taxableIraDistributions = form.getTextField(
    fieldNames.TaxableIraDistributions,
  );
  taxableIraDistributions.setText('4142.40');

  const taxablePensions = form.getTextField(fieldNames.TaxablePensions);
  taxablePensions.setText('6272.80');

  const taxableSocialSecurity = form.getTextField(
    fieldNames.TaxableSocialSecurity,
  );
  taxableSocialSecurity.setText('8576.60');

  const capitalGainOrLoss = form.getTextField(fieldNames.CapitalGainOrLoss);
  capitalGainOrLoss.setText('6313.00');

  const otherIncome = form.getTextField(fieldNames.OtherIncome);
  otherIncome.setText('7818.66');

  const totalIncome = form.getTextField(fieldNames.TotalIncome);
  totalIncome.setText('8738.83');

  const incomeAdjustments = form.getTextField(fieldNames.IncomeAdjustments);
  incomeAdjustments.setText('4287.15');

  const adjustedGrossIncome = form.getTextField(fieldNames.AdjustedGrossIncome);
  adjustedGrossIncome.setText('3931.94');

  const taxFormLabel = form.getTextField(fieldNames.TaxFormLabel);
  taxFormLabel.setText('XZ91');

  const taxFormValue = form.getTextField(fieldNames.TaxFormValue);
  taxFormValue.setText('8891.81');

  const scheduleTotal12b = form.getTextField(fieldNames.ScheduleTotal12b);
  scheduleTotal12b.setText('3554.12');

  const childTaxCredit = form.getTextField(fieldNames.ChildTaxCredit);
  childTaxCredit.setText('1639.05');

  const scheduleTotal13b = form.getTextField(fieldNames.ScheduleTotal13b);
  scheduleTotal13b.setText('2618.78');

  const subtract14 = form.getTextField(fieldNames.Subtract14);
  subtract14.setText('4756.35');

  const otherTaxes = form.getTextField(fieldNames.OtherTaxes);
  otherTaxes.setText('2203.54');

  const totalTax = form.getTextField(fieldNames.TotalTax);
  totalTax.setText('5741.44');

  const withheldIncomeTax = form.getTextField(fieldNames.WithheldIncomeTax);
  withheldIncomeTax.setText('842.48');

  const earnedIncomeCredit = form.getTextField(fieldNames.EarnedIncomeCredit);
  earnedIncomeCredit.setText('3614.21');

  const additionalChildTaxCredit = form.getTextField(
    fieldNames.AdditionalChildTaxCredit,
  );
  additionalChildTaxCredit.setText('4945.15');

  const opportunityCredit = form.getTextField(fieldNames.OpportunityCredit);
  opportunityCredit.setText('5695.93');

  const schedule18d = form.getTextField(fieldNames.Schedule18d);
  schedule18d.setText('6428.47');

  const refundableCredits = form.getTextField(fieldNames.RefundableCredits);
  refundableCredits.setText('9735.55');

  const totalPayments = form.getTextField(fieldNames.TotalPayments);
  totalPayments.setText('448.04');

  const amountOverpaid = form.getTextField(fieldNames.AmountOverpaid);
  amountOverpaid.setText('9800.47');

  const amountRefunded = form.getTextField(fieldNames.AmountRefunded);
  amountRefunded.setText('1499.83');

  const routingNumber = form.getTextField(fieldNames.RoutingNumber);
  routingNumber.setText('804717479');

  const accountNumber = form.getTextField(fieldNames.AccountNumber);
  accountNumber.setText('10647533083123501');

  const estimatedTax2020 = form.getTextField(fieldNames.EstimatedTax2020);
  estimatedTax2020.setText('5100.81');

  const amountYouOwe = form.getTextField(fieldNames.AmountYouOwe);
  amountYouOwe.setText('3560.83');

  const estimatedTaxPenalty = form.getTextField(fieldNames.EstimatedTaxPenalty);
  estimatedTaxPenalty.setText('1895.78');

  const designeeName = form.getTextField(fieldNames.DesigneeName);
  designeeName.setText('Solomon Draper');

  const designeePhoneNo = form.getTextField(fieldNames.DesigneePhoneNo);
  designeePhoneNo.setText('(123) 456-7890');

  const designeePIN = form.getTextField(fieldNames.DesigneePIN);
  designeePIN.setText('12757');

  const yourOccupation = form.getTextField(fieldNames.YourOccupation);
  yourOccupation.setText('Mythical English King');

  const yourIdentityPIN = form.getTextField(fieldNames.YourIdentityPIN);
  yourIdentityPIN.setText('427830');

  const spouseOccupation = form.getTextField(fieldNames.SpouseOccupation);
  spouseOccupation.setText('Mythical English Queen');

  const spouseIdentityPIN = form.getTextField(fieldNames.SpouseIdentityPIN);
  spouseIdentityPIN.setText('387495');

  const phoneNo = form.getTextField(fieldNames.PhoneNo);
  phoneNo.setText('(173) 103-1048');

  const emailAddress = form.getTextField(fieldNames.EmailAddress);
  emailAddress.setText('arthur@roundtable.com');

  const preparerName = form.getTextField(fieldNames.PreparerName);
  preparerName.setText('Sashenka Knight');

  const ptin = form.getTextField(fieldNames.PTIN);
  ptin.setText('190783');

  const preparerFirmName = form.getTextField(fieldNames.PreparerFirmName);
  preparerFirmName.setText('Qux Baz Preparationz');

  const preparerPhoneNo = form.getTextField(fieldNames.PreparerPhoneNo);
  preparerPhoneNo.setText('(378) 102-1947');

  const preparerAddress = form.getTextField(fieldNames.PreparerAddress);
  preparerAddress.setText('8545 Rockland Drive Fairburn, GA 30213');

  const preparerEIN = form.getTextField(fieldNames.PreparerEIN);
  preparerEIN.setText('218932783');

  ['Son', 'Grandson', 'Daughter', 'Granddaughter'].forEach(
    (relationship, idx) => {
      const field = form.getTextField(fieldNames.Dependents.Relationship[idx]);
      field.setText(relationship);
    },
  );

  const ctc0 = form.getCheckBox(fieldNames.Dependents.ChildTaxCredit[0]);
  ctc0.check();

  const ctc2 = form.getCheckBox(fieldNames.Dependents.ChildTaxCredit[2]);
  ctc2.check();

  const odc1 = form.getCheckBox(fieldNames.Dependents.OtherDependentsCredit[1]);
  odc1.check();

  const odc3 = form.getCheckBox(fieldNames.Dependents.OtherDependentsCredit[3]);
  odc3.check();

  const pefs = form.getCheckBox(fieldNames.PresidentialElectionFundSpouse);
  pefs.check();

  const mtfd = form.getCheckBox(fieldNames.MoreThanFourDependents);
  mtfd.check();

  const si = form.getCheckBox(fieldNames.SpouseItemizes);
  si.check();

  const ab = form.getCheckBox(fieldNames.AreBlind);
  ab.check();

  const sib = form.getCheckBox(fieldNames.SpouseIsBlind);
  sib.check();

  const cgolr = form.getCheckBox(fieldNames.CapitalGainOrLossRequired);
  cgolr.check();

  const f888a = form.getCheckBox(fieldNames.Form8888Attached);
  f888a.check();

  const cat = form.getCheckBox(fieldNames.CheckingAccountType);
  cat.check();

  const aotdr = form.getCheckBox(fieldNames.AllowOthersToDiscussReturn);
  aotdr.check();

  const ise = form.getCheckBox(fieldNames.IsSelfEmployed);
  ise.check();

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
