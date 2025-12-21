# pdf-lib Fuzzing

This directory contains fuzz targets for [OSS-Fuzz](https://github.com/google/oss-fuzz) integration.

## Fuzz Targets

| Fuzzer | Target | Description |
|--------|--------|-------------|
| `pdf_parser` | PDF parsing | Main PDF document parsing via `PDFDocument.load()` |
| `pdf_modify` | PDF modification | Loading, modifying, and saving PDFs |
| `pdf_form` | Form parsing | AcroForm field parsing and manipulation |
| `jpeg_embed` | JPEG embedding | JPEG image parsing via `embedJpg()` |
| `png_embed` | PNG embedding | PNG image parsing via `embedPng()` |
| `stream_decode` | Stream decoders | FlateStream, LZWStream, Ascii85, AsciiHex, RunLength |
| `object_parser` | Object parsing | Individual PDF object parsing (dicts, arrays, strings) |
| `pdf_string` | String parsing | PDFString/PDFHexString escape sequences and encoding |
| `xref_stream` | XRef streams | Cross-reference stream parsing |
| `page_embed` | Page embedding | PDF page embedding and copying |

## Running Locally

### Prerequisites

```bash
npm install
npm install --save-dev @jazzer.js/core esbuild
```

### Build a Fuzzer

```bash
npx esbuild fuzz/pdf_parser.fuzz.ts \
  --bundle \
  --platform=node \
  --target=node18 \
  --outfile=fuzz/pdf_parser.fuzz.js \
  --format=cjs
```

### Run a Fuzzer

```bash
# Run with seed corpus
npx jazzer fuzz/pdf_parser.fuzz.js --corpus fuzz/corpus/pdf_parser

# Run for 60 seconds
npx jazzer fuzz/pdf_parser.fuzz.js --max_total_time 60

# Regression test (run corpus without fuzzing)
npx jazzer fuzz/pdf_parser.fuzz.js --mode regression --corpus fuzz/corpus/pdf_parser
```

## Directory Structure

```
fuzz/
├── *.fuzz.ts          # Fuzz target source files
├── *.dict             # Dictionaries (PDF, JPEG, PNG tokens)
├── *.options          # Fuzzer options (timeouts, memory limits)
├── corpus/            # Seed corpora
│   ├── pdf_parser/    # PDF samples
│   ├── pdf_modify/    # PDF samples
│   ├── pdf_form/      # Form PDFs
│   ├── jpeg_embed/    # JPEG images
│   └── png_embed/     # PNG images
└── README.md          # This file
```

## OSS-Fuzz Integration

The OSS-Fuzz configuration is in `/oss-fuzz/`:

- `Dockerfile` - Build environment
- `build.sh` - Build script
- `project.yaml` - Project metadata

## Adding New Fuzzers

1. Create `fuzz/new_fuzzer.fuzz.ts`:

```typescript
export async function fuzz(data: Buffer): Promise<void> {
  if (data.length === 0 || data.length > MAX_SIZE) return;

  try {
    // Your fuzzing logic here
  } catch (e) {
    // Expected for malformed input
  }
}
```

2. Add dictionary if needed: `fuzz/new_fuzzer.dict`
3. Add seed corpus: `fuzz/corpus/new_fuzzer/`
4. Add options file if needed: `fuzz/new_fuzzer.options`
5. Update `oss-fuzz/build.sh` to include the new fuzzer

## Coverage

To generate coverage reports:

```bash
npx jazzer fuzz/pdf_parser.fuzz.js \
  --corpus fuzz/corpus/pdf_parser \
  --coverage \
  --mode regression
```

Reports are generated in `./coverage/`.
