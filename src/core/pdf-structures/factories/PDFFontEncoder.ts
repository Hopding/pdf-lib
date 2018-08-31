import {
  PDFHexString,
} from 'core/pdf-objects';
interface PDFFontEncoder {
	encodeText(text: string): PDFHexString;
}
export default PDFFontEncoder