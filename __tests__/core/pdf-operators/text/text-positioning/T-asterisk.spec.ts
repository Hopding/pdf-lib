// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import TAsterisk from 'core/pdf-operators/text/text-positioning/T-asterisk';

import pdfOperatorSingletonTest from '../../PDFOperatorSingletonTest';

pdfOperatorSingletonTest('T-asterisk', 'T*', TAsterisk);
