// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import PDFDocument from '../src/api/PDFDocument';

export async function fuzz(data: Buffer): Promise<void> {
  // Skip empty or too large inputs
  if (data.length === 0 || data.length > 1024 * 1024) {
    return;
  }

  try {
    const pdfDoc = await PDFDocument.load(data, {
      ignoreEncryption: true,
      throwOnInvalidObject: false,
      updateMetadata: false,
    });

    // Exercise additional parsing functionality
    pdfDoc.getPageCount();

    const pages = pdfDoc.getPages();
    for (let i = 0; i < Math.min(pages.length, 5); i++) {
      const page = pages[i];
      page.getSize();
      page.getWidth();
      page.getHeight();
      page.getRotation();
    }

    // Try to get document metadata
    try {
      pdfDoc.getTitle();
      pdfDoc.getAuthor();
      pdfDoc.getSubject();
      pdfDoc.getCreator();
      pdfDoc.getProducer();
      pdfDoc.getCreationDate();
      pdfDoc.getModificationDate();
    } catch (e) {
      // Metadata parsing errors are expected for malformed PDFs
    }

    // Try to access form if present
    try {
      const form = pdfDoc.getForm();
      form.getFields();
    } catch (e) {
      // Form access errors are expected for PDFs without forms
    }

  } catch (e) {
    // Expected for malformed PDF data
    // Parsing errors should be caught, not crash the fuzzer
  }
}
