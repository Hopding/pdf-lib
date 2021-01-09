import fontkit from "@pdf-lib/fontkit";
import fs from 'fs';
import { PDFDocument, rgb } from 'src/index';
import { openPdf, Reader } from './open';

(async () => {
  // This should be a Uint8Array or ArrayBuffer
  // This data can be obtained in a number of different ways
  // If your running in a Node environment, you could use fs.readFile()
  // In the browser, you could make a fetch() call and use res.arrayBuffer()
  const formPdfBytes = fs.readFileSync('assets/pdfs/form_to_flatten.pdf');
  const pdfDoc = await PDFDocument.load(formPdfBytes);
  pdfDoc.registerFontkit(fontkit)  // Load a PDF with form fields


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

  // Flatten the form's fields
  form.flatten();

  const sarabunFontBytes = fs.readFileSync('assets/fonts/sarabun_psk/THSarabunNew.ttf');
  const sarabunFont = await pdfDoc.embedFont(sarabunFontBytes)
  const promptFontBytes = fs.readFileSync('assets/fonts/prompt/prompt-regular.ttf');
  const promptFont = await pdfDoc.embedFont(promptFontBytes)
  const page = pdfDoc.getPage(0)

  page.drawText('น้ำ', {
    x: 50,
    y: 2 + 200,
    size: 18,
    font: sarabunFont,
    color: rgb(0.95, 0.1, 0.1),
  })
  page.drawText('น้ำ', {
    x: 5,
    y: 2 + 200,
    size: 18,
    font: promptFont,
    color: rgb(0.95, 0.1, 0.1),
  })

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();

  // For example, `pdfBytes` can be:
  //   • Written to a file in Node
  //   • Downloaded from the browser
  //   • Rendered in an <iframe>

  fs.writeFileSync('out.pdf', pdfBytes);
  openPdf('out.pdf', Reader.Preview);
})();
