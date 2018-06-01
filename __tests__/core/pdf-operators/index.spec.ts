// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import PDFOperators from 'core/pdf-operators';

describe(`index`, () => {
  it(`matches the snapshot`, () => {
    expect(PDFOperators).toMatchSnapshot();
  });
});
