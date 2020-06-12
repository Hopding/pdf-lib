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
  pdfDoc.addOutline('First Outline', { expanded: true, linkIndex: 0 });
  const outline = pdfDoc.addOutline('Second Outline (page2)', {
    expanded: false,
    linkIndex: 1,
  });
  const suboutline = outline.addOutline('Child of Second (page3)', {
    expanded: true,
    linkIndex: 2,
  });
  suboutline.addOutline('Grandchild of Second (page4)', { expanded: true, linkIndex: 3 });
  outline.addOutline('Another Child of Second (page5)', {
    expanded: true,
    linkIndex: 4,
  });
  const thirdChild = outline.addOutline('3rd Child of Second (page5)', {
    expanded: true,
    linkIndex: 4,
  });
  thirdChild.addOutline('3rd`s progeny');
  outline.addOutline('4th Child of Second (page5)', {
    expanded: true,
    linkIndex: 4,
  });
  pdfDoc.addOutline('Third Outline (Page6)', { expanded: true, linkIndex: 5 });
  pdfDoc.addOutline('Fourth Outline (Page7)', { expanded: true, linkIndex: 6 });


  const newPage = pdfDoc.addPage();
  const fifthSuboutline = pdfDoc.addOutline('Fifth Outline (newPage: Page8)', { expanded: true, linkPage: newPage });
  const newPage2 = pdfDoc.addPage();
  fifthSuboutline.addOutline('Grandchild of Fifth (newPage2: page9)', { expanded: true, linkPage: newPage2 });

  /* Testing editing: */
  // suboutline.setTitle('Changed title');
  // outline.linkIndex(7);
  // outline.setTitle('link changed to index 7');
  // suboutline.setExpanded(false);
  // thirdChild.linkPage(newPage2);
  // thirdChild.setTitle('link changed to newPage2: page9');

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

  pdfDoc.addPage();

  const img = await pdfDoc.embedJpg(
    fs.readFileSync('assets/images/cmyk_colorspace.jpg'),
  );

  page.drawImage(img);

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync('./out.pdf', pdfBytes);

  openPdf('./out.pdf', Reader.Preview);
})();
