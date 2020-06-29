import { PDFDocument, PDFImage } from './dist/pdf-lib.esm.js';

const readImage = (image: string) => Deno.readFileSync(`assets/images/${image}`);

const getRes = async (url:string, doc:PDFDocument) => {
  let img : PDFImage;
  const imgBytes = readImage(url);
  if (url.substr( url.lastIndexOf('.')+1, 3 ) === 'jpg')
    img = await doc.embedJpg(imgBytes);
  else
    img = await doc.embedPng(imgBytes);
  return `Image: ${url} => resolution: ${img.resolution} dpi`;
}

const main = async () => {

  
  const pdfDoc = await PDFDocument.create({});
  
  var page = pdfDoc.addPage([800,800]);
  
  // embed page from other PDF using blendMode
  
  console.log(await getRes('cmyk_colorspace.jpg', pdfDoc));
  console.log(await getRes('with_physical_dimensions.png', pdfDoc));
  console.log(await getRes('cat_riding_unicorn.jpg', pdfDoc));

}

main().then( () => console.log("Done."));