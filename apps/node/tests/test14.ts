import { Assets } from '..';
import { PDFDocument } from '../../..';

// fs.readFileSync('/Users/user/Desktop/f1040.pdf'),
// fs.readFileSync('/Users/user/Desktop/copy_f1040.pdf'),
// fs.readFileSync('/Users/user/Desktop/pdfbox_f1040.pdf'),

// fs.readFileSync('/Users/user/Desktop/comb_form.pdf'),
// fs.readFileSync('/Users/user/Desktop/f1099msc.pdf'),
// fs.readFileSync('/Users/user/Desktop/radios.pdf'),

export default async (assets: Assets) => {
  const pdfDoc = await PDFDocument.load(assets.pdfs.with_combed_fields);

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
