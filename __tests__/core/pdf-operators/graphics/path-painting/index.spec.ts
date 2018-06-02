// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import * as PathPaintingOps from 'core/pdf-operators/graphics/path-painting';

import pdfOperatorSingletonTest from '../../PDFOperatorSingletonTest';

pdfOperatorSingletonTest('S', 'S', PathPaintingOps.S);

pdfOperatorSingletonTest('s', 's', PathPaintingOps.s);

pdfOperatorSingletonTest('f', 'f', PathPaintingOps.f);

pdfOperatorSingletonTest('f.asterisk', 'f*', PathPaintingOps.f.asterisk);

pdfOperatorSingletonTest('F', 'F', PathPaintingOps.F);

pdfOperatorSingletonTest('B', 'B', PathPaintingOps.B);

pdfOperatorSingletonTest('B.asterisk', 'B*', PathPaintingOps.B.asterisk);

pdfOperatorSingletonTest('b', 'b', PathPaintingOps.b);

pdfOperatorSingletonTest('b.asterisk', 'b*', PathPaintingOps.b.asterisk);

pdfOperatorSingletonTest('n', 'n', PathPaintingOps.n);
