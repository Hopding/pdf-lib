import fs from 'fs';
import {
  PDFCatalog,
  PDFContentStream,
  PDFContext,
  PDFName,
  PDFNumber,
  PDFOperator,
  PDFOperatorNames as Ops,
  PDFPageLeaf,
  PDFPageTree,
  PDFWriter,
  StandardFontEmbedder,
  StandardFonts,
} from 'src/index';

console.time('Scratchpad');

const helveticaEmbedder = StandardFontEmbedder.for(StandardFonts.Helvetica);

const context = PDFContext.create();

const operators = [
  PDFOperator.of(Ops.BeginText),
  PDFOperator.of(Ops.SetFontAndSize, [PDFName.of('F1'), PDFNumber.of(24)]),
  PDFOperator.of(Ops.MoveText, [PDFNumber.of(100), PDFNumber.of(100)]),
  PDFOperator.of(Ops.ShowText, [
    helveticaEmbedder.encodeText('Hello World and stuff!'),
  ]),
  PDFOperator.of(Ops.EndText),
];
const contentStreamDict = context.obj({});
const contentStream = PDFContentStream.of(contentStreamDict, operators);
const contentStreamRef = context.register(contentStream);

const helveticaFontRef = helveticaEmbedder.embedIntoContext(context);

const pageTree = PDFPageTree.withContext(context);
const pageTreeRef = context.register(pageTree);

const pageLeaf = PDFPageLeaf.withContextAndParent(context, pageTreeRef);
pageLeaf.set(PDFName.of('Contents'), contentStreamRef);
pageLeaf.set(
  PDFName.of('Resources'),
  context.obj({ Font: { F1: helveticaFontRef } }),
);
const pageRef = context.register(pageLeaf);

pageTree.pushLeafNode(pageRef);

const catalog = PDFCatalog.withContextAndPages(context, pageTreeRef);
context.trailerInfo.Root = context.register(catalog);

const buffer = PDFWriter.serializeContextToBuffer(context);
console.timeEnd('Scratchpad');

fs.writeFileSync('./out.pdf', buffer);
console.log('File written to ./out.pdf');
