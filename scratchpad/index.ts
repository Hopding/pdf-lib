import fs from 'fs';
import { openPdf, Reader } from './open';

import { PDFDocument, rgb } from 'src/index';

(async () => {
  const pdfDoc = await PDFDocument.create();

  const page = pdfDoc.addPage();
  page.drawText('Semi-Transparent Text', {
    color: rgb(0, 1, 1),
    opacity: 0.5,
    size: 50,
  });

  pdfDoc.addPage();
  pdfDoc.addPage();
  pdfDoc.addPage();
  pdfDoc.addPage();
  pdfDoc.addPage();
  pdfDoc.addPage();
  pdfDoc.addPage();
  
  /* Declaration required for testing removing below */
  // const first = 
  pdfDoc.addOutline('First Outline', { expanded: true, page: pdfDoc.getPage(0) });
  const outline = pdfDoc.addOutline('Second Outline (Page2)', {
    expanded: false,
    page: pdfDoc.getPage(1),
  });
  const suboutline = outline.addOutline('Child of Second (Page3)', {
    expanded: true,
    page: pdfDoc.getPage(2),
  });
  suboutline.addOutline('Grandchild of Second (Page4)', { expanded: true, page: pdfDoc.getPage(3) });
  outline.addOutline('Another Child of Second (Page5)', {
    expanded: true,
    page: pdfDoc.getPage(4),
  });
  const thirdChild = outline.addOutline('3rd Child of Second (Page5)', {
    expanded: true,
    page: pdfDoc.getPage(4),
  });
  thirdChild.addOutline('3rd`s progeny');
  outline.addOutline('4th Child of Second (Page5)', {
    expanded: true,
    page: pdfDoc.getPage(4),
  });
  pdfDoc.addOutline('Third Outline (Page6)', { expanded: true, page: pdfDoc.getPage(5) });
  pdfDoc.addOutline('Fourth Outline (Page7)', { expanded: true, page: pdfDoc.getPage(6) });


  const newPage = pdfDoc.addPage();
  const fifthSuboutline = pdfDoc.addOutline('Fifth Outline (newPage: Page8)', { expanded: true, page: newPage });
  const newPage2 = pdfDoc.addPage();
  fifthSuboutline.addOutline('Grandchild of Fifth (newPage2: Page9)', { expanded: true, page: newPage2 });

  /* Testing editing: */
  suboutline.setTitle('Changed title');
  outline.setPage(pdfDoc.getPage(7));
  outline.setTitle('link changed to index 7: Page8');
  suboutline.setExpanded(false);
  thirdChild.setPage(newPage2);
  thirdChild.setTitle('link changed to newPage2: Page9');

  /* Testing removing: */
  // suboutline.remove();
  // outline.remove();
  // first.remove();

  /**
   * Testing removing a page that an outline is linked to.
   * Outline will remain but link will not work as expected since 
   * Ref is pointed to a non-existent PDFObject.
   */
  // pdfDoc.removePage(1);

  /**
  * Testing assertIs and assertRange
  */
  /* out of range */
  // outline.setPage(null);
  // outline.setPage(undefined);

  const page = pdfDoc.addPage();

  const img = await pdfDoc.embedJpg(
    fs.readFileSync('assets/images/cmyk_colorspace.jpg'),
  );

  page.drawImage(img);

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync('./out.pdf', pdfBytes);

  openPdf('./out.pdf', Reader.Preview);
})();
