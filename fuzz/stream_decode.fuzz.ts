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
 * Fuzzer for PDF stream decoders (FlateStream, LZWStream, Ascii85, AsciiHex, RunLength)
 * These are critical for decompression bomb and parsing vulnerabilities.
 */

import { decodePDFRawStream } from '../src/core/streams/decode';
import PDFRawStream from '../src/core/objects/PDFRawStream';
import PDFDict from '../src/core/objects/PDFDict';
import PDFName from '../src/core/objects/PDFName';
import PDFNumber from '../src/core/objects/PDFNumber';
import PDFContext from '../src/core/PDFContext';

const FILTERS = [
  'FlateDecode',
  'LZWDecode',
  'ASCII85Decode',
  'ASCIIHexDecode',
  'RunLengthDecode',
];

export async function fuzz(data: Buffer): Promise<void> {
  // Skip empty or too large inputs
  if (data.length < 2 || data.length > 512 * 1024) {
    return;
  }

  // Use first byte to select filter type
  const filterIndex = data[0] % FILTERS.length;
  const filterName = FILTERS[filterIndex];
  const streamData = data.slice(1);

  try {
    const context = PDFContext.create();

    // Create a dict with the filter
    const dict = PDFDict.withContext(context);
    dict.set(PDFName.of('Filter'), PDFName.of(filterName));
    dict.set(PDFName.of('Length'), PDFNumber.of(streamData.length));

    // Create raw stream
    const rawStream = PDFRawStream.of(dict, streamData);

    // Try to decode - this exercises the stream decoders
    const decoded = decodePDFRawStream(rawStream);

    // Exercise the decoded stream
    if (decoded) {
      decoded.decode();
    }

  } catch (e) {
    // Expected for malformed compressed data
  }
}
