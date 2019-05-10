import { PDFBool, PDFContext, PDFName, PDFWriter } from 'src/core';

const context = PDFContext.create();

const a = context.obj([{ foo: true, bar: PDFBool.False }, PDFName.of('test')]);
const b = context.obj('foobar!');
const c = context.obj({ foo: 'bar', wut: PDFName.of('Hello!') });

console.log(a.toString());
console.log();
console.log(b.toString());
console.log();
console.log(c.toString());

context.register(a);
context.register(b);
context.register(c);

PDFWriter.forContext(context).serializeToPDF();
