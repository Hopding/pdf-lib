// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import QOps from 'core/pdf-operators/graphics/graphics-state/QOps';

import pdfOperatorSingletonTest from '../../PDFOperatorSingletonTest';

pdfOperatorSingletonTest('Q', 'Q', QOps.Q);
pdfOperatorSingletonTest('q', 'q', QOps.q);
