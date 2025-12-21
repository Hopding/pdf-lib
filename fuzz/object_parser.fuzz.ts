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
 * Fuzzer for PDFObjectParser - parses individual PDF objects.
 * Targets: hex strings, literal strings, arrays, dictionaries, streams, numbers.
 */

import PDFContext from '../src/core/PDFContext';
import ByteStream from '../src/core/parser/ByteStream';

// We need to access PDFObjectParser which isn't directly exported
// So we'll create minimal PDF snippets and use the main parser
import PDFDocument from '../src/api/PDFDocument';

export async function fuzz(data: Buffer): Promise<void> {
  // Skip empty or too large inputs
  if (data.length === 0 || data.length > 256 * 1024) {
    return;
  }

  // Wrap the data in a minimal PDF structure to exercise object parsing
  const pdfHeader = Buffer.from('%PDF-1.4\n');
  const objHeader = Buffer.from('1 0 obj\n');
  const objFooter = Buffer.from('\nendobj\n');
  const trailer = Buffer.from('xref\n0 2\n0000000000 65535 f \n0000000009 00000 n \ntrailer\n<< /Root 1 0 R /Size 2 >>\nstartxref\n');

  // Calculate xref offset
  const xrefOffset = pdfHeader.length + objHeader.length + data.length + objFooter.length;
  const xrefOffsetStr = Buffer.from(xrefOffset.toString() + '\n%%EOF');

  // Build the PDF
  const pdfData = Buffer.concat([
    pdfHeader,
    objHeader,
    data,
    objFooter,
    trailer,
    xrefOffsetStr,
  ]);

  try {
    await PDFDocument.load(pdfData, {
      ignoreEncryption: true,
      throwOnInvalidObject: false,
      updateMetadata: false,
    });
  } catch (e) {
    // Expected for malformed object data
  }
}
