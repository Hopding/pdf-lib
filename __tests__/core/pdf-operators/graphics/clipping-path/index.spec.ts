// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import ClippingPathOps from 'core/pdf-operators/graphics/clipping-path/';

import pdfOperatorSingletonTest from '../../PDFOperatorSingletonTest';

pdfOperatorSingletonTest('W', 'W', ClippingPathOps.W);
pdfOperatorSingletonTest('W-asterisk', 'W*', ClippingPathOps.W.asterisk);
