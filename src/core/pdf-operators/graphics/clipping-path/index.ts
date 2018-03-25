import PDFOperator from 'core/pdf-operators/PDFOperator';

export default {
  W: {
    /*
    Modify the current clipping path by intersecting it with the current path,
    using the nonzero winding number rule to determine which regions lie inside
    the clipping path.
     */
    ...PDFOperator.createSingletonOp('W'),
    /*
    Modify the current clipping path by intersecting it with the current path,
    using the nonzero winding number rule to determine which regions lie inside
    the clipping path.
    */
    asterisk: PDFOperator.createSingletonOp('W*'),
  },
};
