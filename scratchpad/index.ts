import fs from 'fs';
import { openPdf, Reader } from './open';
import { PDFDocument } from 'src/index';
import fontkit from '@pdf-lib/fontkit';

(async () => {
  // Fetch the PDF with form fields
  const formBytes = fs.readFileSync('assets/pdfs/dod_character.pdf');

  // Fetch the Ubuntu font
  const fontBytes = fs.readFileSync('assets/fonts/ubuntu/Ubuntu-R.ttf');

  // Load the PDF with form fields
  const pdfDoc = await PDFDocument.load(formBytes);

  // Embed the Ubuntu font
  pdfDoc.registerFontkit(fontkit);
  const ubuntuFont = await pdfDoc.embedFont(fontBytes);

  // Get two text fields from the form
  const form = pdfDoc.getForm();
  const nameField = form.getTextField('CharacterName 2');
  const ageField = form.getTextField('Age');

  // Fill the text fields with some fancy Unicode characters (outside
  // the WinAnsi latin character set)
  nameField.setText('Ӎӑȑїõ');
  ageField.setText('24 ŷȇȁŗš');

  // **Key Step:** Update the field appearances with the Ubuntu font
  form.updateFieldAppearances(ubuntuFont);

  // Save the PDF with filled form fields
  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync('out.pdf', pdfBytes);
  openPdf('out.pdf', Reader.Acrobat);
})();
