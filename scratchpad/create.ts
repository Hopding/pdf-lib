import fs from 'fs';
import {
  PDFCatalog,
  PDFContext,
  PDFName,
  PDFPageLeaf,
  PDFPageTree,
  PDFWriter,
} from 'src/index';

console.time('Scratchpad');

const context = PDFContext.create();

const contentStream = context.stream(`
  BT
    /F1 24 Tf
    100 100 Td
    (Hello World and stuff!) Tj
  ET
`);
const contentStreamRef = context.register(contentStream);

const fontDict = context.obj({
  Type: 'Font',
  Subtype: 'Type1',
  Name: 'F1',
  BaseFont: 'Helvetica',
  Encoding: 'MacRomanEncoding',
});
const fontDictRef = context.register(fontDict);

const pageTree = PDFPageTree.withContext(context);
const pageTreeRef = context.register(pageTree);

const pageLeaf = PDFPageLeaf.withContextAndParent(context, pageTreeRef);
pageLeaf.set(PDFName.of('Contents'), contentStreamRef);
pageLeaf.set(
  PDFName.of('Resources'),
  context.obj({ Font: { F1: fontDictRef } }),
);
const pageRef = context.register(pageLeaf);

pageTree.pushLeafNode(pageRef);

const catalog = PDFCatalog.withContextAndPages(context, pageTreeRef);
context.trailerInfo.Root = context.register(catalog);

const buffer = PDFWriter.serializeContextToBuffer(context);
console.timeEnd('Scratchpad');

fs.writeFileSync('./out.pdf', buffer);
console.log('File written to ./out.pdf');
