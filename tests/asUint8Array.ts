/**
 * Satisfy TS5/@types/node where `Buffer` is no longer assignable to `Uint8Array`.
 * Tests only — Buffer and Uint8Array share memory at runtime.
 */
export const asUint8Array = (bytes: Buffer | Uint8Array): Uint8Array => {
  if (!(bytes instanceof Buffer)) return bytes;
  // Same underlying ArrayBuffer; no copy.
  return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
};
