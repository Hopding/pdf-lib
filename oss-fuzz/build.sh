#!/bin/bash -eu
# Copyright 2024 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
################################################################################

# Install dependencies
npm install

# Install fuzzing dependencies (not in devDependencies to avoid TS version conflicts)
npm install --no-save @jazzer.js/core esbuild

# Build each fuzzer using esbuild (bundles TypeScript and resolves path aliases)
FUZZERS="pdf_parser pdf_modify pdf_form jpeg_embed png_embed stream_decode object_parser pdf_string xref_stream page_embed"

for fuzzer in $FUZZERS; do
  echo "Building ${fuzzer} fuzzer..."
  npx esbuild fuzz/${fuzzer}.fuzz.ts \
    --bundle \
    --platform=node \
    --target=node18 \
    --outfile=fuzz/${fuzzer}.fuzz.js \
    --format=cjs \
    --external:@jazzer.js/core
done

# Compile fuzzers for OSS-Fuzz
for fuzzer in $FUZZERS; do
  compile_javascript_fuzzer pdf-lib fuzz/${fuzzer}.fuzz --sync
done

# Copy dictionaries
cp fuzz/pdf.dict $OUT/pdf_parser.dict
cp fuzz/pdf.dict $OUT/pdf_modify.dict
cp fuzz/pdf.dict $OUT/pdf_form.dict
cp fuzz/pdf.dict $OUT/object_parser.dict
cp fuzz/pdf.dict $OUT/xref_stream.dict
cp fuzz/pdf.dict $OUT/page_embed.dict
cp fuzz/pdf.dict $OUT/stream_decode.dict
cp fuzz/pdf.dict $OUT/pdf_string.dict
cp fuzz/jpeg.dict $OUT/jpeg_embed.dict
cp fuzz/png.dict $OUT/png_embed.dict

# Copy options files
cp fuzz/*.options $OUT/ 2>/dev/null || true

# Create seed corpus zips
zip -j $OUT/pdf_parser_seed_corpus.zip fuzz/corpus/pdf_parser/* 2>/dev/null || true
zip -j $OUT/pdf_modify_seed_corpus.zip fuzz/corpus/pdf_modify/* 2>/dev/null || true
zip -j $OUT/pdf_form_seed_corpus.zip fuzz/corpus/pdf_form/* 2>/dev/null || true
zip -j $OUT/jpeg_embed_seed_corpus.zip fuzz/corpus/jpeg_embed/* 2>/dev/null || true
zip -j $OUT/png_embed_seed_corpus.zip fuzz/corpus/png_embed/* 2>/dev/null || true
zip -j $OUT/object_parser_seed_corpus.zip fuzz/corpus/pdf_parser/* 2>/dev/null || true
zip -j $OUT/xref_stream_seed_corpus.zip fuzz/corpus/pdf_parser/* 2>/dev/null || true
zip -j $OUT/page_embed_seed_corpus.zip fuzz/corpus/pdf_parser/* 2>/dev/null || true
zip -j $OUT/stream_decode_seed_corpus.zip fuzz/corpus/stream_decode/* fuzz/corpus/pdf_parser/* 2>/dev/null || true
zip -j $OUT/pdf_string_seed_corpus.zip fuzz/corpus/pdf_parser/* 2>/dev/null || true

echo "Build complete!"
