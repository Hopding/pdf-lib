/** @flow */
import PDFOperator from 'core/pdf-operators/PDFOperator';

export default {
  /**
   * Stroke the path.
   */
  S: PDFOperator.createSingletonOp('S'),
  /**
   * Close and stroke the path. This operator shall have the same effect as the sequence h S.
   */
  s: PDFOperator.createSingletonOp('s'),
  f: {
    /**
     * Fill the path, using the nonzero winding number rule to determine the region
     * to fill. Any subpaths that are open shall be implicitly closed before being
     * filled.
     */
    ...PDFOperator.createSingletonOp('f'),
    /**
     * Fill the path, using the even-odd rule to determine the region to fill.
     */
    asterisk: PDFOperator.createSingletonOp('f*'),
  },
  /**
   * Equivalent to f; included only for compatibility. Although PDF reader
   * applications shall be able to accept this operator, PDF writer applications
   * should use f instead.
   */
  F: PDFOperator.createSingletonOp('F'),
  B: {
    /**
     * Fill and then stroke the path, using the nonzero winding number rule to
     * determine the region to fill. This operator shall produce the same result as
     * constructing two identical path objects, painting the first with f and the
     * second with S.
     * NOTE: The filling and stroking portions of the operation consult different
     * values of several graphics state parameters, such as the current colour.
     */
    ...PDFOperator.createSingletonOp('B'),
    /**
     * Fill and then stroke the path, using the even-odd rule to determine the
     * region to fill. This operator shall produce the same result as B, except
     * that the path is filled as if with f* instead of f.
     */
    asterisk: PDFOperator.createSingletonOp('B*'),
  },
  b: {
    /**
     * Close, fill, and then stroke the path, using the nonzero winding number rule
     * to determine the region to fill. This operator shall have the same effect as
     * the sequence h B.
     */
    ...PDFOperator.createSingletonOp('b'),
    /**
     * Close, fill, and then stroke the path, using the even-odd rule to determine
     * the region to fill. This operator shall have the same effect as
     * the sequence h B*.
     */
    asterisk: PDFOperator.createSingletonOp('b*'),
  },
  /**
   * End the path object without filling or stroking it. This operator shall be a
   * path-painting no-op, used primarily for the side effect of changing the
   * current clipping path
   */
  n: PDFOperator.createSingletonOp('n'),
};
