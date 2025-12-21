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
  if (data.length === 0 || data.length > 512 * 1024) {
    return;
  }

  try {
    const pdfDoc = await PDFDocument.create();
    const pngImage = await pdfDoc.embedPng(data);

    // Exercise the embedded image
    pngImage.width;
    pngImage.height;
    pngImage.scale(0.5);
    pngImage.scaleToFit(100, 100);

    // Draw the image on a page
    const page = pdfDoc.addPage();
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: Math.min(pngImage.width, 100),
      height: Math.min(pngImage.height, 100),
    });

  } catch (e) {
    // Expected for malformed PNG data
  }
}
