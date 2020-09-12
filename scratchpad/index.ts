import fs from 'fs';
import { openPdf, Reader } from './open';
import { PDFDocument } from 'src/index';

(async () => {
  // These should be Uint8Arrays or ArrayBuffers
  // This data can be obtained in a number of different ways
  // If your running in a Node environment, you could use fs.readFile()
  // In the browser, you could make a fetch() call and use res.arrayBuffer()
  const existingPdfBytes = fs.readFileSync('assets/pdfs/dod_character.pdf');
  const marioImageBytes = fs.readFileSync('assets/images/small_mario.png');
  const emblemImageBytes = fs.readFileSync('assets/images/mario_emblem.png');

  // Load a PDF with form fields
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  // Embed the Mario and emblem images
  const marioImage = await pdfDoc.embedPng(marioImageBytes);
  const emblemImage = await pdfDoc.embedPng(emblemImageBytes);

  // Get the form containing all the fields
  const form = pdfDoc.getForm();

  // Get all fields in the PDF by their names
  const nameField = form.getTextField('CharacterName 2');
  const ageField = form.getTextField('Age');
  const heightField = form.getTextField('Height');
  const weightField = form.getTextField('Weight');
  const eyesField = form.getTextField('Eyes');
  const skinField = form.getTextField('Skin');
  const hairField = form.getTextField('Hair');

  const alliesField = form.getTextField('Allies');
  const factionField = form.getTextField('FactionName');
  const backstoryField = form.getTextField('Backstory');
  const traitsField = form.getTextField('Feat+Traits');
  const treasureField = form.getTextField('Treasure');

  const characterImageField = form.getButton('CHARACTER IMAGE');
  const factionImageField = form.getButton('Faction Symbol Image');

  // Fill in the basic info fields
  nameField.setText('Mario');
  ageField.setText('24 years');
  heightField.setText(`5' 1"`);
  weightField.setText('196 lbs');
  eyesField.setText('blue');
  skinField.setText('white');
  hairField.setText('brown');

  // Fill the character image field with our Mario image
  characterImageField.setImage(marioImage);

  // Fill in the allies field
  alliesField.setText(
    [
      `Allies:`,
      `  • Princess Daisy`,
      `  • Princess Peach`,
      `  • Rosalina`,
      `  • Geno`,
      `  • Luigi`,
      `  • Donkey Kong`,
      `  • Yoshi`,
      `  • Diddy Kong`,
      ``,
      `Organizations:`,
      `  • Italian Plumbers Association`,
    ].join('\n'),
  );

  // Fill in the faction name field
  factionField.setText(`Mario's Emblem`);

  // Fill the faction image field with our emblem image
  factionImageField.setImage(emblemImage);

  // Fill in the backstory field
  backstoryField.setText(
    `Mario is a fictional character in the Mario video game franchise, owned by Nintendo and created by Japanese video game designer Shigeru Miyamoto. Serving as the company's mascot and the eponymous protagonist of the series, Mario has appeared in over 200 video games since his creation. Depicted as a short, pudgy, Italian plumber who resides in the Mushroom Kingdom, his adventures generally center upon rescuing Princess Peach from the Koopa villain Bowser. His younger brother and sidekick is Luigi.`,
  );

  // Fill in the traits field
  traitsField.setText(
    [
      `Mario can use three basic three power-ups:`,
      `  • the Super Mushroom, which causes Mario to grow larger`,
      `  • the Fire Flower, which allows Mario to throw fireballs`,
      `  • the Starman, which gives Mario temporary invincibility`,
    ].join('\n'),
  );

  // Fill in the treasure field
  treasureField.setText(['• Gold coins', '• Treasure chests'].join('\n'));

  fs.writeFileSync('out.pdf', await pdfDoc.save());
  openPdf('out.pdf', Reader.Preview);
})();
