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
import { StandardFonts } from '../src/api/StandardFonts';
import { rgb } from '../src/api/colors';

export async function fuzz(data: Buffer): Promise<void> {
  // Skip empty or too large inputs
  if (data.length === 0 || data.length > 1024 * 1024) {
    return;
  }

  try {
    // Load the PDF
    const pdfDoc = await PDFDocument.load(data, {
      ignoreEncryption: true,
      throwOnInvalidObject: false,
      updateMetadata: false,
    });

    const pages = pdfDoc.getPages();
    if (pages.length === 0) {
      return;
    }

    // Try to modify the first page
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    // Embed a standard font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Draw text on the page
    firstPage.drawText('Fuzz Test', {
      x: Math.min(50, width / 2),
      y: Math.min(50, height / 2),
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });

    // Draw a rectangle
    firstPage.drawRectangle({
      x: 0,
      y: 0,
      width: Math.min(100, width),
      height: Math.min(100, height),
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Try to save (exercises the writer)
    const savedBytes = await pdfDoc.save({
      useObjectStreams: false,
      addDefaultPage: false,
      updateFieldAppearances: false,
    });

    // Round-trip validation: ensure the saved PDF can be loaded back
    await PDFDocument.load(savedBytes, {
      ignoreEncryption: true,
      throwOnInvalidObject: false,
      updateMetadata: false,
    });

  } catch (e) {
    // Expected for malformed PDF data
  }
}
