import { PDFDocument, values, PDFTextField } from 'pdf-lib';

import { fetchAsset } from './assets';

const fieldNames = {
  // Page 1
  LegalName: 'form1[0].Page1[0].BeforeYouBegin[0].BusinessInfo[0].LegalName[0]',
  BusinessNumber1:
    'form1[0].Page1[0].BeforeYouBegin[0].BusinessInfo[0].AccountNumber[0].BusinessNumber_RT1[0]',
  BusinessNumber2:
    'form1[0].Page1[0].BeforeYouBegin[0].BusinessInfo[0].AccountNumber[0].BusinessNumber_RT2[0]',
  BusinessAddress:
    'form1[0].Page1[0].BeforeYouBegin[0].PhysicalAddress[0].BusinessAddress[0]',
  City: 'form1[0].Page1[0].BeforeYouBegin[0].PhysicalAddress[0].City[0]',
  Province:
    'form1[0].Page1[0].BeforeYouBegin[0].PhysicalAddress[0].Province[0]',
  PostalCode:
    'form1[0].Page1[0].BeforeYouBegin[0].PhysicalAddress[0].PostalCode[0]',
  TypeOfReturn:
    'form1[0].Page1[0].BeforeYouBegin[0].Type[0].RadioButtonGroup[0]',
  FromDate:
    'form1[0].Page1[0].BeforeYouBegin[0].Period[0].FromToDates_Comb_Adv_EN[0].FromDate[0]',
  ToDate:
    'form1[0].Page1[0].BeforeYouBegin[0].Period[0].FromToDates_Comb_Adv_EN[0].ToDate[0]',

  // Page 2
  Amount1:
    'form1[0].Page12[0].SalesDutyPage12[0].AmountDue[0].DutyPayable[0].DutyPayable[0].Amount[0]',
  Amount2:
    'form1[0].Page12[0].SalesDutyPage12[0].AmountDue[0].AdditionalDutyPayable[0].AdditionalDutyPayable[0].Amount[0]',
  Amount3:
    'form1[0].Page12[0].SalesDutyPage12[0].AmountDue[0].AjustmentAdditionalDutyPayable[0].AjustmentAdditionalDutyPayable[0].Amount[0]',
  Amount4:
    'form1[0].Page12[0].SalesDutyPage12[0].AmountDue[0].NetPayable[0].NetPayable[0].Amount[0]',
  Amount5:
    'form1[0].Page12[0].SalesDutyPage12[0].AmountDue[0].Refund[0].Refund[0].Amount[0]',
  Amount6:
    'form1[0].Page12[0].SalesDutyPage12[0].AmountDue[0].AmountDue[0].AmountDue[0].Amount[0]',
  ByDueDate: 'form1[0].Page12[0].SalesDutyPage12[0].ByDueDate[0]',
  Name: 'form1[0].Page12[0].Certification[0].Signature[0].Name[0]',
  Title: 'form1[0].Page12[0].Certification[0].Signature[0].Title[0]',
  PhoneNumber:
    'form1[0].Page12[0].Certification[0].Signature[0].Phone_Ext[0].TelephoneNumberSplit[0].PhoneNumber[0]',
  PhoneExt:
    'form1[0].Page12[0].Certification[0].Signature[0].Phone_Ext[0].Ext[0]',
  SignatureDate:
    'form1[0].Page12[0].Certification[0].Signature[0].Date[0].DateYYYYMMDD_Comb[0]',
};

export default async () => {
  const pdfDoc = await PDFDocument.load(
    await fetchAsset('pdfs/with_combed_fields.pdf'),
  );

  const form = pdfDoc.getForm();

  const legalName = form.getTextField(fieldNames.LegalName);
  legalName.setText('Purple People Eater');

  const businessNumber1 = form.getTextField(fieldNames.BusinessNumber1);
  businessNumber1.setText('123456789');

  const businessNumber2 = form.getTextField(fieldNames.BusinessNumber2);
  businessNumber2.setText('9876');

  const businessAddress = form.getTextField(fieldNames.BusinessAddress);
  businessAddress.setText('873 Lantern Lane');

  const city = form.getTextField(fieldNames.City);
  city.setText('Tuckerton');

  const province = form.getDropdown(fieldNames.Province);
  province.select('Saskatchewan');

  const postalCode = form.getTextField(fieldNames.PostalCode);
  postalCode.setText('08087');

  const typeOfReturn = form.getRadioGroup(fieldNames.TypeOfReturn);
  typeOfReturn.select('1');

  const fromDate = form.getTextField(fieldNames.FromDate);
  fromDate.setText(['2019', '11', '05'].join(''));

  const toDate = form.getTextField(fieldNames.ToDate);
  toDate.setText(['2020', '01', '18'].join(''));

  const amount1 = form.getTextField(fieldNames.Amount1);
  amount1.setText('100');

  const amount2 = form.getTextField(fieldNames.Amount2);
  amount2.setText('200');

  const amount3 = form.getTextField(fieldNames.Amount3);
  amount3.setText('300');

  const amount4 = form.getTextField(fieldNames.Amount4);
  amount4.setText('400');

  const amount5 = form.getTextField(fieldNames.Amount5);
  amount5.setText('500');

  const amount6 = form.getTextField(fieldNames.Amount6);
  amount6.setText('600');

  const byDueDate = form.getRadioGroup(fieldNames.ByDueDate);
  byDueDate.select('2');

  const name = form.getTextField(fieldNames.Name);
  name.setText('Arthur Pendragon');

  const title = form.getTextField(fieldNames.Title);
  title.setText('King');

  const phoneNumber = form.getTextField(fieldNames.PhoneNumber);
  phoneNumber.setText('(123) 456-7890');

  const phoneExt = form.getTextField(fieldNames.PhoneExt);
  phoneExt.setText('1');

  const signatureDate = form.getTextField(fieldNames.SignatureDate);
  signatureDate.setText(['2020', '07', '13'].join(''));

  // Fill in remaining fields with random numeric values
  const fieldNameValues = values(fieldNames);
  const fields = form.getFields();
  fields.forEach((field) => {
    if (!fieldNameValues.includes(field.getName())) {
      if (field instanceof PDFTextField) {
        const value = String(Math.floor(Math.random() * 1000000) / 100);
        field.setText(value.substring(0, field.getMaxLength()));
      }
    }
  });

  const base64Pdf = await pdfDoc.saveAsBase64({ dataUri: true });

  return { base64Pdf };
};
