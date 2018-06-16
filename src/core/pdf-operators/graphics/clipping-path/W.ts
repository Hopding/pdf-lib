import PDFOperator, {
  IPDFOperatorSingleton,
} from 'core/pdf-operators/PDFOperator';

/**
 * Modify the current clipping path by intersecting it with the current path,
 * using the nonzero winding number rule to determine which regions lie inside
 * the clipping path.
 */
const W = PDFOperator.createSingletonOp('W');

/**
 * Modify the current clipping path by intersecting it with the current path,
 * using the nonzero winding number rule to determine which regions lie inside
 * the clipping path.
 */
W.asterisk = PDFOperator.createSingletonOp('W*');

export default W;
