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
 * Fuzzer for PDFObjectParser - parses individual PDF objects directly.
 * Targets: hex strings, literal strings, arrays, dictionaries, streams, numbers, names.
 *
 * This fuzzer directly targets the low-level parser for maximum efficiency,
 * avoiding the overhead of building and parsing full PDF documents.
 */

import PDFObjectParser from '../src/core/parser/PDFObjectParser';
import PDFContext from '../src/core/PDFContext';

export async function fuzz(data: Buffer): Promise<void> {
  // Skip empty or too large inputs
  // Using 256KB limit matching options file
  if (data.length === 0 || data.length > 256 * 1024) {
    return;
  }

  try {
    const context = PDFContext.create();

    // Parse directly using PDFObjectParser - no PDF wrapper needed
    const parser = PDFObjectParser.forBytes(
      new Uint8Array(data),
      context,
      false // capNumbers
    );

    // Try to parse an object from the fuzz data
    parser.parseObject();

  } catch (e) {
    // Expected for malformed object data
  }
}
