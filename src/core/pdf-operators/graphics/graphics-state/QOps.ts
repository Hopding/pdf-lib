// tslint:disable-next-line:no-unused-variable
import PDFOperator, {
  IPDFOperatorSingleton,
} from 'core/pdf-operators/PDFOperator';

export default {
  /**
   * Save the current graphics state on the graphics state stack
   */
  q: PDFOperator.createSingletonOp('q'),
  /**
   * Restore the graphics state by removing the most recently saved state from the
   * stack and making it the current state
   */
  Q: PDFOperator.createSingletonOp('Q'),
};
