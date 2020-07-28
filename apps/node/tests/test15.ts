import { Assets } from '..';
import { PDFDocument } from '../../..';

// TODO: Test rotated image field (sample PDF/URL should be in one of the GitHub issues...)

export default async (assets: Assets) => {
  const pdfDoc = await PDFDocument.load(assets.pdfs.dod_character);

  const marioImage = await pdfDoc.embedPng(assets.images.png.small_mario);
  const emblemImage = await pdfDoc.embedPng(assets.images.png.mario_emblem);

  const form = pdfDoc.getForm();

  form.getTextField('CharacterName 2').setText('Mario');
  form.getTextField('Age').setText('24 years');
  form.getTextField('Height').setText(`5' 1"`);
  form.getTextField('Weight').setText('196 lbs');
  form.getTextField('Eyes').setText('blue');
  form.getTextField('Skin').setText('white');
  form.getTextField('Hair').setText('brown');

  form.getButton('CHARACTER IMAGE').setImage(marioImage);

  form
    .getTextField('Allies')
    .setText(
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
        `    - Italian Plumbers Association`,
      ].join('\n'),
    );

  form.getTextField('FactionName').setText(`Mario's Emblem`);
  form.getButton('Faction Symbol Image').setImage(emblemImage);

  form
    .getTextField('Backstory')
    .setText(
      `Mario is a fictional character in the Mario video game franchise, owned by Nintendo and created by Japanese video game designer Shigeru Miyamoto. Serving as the company's mascot and the eponymous protagonist of the series, Mario has appeared in over 200 video games since his creation. Depicted as a short, pudgy, Italian plumber who resides in the Mushroom Kingdom, his adventures generally center upon rescuing Princess Peach from the Koopa villain Bowser. His younger brother and sidekick is Luigi.`,
    );

  form
    .getTextField('Feat+Traits')
    .setText(
      [
        `Mario can use three basic three power-ups:`,
        `  • the Super Mushroom, which causes Mario to grow larger`,
        `  • the Fire Flower, which allows Mario to throw fireballs`,
        `  • the Starman, which gives Mario temporary invincibility`,
      ].join('\n'),
    );

  form
    .getTextField('Treasure')
    .setText(['• Gold coins', '• Treasure chests'].join('\n'));

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
