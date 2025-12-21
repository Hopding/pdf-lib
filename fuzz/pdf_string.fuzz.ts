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
 * Fuzzer for PDFString and PDFHexString parsing.
 * Targets: escape sequences (\n, \r, \t, octal), UTF-16 BOM, date parsing.
 */

import PDFString from '../src/core/objects/PDFString';
import PDFHexString from '../src/core/objects/PDFHexString';

export async function fuzz(data: Buffer): Promise<void> {
  // Skip empty or too large inputs
  if (data.length === 0 || data.length > 64 * 1024) {
    return;
  }

  // Use first byte to determine test type
  const testType = data[0] % 4;
  const testData = data.slice(1);

  try {
    switch (testType) {
      case 0:
        // Test PDFString.of (literal string)
        {
          const str = PDFString.of(testData.toString('binary'));
          str.decodeText();
          str.decodeDate();
          str.asString();
          str.sizeInBytes();
        }
        break;

      case 1:
        // Test PDFHexString.of with raw fuzz data as potential hex characters
        // This tests parsing of arbitrary characters (valid/invalid hex)
        {
          const hexStr = PDFHexString.of(testData.toString('latin1'));
          hexStr.decodeText();
          hexStr.decodeDate();
          hexStr.asString();
          hexStr.sizeInBytes();
        }
        break;

      case 2:
        // Test PDFHexString.fromText with arbitrary text
        {
          const hexStr = PDFHexString.fromText(testData.toString('utf8'));
          hexStr.decodeText();
          hexStr.asString();
        }
        break;

      case 3:
        // Test PDFString with potential escape sequences
        {
          // Build a string with escape sequences
          const escaped = testData.toString('binary')
            .replace(/\\/g, '\\\\')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)');
          const str = PDFString.of(escaped);
          str.decodeText();
          str.asString();
        }
        break;
    }
  } catch (e) {
    // Expected for malformed strings
  }
}
