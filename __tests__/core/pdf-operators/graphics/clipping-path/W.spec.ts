// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import W from 'core/pdf-operators/graphics/clipping-path/W';

import pdfOperatorSingletonTest from '../../PDFOperatorSingletonTest';

pdfOperatorSingletonTest('W', 'W', W);
pdfOperatorSingletonTest('W-asterisk', 'W*', W.asterisk);
