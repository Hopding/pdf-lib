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

/**
 * Fuzzer for PDF page embedding (embedPdf/embedPage).
 * Targets: page content stream processing, bounding box calculation, transformation matrices.
 */

import PDFDocument from '../src/api/PDFDocument';

export async function fuzz(data: Buffer): Promise<void> {
  // Skip empty or too large inputs (1MB matches page_embed.options max_len)
  if (data.length === 0 || data.length > 1024 * 1024) {
    return;
  }

  try {
    // Try to load the input as a PDF
    const srcDoc = await PDFDocument.load(data, {
      ignoreEncryption: true,
      throwOnInvalidObject: false,
      updateMetadata: false,
    });

    const pageCount = srcDoc.getPageCount();
    if (pageCount === 0) {
      return;
    }

    // Create a new document and try to embed pages
    const destDoc = await PDFDocument.create();

    // Try to embed first page with various bounding boxes
    const srcPage = srcDoc.getPage(0);
    const { width, height } = srcPage.getSize();

    // Embed without clipping
    try {
      await destDoc.embedPage(srcPage);
    } catch (e) { /* embedding may fail */ }

    // Embed with bounding box
    try {
      await destDoc.embedPage(srcPage, {
        left: 0,
        bottom: 0,
        right: Math.min(width, 100),
        top: Math.min(height, 100),
      });
    } catch (e) { /* embedding may fail */ }

    // Embed with transformation matrix
    try {
      await destDoc.embedPage(srcPage, undefined, [1, 0, 0, 1, 10, 10]);
    } catch (e) { /* embedding may fail */ }

    // Try to copy pages
    try {
      const indices = [];
      for (let i = 0; i < Math.min(pageCount, 3); i++) {
        indices.push(i);
      }
      await destDoc.copyPages(srcDoc, indices);
    } catch (e) { /* copying may fail */ }

    // Try to save
    try {
      await destDoc.save({ addDefaultPage: true });
    } catch (e) { /* save may fail */ }

  } catch (e) {
    // Expected for malformed PDF data
  }
}
