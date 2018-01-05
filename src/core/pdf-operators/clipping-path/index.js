/* @flow */
import PDFOperator from '../PDFOperator';

export default {
  W: {
    /*
    Modify the current clipping path by intersecting it with the current path,
    using the nonzero winding number rule to determine which regions lie inside
    the clipping path.
     */
    ...PDFOperator.createSingleton('W'),
    /*
    Modify the current clipping path by intersecting it with the current path,
    using the nonzero winding number rule to determine which regions lie inside
    the clipping path.
    */
    asterisk: PDFOperator.createSingleton('W*'),
  },
};
