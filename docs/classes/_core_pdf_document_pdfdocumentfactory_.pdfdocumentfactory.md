

# Hierarchy

**PDFDocumentFactory**

# Methods

<a id="create"></a>

## `<Static>` create

▸ **create**(): [PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md)

*Defined in [core/pdf-document/PDFDocumentFactory.ts:27](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-document/PDFDocumentFactory.ts#L27)*

Creates a new [PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md) object. Useful for creating new PDF documents.

**Returns:** [PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md)
The new [[PDFDocument]] object.

___
<a id="load"></a>

## `<Static>` load

▸ **load**(data: *`Uint8Array`*): [PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md)

*Defined in [core/pdf-document/PDFDocumentFactory.ts:54](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-document/PDFDocumentFactory.ts#L54)*

Loads an existing PDF document contained from the specified `Uint8Array` into a [PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md) object. Useful for modifying existing PDF documents.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| data | `Uint8Array` |  A \`Uint8Array\` containing the raw bytes of a PDF document. |

**Returns:** [PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md)
A [[PDFDocument]] object initialized from the provided document.

___

