import fs from 'fs';
import { openPdf, Reader } from './open';
import { PDFDocument, StandardFonts } from 'src/index';

(async () => {
  // Create a new PDFDocument
  const pdfDoc = await PDFDocument.create();

  // Embed the Helvetica font
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Add a blank page to the document
  const page = pdfDoc.addPage([550, 750]);

  // Get the form so we can add fields to it
  const form = pdfDoc.getForm();

  // Add the superhero text field and description
  page.drawText('Enter your favorite superhero:', { x: 50, y: 700, size: 20 });

  const superheroField = form.createTextField('favorite.superhero');
  superheroField.setText('One Punch Man');
  superheroField.addToPage(helvetica, page, { x: 55, y: 640 });

  // Add the rocket radio group, labels, and description
  page.drawText('Select your favorite rocket:', { x: 50, y: 600, size: 20 });

  page.drawText('Falcon Heavy', { x: 120, y: 560, size: 18 });
  page.drawText('Saturn IV', { x: 120, y: 500, size: 18 });
  page.drawText('Delta IV Heavy', { x: 340, y: 560, size: 18 });
  page.drawText('Space Launch System', { x: 340, y: 500, size: 18 });

  const rocketField = form.createRadioGroup('favorite.rocket');
  rocketField.addOptionToPage('Falcon Heavy', page, { x: 55, y: 540 });
  rocketField.addOptionToPage('Saturn IV', page, { x: 55, y: 480 });
  rocketField.addOptionToPage('Delta IV Heavy', page, { x: 275, y: 540 });
  rocketField.addOptionToPage('Space Launch System', page, { x: 275, y: 480 });
  rocketField.select('Saturn IV');

  // Add the gundam check boxes, labels, and description
  page.drawText('Select your favorite gundams:', { x: 50, y: 440, size: 20 });

  page.drawText('Exia', { x: 120, y: 400, size: 18 });
  page.drawText('Kyrios', { x: 120, y: 340, size: 18 });
  page.drawText('Virtue', { x: 340, y: 400, size: 18 });
  page.drawText('Dynames', { x: 340, y: 340, size: 18 });

  const exiaField = form.createCheckBox('gundam.exia');
  const kyriosField = form.createCheckBox('gundam.kyrios');
  const virtueField = form.createCheckBox('gundam.virtue');
  const dynamesField = form.createCheckBox('gundam.dynames');

  exiaField.addToPage(page, { x: 55, y: 380 });
  kyriosField.addToPage(page, { x: 55, y: 320 });
  virtueField.addToPage(page, { x: 275, y: 380 });
  dynamesField.addToPage(page, { x: 275, y: 320 });

  exiaField.check();
  dynamesField.check();

  // Add the planet dropdown and description
  page.drawText('Select your favorite planet*:', { x: 50, y: 280, size: 20 });

  const planetsField = form.createDropdown('favorite.planet');
  planetsField.addOptions(['Venus', 'Earth', 'Mars', 'Pluto']);
  planetsField.select('Pluto');
  planetsField.addToPage(helvetica, page, { x: 55, y: 220 });

  // Add the people option list and description
  page.drawText('Select your favorite people:', { x: 50, y: 180, size: 18 });

  const peopleField = form.createOptionList('favorite.people');
  peopleField.addOptions([
    'Julius Caesar',
    'Ada Lovelace',
    'Cleopatra',
    'Alexander Hamilton',
    'Mark Antony',
  ]);
  peopleField.select(['Ada Lovelace', 'Alexander Hamilton']);
  peopleField.addToPage(helvetica, page, { x: 55, y: 70 });

  // Just saying...
  page.drawText(`* Pluto should be a planet too!`, { x: 15, y: 15, size: 15 });

  fs.writeFileSync('out.pdf', await pdfDoc.save());
  openPdf('out.pdf', Reader.Preview);
})();
