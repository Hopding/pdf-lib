const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function fixBlankPdf() {
  try {
    console.log('Reading input.pdf...');
    const pdfBytes = fs.readFileSync('input.pdf');
    
    // Carrega o original
    const srcDoc = await PDFDocument.load(pdfBytes);
    
    // Cria um PDF NOVO do zero
    const newDoc = await PDFDocument.create();

    console.log('Copying and cleaning pages...');
    const pageIndices = srcDoc.getPageIndices();
    
    // Esta função copyPages tenta extrair o conteúdo visual de forma independente
    const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);

    copiedPages.forEach((page) => {
      newDoc.addPage(page);
    });

    console.log('Saving with compatibility settings...');
    // Tentamos salvar sem compressão para garantir que nada suma
    const finalBytes = await newDoc.save({ 
      useObjectStreams: false,
      addDefaultFont: true // Tenta forçar uma fonte caso a original tenha sumido
    });

    fs.writeFileSync('output_fixed_v2.pdf', finalBytes);
    console.log('Done! Check "output_fixed_v2.pdf"');
  } catch (err) {
    console.error('Error:', err);
  }
}

fixBlankPdf();