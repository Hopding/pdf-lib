import { Assets } from '../index.ts';
import { 
    PDFDocument,
    PDFPage
} from '../../../dist/pdf-lib.esm.js';

export default async (assets: Assets) => {

    const pdfDoc = await PDFDocument.load(assets.with_annots);

    pdfDoc.getPages().forEach((p: PDFPage) =>{
        p.scaleContent(0.5, 0.5);
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}