# Features
- [ ] Add feature to bypass validations (especially for prod builds).
- [ ] Support non-english unicode characters.
- [ ] Support page transfer between PDFs.
- [ ] Provide font metrics for the Standard 14 Fonts.
- [ ] Support PDF with comments by stripping them before parsing.
- [ ] Support stream decompression for non Flate-Encoded streams.
- [ ] Support annotations & links.
- [ ] Support Acroform manipulation.
- [ ] Support document outlines.
- [ ] Investigate possibility of saving PDFs as images using PDF-js.
- [ ] Consider detecting and removing duplicate objects to reduce file size,
      per: https://github.com/Hopding/pdf-lib/issues/9#issuecomment-413407284

# Documentation
- [ ] Add credits (file?) for the `test-pdfs`.
- [ ] Document `pdf-structures/factores`. Show how to obtain and use an image's
    width and height. Also show how to obtain width of a string in a given font.

# Tests
- [ ] Create more "example-oriented" tests
- [ ] Consider using PDF.js to render documents in unit tests to avoid needing
    humans to run integration tests all the time. Can use jest-image-snapshot to
    compare them.
- [ ] Add more tests for "parseDocument" function. Need to test parsing on
      - updated documents
      - linearized documents
      - documents with object streams
      - etc...
- [ ] Write some more tests for "PDFParser" class as well.
- [ ] Add unit tests for:
      - core/pdf-document/*
      - core/pdf-parser/encoding/*
      - core/pdf-structures/factories/*
      - utils/*
- [ ] Add unit tests for simple and composite PDFOperator helpers

# Bugs
- [ ] Investigate `pdfDoc.removePage` for `assets.pdfs.linearized_with_object_streams`.
    There might be a bug when removing first page or large numbers of pages?
- [ ] Update "parseTrailer" to handle files without "xref" and "trailer" keywords,
    as they are _not_ malformatted, but are to be expected in 1.5+ PDFs.
- [ ] Investigate why adding "TESTING" (using following non-embedded font) to
    `test-pdfs/pdf/ef/inst/ef_ins_1040.pdf` messes up the text within the
    "Caution" sections (might be due to a font name conflict?):
    ```
      pageFont.set(
        'F1',
        PDFDictionary.from({
          Type: PDFName.from('Font'),
          Subtype: PDFName.from('Type1'),
          BaseFont: PDFName.from('Times-Roman'),
        }),
      );
    ```
- [ ] When parsing PDFs with update sections, the PDFDocumentFactory.normalize
    function doesn't currently respect object deletions - it simply picks up the
    most recent version of each object.

# Dependencies
- [ ] Take another look at `fontkit` and `unicode-properties` forks and see if
    they are really necessary.
- [ ] Add TypeScript types for `fontkit` and `png-js` libraries.
- [ ] Try changing imports for node-specific libraries in `fontkit` fork to avoid
    the need to browserify the whole module. Also investigate why it's necessary
    to do so in React Native, but not the browser? Maybe just need to uglify
    (not browserify) it?
- [ ] If `fontkit`, `unicode-properties`, and `png-js` forks are going to be kept,
    then publish them to NPM as proper modules.

# Code Quality
- [ ] Lint for unused imports.
- [ ] Try using [`gulp-typescript`](https://github.com/ivogabe/gulp-typescript)
    for compilation.
- [ ] Try using [decorators](http://www.typescriptlang.org/docs/handbook/decorators.html)
    for argument validation, instead of manually typing them all out.
- [ ] Reduce bundle size. Only import `lodash` functions that are actually used.
- [ ] Add in "early stops" to parsers (like checking if first char is a "<", for
    hex strings) to avoid excessive work.
- [ ] Try using `Length` entry when parsing streams. See if it is any faster.
- [ ] Try using xref tables to parse the file on the fly instead of brute-force
    parsing it all in one go. See it it improves performance.
- [ ] See if `parseLinearization` is even necessary? It looks like the
    "linearization" section of a PDF might just be the same in structure as an
     update section, which is already handled.
- [ ] Consider removing the "validKeys" stuff from PDFDictionaries?
- [ ] Make sure PDFDocument validates existence of its catalog.
- [ ] Clean up "parseDocument" function.
- [ ] Use multiple XRef streams for large documents with many pages, to improve
      performance of readers. This way they can randomly access the objects as
      needed, rather than being forced to decode one giant stream before they
      can render anything.
