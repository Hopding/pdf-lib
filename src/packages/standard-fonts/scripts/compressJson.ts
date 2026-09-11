import { zlibSync } from 'fflate';

/**
 * Compress JSON to a JSON-stringified base64 zlib payload (Node scripts only).
 * Bytes match `decompressJson` in utils.ts (charCode / latin1 round-trip).
 */
export const compressJson = (json: string): string => {
  const jsonBytes = Buffer.from(json, 'latin1');
  return JSON.stringify(Buffer.from(zlibSync(jsonBytes)).toString('base64'));
};
