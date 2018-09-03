// tslint:disable-next-line:no-unused-variable
import PDFOperator, {
  IPDFOperatorSingleton,
} from 'core/pdf-operators/PDFOperator';

/**
 * Move to the start of the next line.
 * This operator has the same effect as the code
 * 0 -Tl Td
 * where Tl denotes the current leading parameter in the text state. The
 * negative of Tl is used here because Tl is the text leading expressed as a
 * positive number. Going to the next line entails decreasing the y coordinate.
 */
export default PDFOperator.createSingletonOp('T*');
