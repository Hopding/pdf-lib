/** Convert Node Buffer for APIs typed as Uint8Array under TS5/@types/node. */
export const asUint8Array = (bytes: Buffer): Uint8Array =>
  Uint8Array.from(bytes);
