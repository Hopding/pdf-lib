

# Hierarchy

**PDFDocumentWriter**

# Methods

<a id="savetobytes"></a>

## `<Static>` saveToBytes

▸ **saveToBytes**(pdfDoc: *[PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md)*): `Uint8Array`

*Defined in [core/pdf-document/PDFDocumentWriter.ts:23](https://github.com/Hopding/pdf-lib/blob/10ef001/src/core/pdf-document/PDFDocumentWriter.ts#L23)*

Converts a [PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md) object into the raw bytes of a PDF document. These raw bytes could, for example, be saved as a file and opened in a PDF reader.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| pdfDoc | [PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md) |  The [PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md) to be converted to bytes. |

**Returns:** `Uint8Array`
A `Uint8Array` containing the raw bytes of a PDF document.

___

