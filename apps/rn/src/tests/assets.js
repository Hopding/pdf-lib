import RNFetchBlob from 'rn-fetch-blob';
import { encodeToBase64, decodeFromBase64 } from 'pdf-lib';

const PDF_PATH = `${RNFetchBlob.fs.dirs.DocumentDir}/out.pdf`;

export const writePdf = async (pdfBytes, chunkSize = 100000) =>
  new Promise((resolve) => {
    const writes = [];
    RNFetchBlob.fs.writeStream(PDF_PATH, 'base64').then((stream) => {
      // Iterate through pdfBytes encoding chunks into base64 and writing them out
      for (let i = 0; i < pdfBytes.length; i += chunkSize) {
        const chunk = pdfBytes.subarray(i, i + chunkSize);
        writes.push(stream.write(encodeToBase64(chunk)));
      }
      stream.close();
      Promise.all(writes).then(() => resolve(PDF_PATH));
    });
  });

export const fetchAsset = async (path) => {
  const res = await RNFetchBlob.config({ fileCache: false }).fetch(
    'GET',
    `http://localhost:8080/assets/${encodeURI(path)}`,
    { 'Cache-Control': 'no-store' },
  );
  return res.base64();
};

// NOTE: This is rarely faster than using `fetchAsset`. It's kept here
//       primarily for demonstration purposes.
export const fetchLargeAsset = async (path) => {
  const res = await RNFetchBlob.config({ fileCache: true }).fetch(
    'GET',
    `http://localhost:8080/assets/${path}`,
    { 'Cache-Control': 'no-store' },
  );

  const { headers } = res.respInfo;
  const contentLength = headers['Content-Length'] || headers['content-length'];
  if (contentLength === undefined) throw new Error('WUHHH');
  const buffer = new Uint8Array(contentLength);
  let offset = 0;

  const stream = await res.readStream('base64');

  stream.open();

  stream.onData((chunkStr) => {
    const chunk = decodeFromBase64(chunkStr);
    buffer.set(chunk, offset);
    offset += chunk.length;
  });

  return new Promise((resolve, reject) => {
    stream.onEnd(() => resolve(buffer));
    stream.onError((err) => reject(err));
  });
};

export const timeFn = async (name, fn) => {
  const start = Date.now();
  await fn();
  const end = Date.now();
  const secs = (end - start) / 1000;
  console.warn(`${name} took ${secs} secs`);
};
