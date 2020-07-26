import { Assets } from '..';
import { PDFDocument } from '../../..';

// const fieldNames = {
//   CharacterName: 'CharacterName 2',
//   Age: 'Age',
//   Height: 'Height',
//   Weight: 'Weight',
//   Eyes: 'Eyes',
//   Skin: 'Skin',
//   Hair: 'Hair',
//   Allies: 'Allies',
//   FactionName: 'FactionName',
//   Backstory: 'Backstory',
//   Traits: 'Feat+Traits',
//   Treasure: 'Treasure',
//   FactionSymbolImage: 'Faction Symbol Image',
//   CharacterImage: 'CHARACTER IMAGE',
// };

export default async (assets: Assets) => {
  const pdfDoc = await PDFDocument.load(assets.pdfs.dod_character);

  const form = pdfDoc.getForm();

  // const fields = form.getFields();
  // fields.forEach((field) => {
  //   const type = field.constructor.name;
  //   const namex = field.getName();
  //   console.log(`${type}: ${namex}`);
  // });

  const characterName = form.getTextField('CharacterName 2');
  characterName.setText('Mario');

  const age = form.getTextField('Age');
  age.setText('24 years');

  const height = form.getTextField('Height');
  height.setText(`5' 1"`);

  const weight = form.getTextField('Weight');
  weight.setText('196 lbs');

  const eyes = form.getTextField('Eyes');
  eyes.setText('blue');

  const skin = form.getTextField('Skin');
  skin.setText('white');

  const hair = form.getTextField('Hair');
  hair.setText('brown');

  const backstory = form.getTextField('Backstory');
  backstory.setText(
    [
      `Mario is a fictional character in the`,
      `Mario video game franchise, owned`,
      `by Nintendo and created by`,
      `Japanese video game designer`,
      `Shigeru Miyamoto. Serving as the`,
      `company's mascot and the`,
      `eponymous protagonist of the series,`,
      `Mario has appeared in over 200`,
      `video games since his creation.`,
      `Depicted as a short, pudgy, Italian`,
      `plumber who resides in the`,
      `Mushroom Kingdom, his adventures`,
      `generally center upon rescuing`,
      `Princess Peach from the Koopa `,
      `villain Bowser. His younger brother`,
      `and sidekick is Luigi.`,
    ].join('\n'),

    // TODO: Add automatic line wrapping to handle this type of thing:
    // `Mario is a fictional character in the Mario video game franchise, owned by Nintendo and created by Japanese video game designer Shigeru Miyamoto. Serving as the company's mascot and the eponymous protagonist of the series, Mario has appeared in over 200 video games since his creation. Depicted as a short, pudgy, Italian plumber who resides in the Mushroom Kingdom, his adventures generally center upon rescuing Princess Peach from the Koopa villain Bowser. His younger brother and sidekick is Luigi.`,
  );

  const featuresAndTraits = form.getTextField('Feat+Traits');
  featuresAndTraits.setText(
    [
      `   Mario can use three basic three power-ups:`,
      `    - the Super Mushroom, which causes Mario to grow larger`,
      `    - the Fire Flower, which allows Mario to throw fireballs`,
      `    - the Starman, which gives Mario temporary invincibility`,
    ].join('\n'),
  );

  const allies = form.getTextField('Allies');
  allies.setText(
    [
      `Allies:`,
      `    - Princess Daisy`,
      `    - Princess Peach`,
      `    - Rosalina`,
      `    - Geno`,
      `    - Luigi`,
      `    - Donkey Kong`,
      `    - Yoshi`,
      `    - Diddy Kong`,
      ``,
      `Organizations:`,
      `    - Italian Plumbers Association`,
    ].join('\n'),
  );

  const factionName = form.getTextField('FactionName');
  factionName.setText(`Mario's Emblem`);

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
