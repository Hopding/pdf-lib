import { Assets } from '..';
import { PDFDocument } from '../../../cjs';

import fontkit from '@pdf-lib/fontkit';

// Test based on test18.ts
// Added encryption test at the very end
const loadA = async (assets: Assets) => {
  const pdfDoc = await PDFDocument.load(assets.pdfs.with_combed_fields);
  const form = pdfDoc.getForm();

  form
    .getTextField(
      'form1[0].Page1[0].BeforeYouBegin[0].BusinessInfo[0].LegalName[0]',
    )
    .setText('Purple People Eater');

  form
    .getTextField(
      'form1[0].Page1[0].BeforeYouBegin[0].BusinessInfo[0].AccountNumber[0].BusinessNumber_RT1[0]',
    )
    .setText('123456789');

  form
    .getTextField(
      'form1[0].Page1[0].BeforeYouBegin[0].BusinessInfo[0].AccountNumber[0].BusinessNumber_RT2[0]',
    )
    .setText('9876');

  form
    .getTextField(
      'form1[0].Page1[0].BeforeYouBegin[0].PhysicalAddress[0].BusinessAddress[0]',
    )
    .setText('873 Lantern Lane');

  form
    .getTextField(
      'form1[0].Page1[0].BeforeYouBegin[0].PhysicalAddress[0].City[0]',
    )
    .setText('Tuckerton');

  form
    .getDropdown(
      'form1[0].Page1[0].BeforeYouBegin[0].PhysicalAddress[0].Province[0]',
    )
    .select('Saskatchewan');

  form
    .getTextField(
      'form1[0].Page1[0].BeforeYouBegin[0].PhysicalAddress[0].PostalCode[0]',
    )
    .setText('08087');

  // TODO: Add this back once https://github.com/Hopding/pdf-lib/pull/724 is merged
  // const typeOfReturn = form.getRadioGroup(
  //   'form1[0].Page1[0].BeforeYouBegin[0].Type[0].RadioButtonGroup[0]',
  // );
  // typeOfReturn.select('1');

  form.flatten();
  return pdfDoc;
};

// Based on test15.ts
const loadB = async (assets: Assets) => {
  const pdfDoc = await PDFDocument.load(assets.pdfs.dod_character);
  const form = pdfDoc.getForm();

  const marioImage = await pdfDoc.embedPng(assets.images.png.small_mario);

  form.getTextField('CharacterName 2').setText('Mario');
  form.getTextField('Age').setText('24 years');
  form.getTextField('Height').setText(`5' 1"`);
  form.getTextField('Weight').setText('196 lbs');
  form.getTextField('Eyes').setText('blue');
  form.getTextField('Skin').setText('white');
  form.getTextField('Hair').setText('brown');

  form.getButton('CHARACTER IMAGE').setImage(marioImage);

  form.flatten();
  return pdfDoc;
};

// Based on test16.ts
const loadC = async (assets: Assets) => {
  const pdfDoc = await PDFDocument.load(assets.pdfs.with_xfa_fields);
  const form = pdfDoc.getForm();

  form
    .getCheckBox('topmostSubform[0].Page1[0].FilingStatus[0].c1_01[2]')
    .check();

  form
    .getTextField('topmostSubform[0].Page1[0].FilingStatus[0].f1_01[0]')
    .setText('Guinevere Pendragon');

  form.getTextField('topmostSubform[0].Page1[0].f1_02[0]').setText('Arthur F');

  form.getTextField('topmostSubform[0].Page1[0].f1_03[0]').setText('Pendragon');

  form
    .getTextField(
      'topmostSubform[0].Page1[0].YourSocial_ReadOrderControl[0].f1_04[0]',
    )
    .setText('123456789');

  form
    .getTextField(
      'topmostSubform[0].Page1[0].YourSocial_ReadOrderControl[0].f1_05[0]',
    )
    .setText('Guinevere Q');

  form
    .getTextField(
      'topmostSubform[0].Page1[0].YourSocial_ReadOrderControl[0].f1_06[0]',
    )
    .setText('Pendragon');

  form
    .getTextField('topmostSubform[0].Page1[0].ReadOrderControl[0].f1_07[0]')
    .setText('987654321');

  form.flatten();
  return pdfDoc;
};

