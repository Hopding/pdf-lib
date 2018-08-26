

# Hierarchy

**PDFDocumentWriter**

# Methods

<a id="savetobytes"></a>

## `<Static>` saveToBytes

▸ **saveToBytes**(pdfDoc: *[PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md)*, options?: *`object`*): `Uint8Array`

*Defined in [core/pdf-document/PDFDocumentWriter.ts:71](https://github.com/Hopding/pdf-lib/blob/fd948bf/src/core/pdf-document/PDFDocumentWriter.ts#L71)*

Converts a [PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md) object into the raw bytes of a PDF document. These raw bytes could, for example, be saved as a file and opened in a PDF reader.

`options.useObjectStreams` controls whether or not to use Object Streams when saving the document. Using Object Streams will result in a smaller file size for many documents. This option is `true` by default. If set to `false`, then Object Streams will not be used.

**Parameters:**

| Param | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| pdfDoc | [PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md) | - |  The [PDFDocument](_core_pdf_document_pdfdocument_.pdfdocument.md) to be converted to bytes. |
| `Default value` options | `object` |  { useObjectStreams: true } |  An options object. |

**Returns:** `Uint8Array`
A `Uint8Array` containing the raw bytes of a PDF document.

___

