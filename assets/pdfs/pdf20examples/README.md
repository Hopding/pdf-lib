# pdf20examples
PDF 2.0 example files - this is a collection of example PDF 2.0 files. The files in this collection are intended for educational purposes and are intentionally kept relatively simple. The examples in this set include:

## Simple PDF 2.0 file.pdf
This is a single page PDF that demonstrates a fairly simple set of text and path operators. The content stream for the PDF page contains comments that describe the operators being used to define the page content. This PDF includes example file metadata that you can use to see commonly provided XMP metadata fields.

## Simple 2.0 via incremental and offset start.pdf
This is an example of a PDF file that was updated from a PDF 1.7 file to a PDF 2.0 file. This shows how an incremental save might be used when an existing PDF 1.7 file is updated and you want to mark the PDF as a PDF 2.0 file. The page should display the string "PDF 2.0 files have spacing" if it is properly parsed and interpreted; a different string will display if the viewer is not capable of reading the incremental save in the file.
This example also shows how a PDF "file" may contain more than just PDF data. The comments at the beginning of the file are not in PDF syntax and are not considered as part of the PDF data. Note that file offsets in the PDF cross-reference table are relative to the start of the PDF data, and not to the beginning of the file itself.

## PDF 2.0 image with BPC.pdf
This PDF demonstrates the how to specify within a graphic state dictionary that black point compensation should be used when rendering or color converting content within a content stream. This feature is new in PDF 2.0.
This file also gives an example of specifying a calibrated RGB color space in a PDF. There are two different calibrated RGB spaces used to interpret the same image data; you should see a marked color shift between the two images on the page.

## PDF 2.0 UTF-8 string and annotation.pdf
This PDF shows how to place UTF-8 Unicode encoded strings into PDF strings. The content entry for the annotation contains Thai language text encoded in UTF-8. The ability to encode text in UTF-8 format is new in PDF 2.0.
Note that many current viewers will appear to have problems with this example:

* The annotation content entry text will typically display erroneously, if the viewer does not support the PDF 2.0 addition for UTF-8 string encoding.

* The annotation itself may not display as a rectangle in all viewers. This is because some viewers expect the quadrilateral used for defining annotation bounds (QuadPoints) in a format different than what is described in the PDF specification. In the PDF, you'll find comments explaining the difference in forms.

## PDF 2.0 with offset start.pdf
This is a very simple PDF 2.0 file. It demonstrates a PDF file that does not start at byte 0 of the file on disk. Please read the commentary at the head of the file in a text editor for additional information.

## PDF 2.0 with page level output intent.pdf
This example shows how to add a page-level output intent to a PDF page, which is a new feature of PDF 2.0. This PDF has a file-level PDF/X output intent, and also has a page-level PDF/X output intent on page 1 that differs from the document-level output intent. The output intents in this PDF are RGB colorspaces for demonstration purposes: one will typically use an output intent for a CMYK condition.


