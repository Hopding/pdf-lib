import { PDFDocument } from 'pdf-lib';

import { fetchAsset, writePdf } from './assets';

export default async () => {
  const [fancyFieldsPdf, ubuntuR] = await Promise.all([
    fetchAsset('pdfs/fancy_fields.pdf'),
    fetchAsset('fonts/ubuntu/Ubuntu-R.ttf'),
  ]);

  const pdfDoc = await PDFDocument.load(fancyFieldsPdf);

  pdfDoc.registerFontkit(fontkit);
  const ubuntuFont = await pdfDoc.embedFont(ubuntuR);

  const form = pdfDoc.getForm();

  // Text Fields
  const prefix = form.getTextField('Prefix ⚽️');
  prefix.updateAppearances(ubuntuFont);

  const firstName = form.getTextField('First Name 🚀');
  firstName.updateAppearances(ubuntuFont);

  const middleInitial = form.getTextField('MiddleInitial 🎳');
  middleInitial.updateAppearances(ubuntuFont);

  const lastName = form.getTextField('LastName 🛩');
  lastName.updateAppearances(ubuntuFont);

  // Check Boxes
  const isAFairy = form.getCheckBox('Are You A Fairy? 🌿');
  isAFairy.updateAppearances();

  const isPowerLevelOver9000 = form.getCheckBox(
    'Is Your Power Level Over 9000? 💪',
  );
  isPowerLevelOver9000.updateAppearances();

  const onePunch = form.getCheckBox('Can You Defeat Enemies In One Punch? 👊');
  onePunch.updateAppearances();

  const everLetMeDown = form.getCheckBox('Will You Ever Let Me Down? ☕️');
  everLetMeDown.updateAppearances();

  // Buttons
  const eject = form.getButton('Eject 📼');
  eject.updateAppearances(ubuntuFont);

  const submit = form.getButton('Submit 📝');
  submit.updateAppearances(ubuntuFont);

  const play = form.getButton('Play ▶️');
  play.updateAppearances(ubuntuFont);

  const launch = form.getButton('Launch 🚀');
  launch.updateAppearances(ubuntuFont);

  // Radio Group
  const historicalFigures = form.getRadioGroup('Historical Figures 🐺');
  historicalFigures.updateAppearances();

  // Option List
  const planets = form.getOptionList('Which Are Planets? 🌎');
  planets.updateAppearances(ubuntuFont);

  // Dropdown
  const gundams = form.getDropdown('Choose A Gundam 🤖');
  gundams.updateAppearances(ubuntuFont);

  const base64Pdf = await pdfDoc.saveAsBase64({ dataUri: true });

  return { base64Pdf };
};
