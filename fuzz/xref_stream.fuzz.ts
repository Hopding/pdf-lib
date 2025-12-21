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
 * Fuzzer for XRef stream parsing (modern PDF cross-reference format).
 * Targets: field width parsing, binary xref entries, subsection handling.
 */

import PDFDocument from '../src/api/PDFDocument';

export async function fuzz(data: Buffer): Promise<void> {
  // Skip empty or too large inputs
  if (data.length < 10 || data.length > 256 * 1024) {
    return;
  }

  // Build a PDF with XRef stream instead of traditional xref table
  // Use fuzzer data to construct the xref stream content

  // Minimal PDF 1.5+ with XRef stream
  const pdfPrefix = `%PDF-1.5
%\x80\x80\x80\x80
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [] /Count 0 >>
endobj
3 0 obj
<< /Type /XRef /Size 4 /W [1 2 1] /Root 1 0 R /Length ${data.length} >>
stream
`;

  const pdfSuffix = `
endstream
endobj
startxref
`;

  // Calculate offset of xref stream object
  const prefixLen = pdfPrefix.length;
  const xrefOffset = Buffer.from(pdfPrefix).length - 1;

  // Build PDF with fuzzed xref stream data
  const pdfData = Buffer.concat([
    Buffer.from(pdfPrefix),
    data,
    Buffer.from(pdfSuffix),
    Buffer.from(xrefOffset.toString()),
    Buffer.from('\n%%EOF'),
  ]);

  try {
    await PDFDocument.load(pdfData, {
      ignoreEncryption: true,
      throwOnInvalidObject: false,
      updateMetadata: false,
    });
  } catch (e) {
    // Expected for malformed xref data
  }
}
