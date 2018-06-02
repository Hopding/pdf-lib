// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import h from 'core/pdf-operators/graphics/path-construction/h';

import pdfOperatorSingletonTest from '../../PDFOperatorSingletonTest';

pdfOperatorSingletonTest('h', 'h', h);
