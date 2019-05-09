import { PDFBool, PDFContext, PDFDict, PDFName } from 'src/core';

const context = new PDFContext();
const dict = PDFDict.withContext(context);

dict.set(PDFName.of('FooBar!'), PDFBool.True);

console.log(dict.toString());
