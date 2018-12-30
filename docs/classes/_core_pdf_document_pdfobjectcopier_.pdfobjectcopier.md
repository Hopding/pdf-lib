

PDFObjectCopier copies PDFObjects from a src index to a dest index. The primary use case for this is to copy pages between PDFs.

_Copying_ an object with a PDFObjectCopier is different from _cloning_ an object with its \[\[PDFObject.clone\]\] method:

```
const origObject = ...
  const copiedObject = PDFObjectCopier.for(srcIndex, destIndex).copy(origObject);
  const clonedObject = originalObject.clone();
```

Copying an object is equivalent to cloning it and then copying over any other objects that it references. Note that only dictionaries, arrays, and streams (or structures build from them) can contain indirect references to other objects. Copying a PDFObject that is not a dictionary, array, or stream is supported, but is equivalent to cloning it.

# Hierarchy

**PDFObjectCopier**

# Constructors

<a id="constructor"></a>

##  constructor

⊕ **new PDFObjectCopier**(srcIndex: *`PDFObjectIndex`*, destIndex: *`PDFObjectIndex`*): [PDFObjectCopier](_core_pdf_document_pdfobjectcopier_.pdfobjectcopier.md)

*Defined in [core/pdf-document/PDFObjectCopier.ts:36](https://github.com/Hopding/pdf-lib/blob/0d3a994/src/core/pdf-document/PDFObjectCopier.ts#L36)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| srcIndex | `PDFObjectIndex` |
| destIndex | `PDFObjectIndex` |

**Returns:** [PDFObjectCopier](_core_pdf_document_pdfobjectcopier_.pdfobjectcopier.md)

___

# Methods

<a id="copy"></a>

##  copy

▸ **copy**T(object: *`T`*): `T`

*Defined in [core/pdf-document/PDFObjectCopier.ts:44](https://github.com/Hopding/pdf-lib/blob/0d3a994/src/core/pdf-document/PDFObjectCopier.ts#L44)*

**Type parameters:**

#### T :  `PDFObject`
**Parameters:**

| Param | Type |
| ------ | ------ |
| object | `T` |

**Returns:** `T`

___
<a id="for"></a>

## `<Static>` for

▸ **for**(srcIndex: *`PDFObjectIndex`*, destIndex: *`PDFObjectIndex`*): [PDFObjectCopier](_core_pdf_document_pdfobjectcopier_.pdfobjectcopier.md)

*Defined in [core/pdf-document/PDFObjectCopier.ts:31](https://github.com/Hopding/pdf-lib/blob/0d3a994/src/core/pdf-document/PDFObjectCopier.ts#L31)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| srcIndex | `PDFObjectIndex` |
| destIndex | `PDFObjectIndex` |

**Returns:** [PDFObjectCopier](_core_pdf_document_pdfobjectcopier_.pdfobjectcopier.md)

___

