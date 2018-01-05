/* @flow */
import PDFOperator from '../PDFOperator';

export default {
  b: {
    ...PDFOperator.createSingleton('b'),
    asterisk: PDFOperator.createSingleton('b*'),
  },
  f: {
    ...PDFOperator.createSingleton('f'),
    asterisk: PDFOperator.createSingleton('f*'),
  },
  s: PDFOperator.createSingleton('s'),
  n: PDFOperator.createSingleton('n'),
  B: {
    ...PDFOperator.createSingleton('B'),
    asterisk: PDFOperator.createSingleton('B*'),
  },
  F: PDFOperator.createSingleton('F'),
  S: PDFOperator.createSingleton('S'),
};
