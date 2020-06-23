import { Assets } from '../index.ts';
import { PageSizes, PDFDocument, BlendMode, degrees, rgb } from '../../../dist/pdf-lib.esm.js';


const modeNames = Object.values<string>(BlendMode);
const objectSize = 80;
const numObjects = 60;

export default async (_assets: Assets) => {
  const pdfDoc = await PDFDocument.create();

  const page = pdfDoc.addPage(PageSizes.A4);
  
  const cx = page.getWidth()/2;
  const cy = page.getHeight()/2;
  
  const rnd = (max:number) : number => (Math.random()-0.5)*max;
  const lx = 35;
  
  page.drawText("pdf-lib Blend Mode Demo",
    {
      size: 24,
      x: lx,
      y: 738,
  }
  );
  for(let i=0; i<numObjects; i++){
      let r = Math.random();
      let g = Math.random();
      let b = Math.random();

      if (Math.random()<0.33){
        page.drawCircle({
          x: cx + rnd(cx),
          y: cy + rnd(cy),
          size: objectSize * rnd(1),
          color: rgb(r,g,b),
          blendMode: modeNames[i%modeNames.length],
        });
      }else{

        page.drawSquare({
          x: cx + rnd(cx),
          y: cy + rnd(cy),
          size: objectSize * rnd(1),
          rotate: degrees(rnd(360)),
          color: rgb(r,g,b),
          blendMode: modeNames[i%modeNames.length],
        });
      }
    };

  // add alpha-image with 'Screen' blend mode 
  const pngImage = await pdfDoc.embedPng(
    _assets.images.png.minions_banana_alpha,
  );
  const pngDims = pngImage.scale(0.5)
  
  page.drawImage(pngImage, {
    x: cx-pngDims.width/2,
    y: cy-pngDims.height/2,
    width: pngDims.width,
    height: pngDims.height,
    //rotate: degrees(30),
    //opacity: 0.75,
    blendMode: BlendMode.Screen
  })

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