// Based on test17.ts
const loadD = async (assets: Assets) => {
  const pdfDoc = await PDFDocument.load(assets.pdfs.fancy_fields);

  pdfDoc.registerFontkit(fontkit);
  const ubuntuFont = await pdfDoc.embedFont(assets.fonts.ttf.ubuntu_r);

  const form = pdfDoc.getForm();

  form.getTextField('Prefix ⚽️').updateAppearances(ubuntuFont);
  form.getTextField('First Name 🚀').updateAppearances(ubuntuFont);
  form.getTextField('MiddleInitial 🎳').updateAppearances(ubuntuFont);
  form.getTextField('LastName 🛩').updateAppearances(ubuntuFont);
  form.getCheckBox('Are You A Fairy? 🌿').updateAppearances();
  form.getCheckBox('Is Your Power Level Over 9000? 💪').updateAppearances();
  form
    .getCheckBox('Can You Defeat Enemies In One Punch? 👊')
    .updateAppearances();
  form.getCheckBox('Will You Ever Let Me Down? ☕️').updateAppearances();
  form.getButton('Eject 📼').updateAppearances(ubuntuFont);
  form.getButton('Submit 📝').updateAppearances(ubuntuFont);
  form.getButton('Play ▶️').updateAppearances(ubuntuFont);
  form.getButton('Launch 🚀').updateAppearances(ubuntuFont);
  form.getRadioGroup('Historical Figures 🐺').updateAppearances();
  form.getOptionList('Which Are Planets? 🌎').updateAppearances(ubuntuFont);

  const gundams = form.getDropdown('Choose A Gundam 🤖');
  gundams.select('One Punch Man');
  gundams.updateAppearances(ubuntuFont);

  form.flatten();
  return pdfDoc;
};

// Based on https://github.com/Hopding/pdf-lib#create-form
const loadE = async (_assets: Assets) => {
  const pdfDoc = await PDFDocument.create();

  const page = pdfDoc.addPage([550, 750]);

  const form = pdfDoc.getForm();

  page.drawText('Enter your favorite superhero:', { x: 50, y: 700, size: 20 });
  const superheroField = form.createTextField('favorite.superhero');
  superheroField.setText('One Punch Man');
  superheroField.addToPage(page, { x: 55, y: 640 });

  page.drawText('Select your favorite rocket:', { x: 50, y: 600, size: 20 });
  page.drawText('Falcon Heavy', { x: 120, y: 560, size: 18 });
  const rocketField = form.createRadioGroup('favorite.rocket');
  rocketField.addOptionToPage('Saturn IV', page, { x: 55, y: 540 });
  rocketField.select('Saturn IV');

  page.drawText('Select your favorite gundams:', { x: 50, y: 440, size: 20 });
  page.drawText('Exia', { x: 120, y: 400, size: 18 });
  const exiaField = form.createCheckBox('gundam.exia');
  exiaField.addToPage(page, { x: 55, y: 380 });
  exiaField.check();

  page.drawText('Select your favorite planet:', { x: 50, y: 280, size: 20 });
  const planetsField = form.createDropdown('favorite.planet');
  planetsField.addOptions(['Venus', 'Earth', 'Mars', 'Pluto']);
  planetsField.select('Pluto');
  planetsField.addToPage(page, { x: 55, y: 220 });

  page.drawText('Select your favorite person:', { x: 50, y: 180, size: 18 });
  const personField = form.createOptionList('favorite.person');
  personField.addOptions([
    'Julius Caesar',
    'Ada Lovelace',
    'Cleopatra',
    'Aaron Burr',
    'Mark Antony',
  ]);
  personField.select('Ada Lovelace');
  personField.addToPage(page, { x: 55, y: 70 });

  form.flatten();

  return pdfDoc;
};

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

  const fieldToRemove = form.getRadioGroup('Group4');
  form.removeField(fieldToRemove);
  if (form.getFieldMaybe('Group4') !== undefined) {
    throw new Error('Failed to remove field');
  }

  form.flatten();

  // Copy pages from documents with flattened forms
  const formDocs = [
    await loadA(assets),
    await loadB(assets),
    await loadC(assets),
    await loadD(assets),
    await loadE(assets),
  ];

  for (const formDoc of formDocs) {
    const [page1] = await pdfDoc.copyPages(formDoc, [0]);
    pdfDoc.addPage(page1);
  }
  const userPassword = 'abcd';
  const ownerPassword = '1234';

  pdfDoc.encrypt({
    userPassword,
    ownerPassword,
    permissions: { modifying: true },
  });

  /********************** Print Metadata **********************/
  console.log(
    'PDF Encrypt using object streams, temporarily doesnt work with adobe acrobat',
  );
  console.log('userPassword:', userPassword);
  console.log('ownerPassword:', ownerPassword);
  console.log('permissions:', 'modifying only');

  /********************** Export PDF **********************/
  const pdfBytes = await pdfDoc.save();

  return pdfBytes;
};
