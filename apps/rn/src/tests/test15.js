import { PDFDocument, rgb, TextAlignment } from 'pdf-lib';

import { fetchAsset } from './assets';

export default async () => {
  const [dodCharacterPdf, smallMarioPng, marioEmblemPng] = await Promise.all([
    fetchAsset('pdfs/dod_character.pdf'),
    fetchAsset('images/small_mario.png'),
    fetchAsset('images/mario_emblem.png'),
  ]);

  const pdfDoc = await PDFDocument.load(dodCharacterPdf);

  const marioImage = await pdfDoc.embedPng(smallMarioPng);
  const emblemImage = await pdfDoc.embedPng(marioEmblemPng);

  const form = pdfDoc.getForm();

  form.getTextField('CharacterName 2').setText('Mario');
  form.getTextField('Age').setText('24 years');
  form.getTextField('Height').setText('5\' 1"');
  form.getTextField('Weight').setText('196 lbs');
  form.getTextField('Eyes').setText('blue');
  form.getTextField('Skin').setText('white');
  form.getTextField('Hair').setText('brown');

  form.getButton('CHARACTER IMAGE').setImage(marioImage);

  form
    .getTextField('Allies')
    .setText(
      [
        'Allies:',
        '  • Princess Daisy',
        '  • Princess Peach',
        '  • Rosalina',
        '  • Geno',
        '  • Luigi',
        '  • Donkey Kong',
        '  • Yoshi',
        '  • Diddy Kong',
        '',
        'Organizations:',
        '  • Italian Plumbers Association',
      ].join('\n'),
    );

  form.getTextField('FactionName').setText("Mario's Emblem");
  form.getTextField('Faction Symbol Image').setImage(emblemImage);

  form
    .getTextField('Backstory')
    .setText(
      "Mario is a fictional character in the Mario video game franchise, owned by Nintendo and created by Japanese video game designer Shigeru Miyamoto. Serving as the company's mascot and the eponymous protagonist of the series, Mario has appeared in over 200 video games since his creation. Depicted as a short, pudgy, Italian plumber who resides in the Mushroom Kingdom, his adventures generally center upon rescuing Princess Peach from the Koopa villain Bowser. His younger brother and sidekick is Luigi.",
    );

  form
    .getTextField('Feat+Traits')
    .setText(
      [
        'Mario can use three basic three power-ups:',
        '  • the Super Mushroom, which causes Mario to grow larger',
        '  • the Fire Flower, which allows Mario to throw fireballs',
        '  • the Starman, which gives Mario temporary invincibility',
      ].join('\n'),
    );

  form
    .getTextField('Treasure')
    .setText(['• Gold coins', '• Treasure chests'].join('\n'));

  // Add new page with custom form fields to exercise options not used in test1
  const { width, height } = pdfDoc.getPage(0).getSize();
  const page2 = pdfDoc.addPage([width, height]);

  // Singleline, centered
  const singlelineCenteredTf = form.createTextField('singleline.centered.tf');
  singlelineCenteredTf.setAlignment(TextAlignment.Center);
  singlelineCenteredTf.setText('Sum centered text yo');
  singlelineCenteredTf.addToPage(page2, {
    y: height - 50,
    width: 250,
    height: 25,
    borderWidth: 3,
    borderColor: rgb(1, 0, 1),
  });

  // Multiline, centered
  const multilineCenteredTf = form.createTextField('multiline.centered.tf');
  multilineCenteredTf.enableMultiline();
  multilineCenteredTf.setAlignment(TextAlignment.Center);
  multilineCenteredTf.setText('Sum\ncentered\rtext\nyo');
  multilineCenteredTf.addToPage(page2, {
    y: height - 50 - 150,
    width: 250,
    height: 100,
    borderWidth: 3,
    borderColor: rgb(1, 0, 1),
  });

  // Singleline, right justified
  const singlelineRightTf = form.createTextField('singleline.right.tf');
  singlelineRightTf.setAlignment(TextAlignment.Right);
  singlelineRightTf.setText('Sum right justified text yo');
  singlelineRightTf.addToPage(page2, {
    y: height - 50,
    x: 300,
    width: 250,
    height: 25,
    borderWidth: 3,
    borderColor: rgb(1, 0, 1),
  });

  // Multiline, right justified
  const multilineRightTf = form.createTextField('multiline.right.tf');
  multilineRightTf.enableMultiline();
  multilineRightTf.setAlignment(TextAlignment.Right);
  multilineRightTf.setText('Sum\nright justified\rtext\nyo');
  multilineRightTf.addToPage(page2, {
    y: height - 50 - 150,
    x: 300,
    width: 250,
    height: 100,
    borderWidth: 3,
    borderColor: rgb(1, 0, 1),
  });

  // Multiselect Option List
  const optionList = form.createOptionList('option.list');
  optionList.addToPage(page2, {
    y: height - 50 - 150 - 250,
    width: 250,
    height: 200,
    backgroundColor: rgb(1, 0.25, 0.25),
    borderWidth: 5,
    borderColor: rgb(1, 0, 1),
  });
  optionList.setOptions([
    'Sojourner',
    'Spirit',
    'Opportunity',
    'Curiosity',
    'Perseverance',
  ]);
  optionList.enableMultiselect();
  optionList.select(['Sojourner', 'Curiosity', 'Perseverance']);

  const base64Pdf = await pdfDoc.saveAsBase64({ dataUri: true });

  return { base64Pdf };
};
