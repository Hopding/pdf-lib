/**
 * Decodes an Uint16Array to string using the PDFDocEncoding.
 *
 * @param input A Uint16Array containing the PDFDocEncoding of the input string
 */
export const pdfDocEncodingDecode = (input: Uint16Array): string => {
  // TODO implement pdfdocencoding decoding. maybe unicode decode does the trick (have a closer look at appendix D and table d.2)
  console.log('PDFDocEncoding decode called for: ', input);
  throw new Error('PDFDocEncoding not supported yet');
};
