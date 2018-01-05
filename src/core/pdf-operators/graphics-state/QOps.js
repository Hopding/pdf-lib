/* @flow */
import PDFOperator from '../PDFOperator';

export default {
  /**
  Save the current graphics state on the graphics state stack
  */
  q: PDFOperator.createSingleton('q'),
  /**
  Restore the graphics state by removing the most recently saved state from the
  stack and making it the current state
  */
  Q: PDFOperator.createSingleton('Q'),
};
