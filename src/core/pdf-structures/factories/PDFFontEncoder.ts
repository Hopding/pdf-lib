import { PDFHexString } from 'core/pdf-objects';
interface IPDFFontEncoder {
  encodeText(text: string): PDFHexString;
}
export default IPDFFontEncoder;
