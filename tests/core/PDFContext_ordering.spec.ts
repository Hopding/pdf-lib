import fs from 'fs';
import { PDFDocument } from 'src/index';
import PDFContext from 'src/core/PDFContext';
import PDFRef from 'src/core/objects/PDFRef';

/**
 * Tests for Issue #951 - Corrupted PDF on save with incremental updates
 * @see https://github.com/Hopding/pdf-lib/issues/951
 * 
 * The issue occurs when pdf-lib loads and saves PDFs that use the "Incremental
 * Update" feature of the PDF format. The previous implementation always sorted
 * objects by object number during enumeration, which corrupted PDFs by
 * invalidating the byte offsets in the XRef table.
 * 
 * The fix tracks whether new objects have been registered, and only sorts
 * objects when necessary (when new objects are added that need to be
 * integrated into the object number sequence).
 */
describe('Issue #951 - Corrupted PDF on save with incremental updates', () => {
    describe('PDFContext.enumerateIndirectObjects ordering', () => {
        it('should NOT sort objects when no new objects are registered', () => {
            const context = PDFContext.create();

            // Simulate loading objects from a PDF - assign directly without using register()
            // This mimics what the parser does when loading an existing PDF
            const obj1 = context.obj({ Type: 'Font' });
            const obj2 = context.obj({ Type: 'Page' });
            const obj3 = context.obj({ Type: 'Catalog' });

            // PDFRef.of creates refs with specific object numbers
            // Assign in non-sequential order to test ordering behavior
            // In real parsing, objects may not come in sequential order
            context.assign(PDFRef.of(5), obj1);
            context.assign(PDFRef.of(2), obj2);
            context.assign(PDFRef.of(8), obj3);

            // When NO new objects are registered via register(), 
            // enumeration should preserve insertion order (not sorted)
            const entries = context.enumerateIndirectObjects();
            const objectNumbers = entries.map(([ref]) => ref.objectNumber);

            // Should maintain insertion order: 5, 2, 8 (not sorted as 2, 5, 8)
            expect(objectNumbers).toEqual([5, 2, 8]);
        });

        it('should sort objects when new objects ARE registered', () => {
            const context = PDFContext.create();

            // Assign existing objects
            const obj1 = context.obj({ Type: 'Font' });
            const obj2 = context.obj({ Type: 'Page' });
            context.assign(PDFRef.of(5), obj1);
            context.assign(PDFRef.of(2), obj2);

            // Register a NEW object (this triggers needsReordering = true)
            const newObj = context.obj({ Type: 'NewObject' });
            context.register(newObj);

            // Now enumeration SHOULD sort by object number
            const entries = context.enumerateIndirectObjects();
            const objectNumbers = entries.map(([ref]) => ref.objectNumber);


            // Should be sorted: 2, 5, 6 (the new one gets objectNumber 6 since largestObjectNumber was 5)
            expect(objectNumbers).toEqual([2, 5, 6]);
        });

        it('should sort objects when using nextRef() + assign() pattern (embedder code path)', () => {
            const context = PDFContext.create();

            // Assign existing objects (simulates loading from PDF)
            const obj1 = context.obj({ Type: 'Font' });
            const obj2 = context.obj({ Type: 'Page' });
            context.assign(PDFRef.of(5), obj1);
            context.assign(PDFRef.of(2), obj2);

            // This is the pattern used by embedders (JavaScriptEmbedder, CustomFontEmbedder, etc.)
            // They call nextRef() first, then later assign() with that ref
            const ref = context.nextRef(); // This should trigger needsReordering = true
            const newObj = context.obj({ Type: 'EmbeddedObject' });
            context.assign(ref, newObj);

            // Now enumeration SHOULD sort by object number
            const entries = context.enumerateIndirectObjects();
            const objectNumbers = entries.map(([r]) => r.objectNumber);

            // Should be sorted: 2, 5, 6 (the new one from nextRef)
            expect(objectNumbers).toEqual([2, 5, 6]);
        });

        it('should correctly track largestObjectNumber when loading/assigning objects', () => {
            const context = PDFContext.create();

            context.assign(PDFRef.of(5), context.obj({ Type: 'Font' }));
            context.assign(PDFRef.of(2), context.obj({ Type: 'Page' }));
            context.assign(PDFRef.of(8), context.obj({ Type: 'Catalog' }));

            // After parsing/assigning, largestObjectNumber should be updated
            // Next ref should be 9 (8 + 1)
            const newRef = context.nextRef();
            expect(newRef.objectNumber).toBe(9);
        });
    });

    describe('Integration tests with real PDFs', () => {
        const incrementalUpdatesPdfPath = 'assets/pdfs/with_incremental_updates.pdf';
        const normalPdfPath = 'assets/pdfs/normal.pdf';

        const incrementalFileExists = fs.existsSync(incrementalUpdatesPdfPath);
        const normalFileExists = fs.existsSync(normalPdfPath);

        (incrementalFileExists ? it : it.skip)(
            'should preserve PDF with incremental updates when loading and saving without modifications',
            async () => {
                const inputBytes = fs.readFileSync(incrementalUpdatesPdfPath);

                // Load the PDF without making any modifications
                const pdfDoc = await PDFDocument.load(inputBytes);
                const pageCount = pdfDoc.getPageCount();

                // Save the PDF
                const savedBytes = await pdfDoc.save();

                // Verify we can reload the saved PDF
                const reloadedDoc = await PDFDocument.load(savedBytes);
                expect(reloadedDoc.getPageCount()).toBe(pageCount);
            },
            30000 // 30 second timeout for large PDF processing
        );

        (incrementalFileExists ? it : it.skip)(
            'should preserve PDF with incremental updates when saving with useObjectStreams: false',
            async () => {
                const inputBytes = fs.readFileSync(incrementalUpdatesPdfPath);

                const pdfDoc = await PDFDocument.load(inputBytes);
                const pageCount = pdfDoc.getPageCount();

                // Save with useObjectStreams: false (as mentioned in the issue)
                const savedBytes = await pdfDoc.save({ useObjectStreams: false });

                // Verify reload
                const reloadedDoc = await PDFDocument.load(savedBytes);
                expect(reloadedDoc.getPageCount()).toBe(pageCount);
            },
            30000 // 30 second timeout for large PDF processing
        );

        (normalFileExists ? it : it.skip)(
            'should still correctly save PDFs when new content is added',
            async () => {
                const inputBytes = fs.readFileSync(normalPdfPath);

                const pdfDoc = await PDFDocument.load(inputBytes);
                const originalPageCount = pdfDoc.getPageCount();

                // Add a new page (this should trigger reordering)
                pdfDoc.addPage();

                const savedBytes = await pdfDoc.save();

                // Verify the new page was added correctly
                const reloadedDoc = await PDFDocument.load(savedBytes);
                expect(reloadedDoc.getPageCount()).toBe(originalPageCount + 1);
            }
        );
    });
});

