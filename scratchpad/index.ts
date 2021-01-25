import fs from 'fs';
import { openPdf, Reader } from './open';
import { PDFDocument } from 'src/index';

(async () => {
  // This should be a Uint8Array or ArrayBuffer
  // This data can be obtained in a number of different ways
  // If your running in a Node environment, you could use fs.readFile()
  // In the browser, you could make a fetch() call and use res.arrayBuffer()
  const formPdfBytes = fs.readFileSync('assets/pdfs/form_to_flatten.pdf');

  // Load a PDF with form fields
  const pdfDoc = await PDFDocument.load(formPdfBytes);

  // Get the form containing all the fields
  const form = pdfDoc.getForm();

  // Fill the form's fields
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

  // Flatten the form's fields
  form.flatten();

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();

  // For example, `pdfBytes` can be:
  //   • Written to a file in Node
  //   • Downloaded from the browser
  //   • Rendered in an <iframe>

  fs.writeFileSync('out.pdf', pdfBytes);
  openPdf('out.pdf', Reader.Preview);
})();
