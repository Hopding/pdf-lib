// default resolution
const DEFAULT_RESOLUTION = 72;

const EXIF_MARKER = 0x45786966; // 'Exif'
const JFIF_MARKER = 0x4a464946; // 'JFIF'

const isEXIF = (data: DataView): boolean =>
  data.getUint16(2) === 0xffe1 && data.getUint32(6) === EXIF_MARKER;

const isJFIF = (data: DataView): boolean => data.getUint32(6) === JFIF_MARKER;

const isLittleEndian = (value: number): boolean  => {
  if (value === 0x4949) {
    return true;
  }

  if (value === 0x4d4d) {
    return false;
  }

  throw new Error('TIFF Byte Order');
};

const getRational = (dataView: DataView, pos: number, littleEndian: boolean): number => {
    let start = dataView.getUint32(pos + 8, littleEndian) + 12;
    let numerator = dataView.getUint32(start, littleEndian);
    let denominator = dataView.getUint32(start + 4, littleEndian);
    return numerator / denominator;
};

const normalizeResolution = (x: number | undefined, y: number | undefined, unit: number | undefined): number => {
  if (x !== y) {
    console.warn(
      'Non-square pixels detected. Falling back to default resolution.',
    );
    return DEFAULT_RESOLUTION;
  }

  let resolutionPpi: number | undefined;

  // Unit of XResolution (Tag # 0x011a)/YResolution ( Tag # 0x011b).
  // '1' means no-unit, '2' means inch, '3' means centimeter.
  //
  switch (unit) {
    case 2:
      resolutionPpi = x;
      break;
    case 3:
      resolutionPpi = x! * 2.54;
      break;
  }

  return resolutionPpi || DEFAULT_RESOLUTION;
}

const getJfifResolution = (dataView: DataView): number => {
  let ResolutionUnit = dataView.getUint8(13) + 1;
  let XResolution = dataView.getUint16(14);
  let YResolution = dataView.getUint16(16);

  return normalizeResolution(XResolution, YResolution, ResolutionUnit);
};

const getJpgResolution = (dataView: DataView): number => {
  let XResolution: number | undefined;
  let YResolution: number | undefined;
  let ResolutionUnit: number | undefined;

  const littleEndian = isLittleEndian(dataView.getUint16(12));

  let pos = dataView.getUint32(16, littleEndian) + 12;
  let start = pos + 2;
  let i = 0;

  const count = dataView.getUint16(pos, littleEndian);

  while (i < count) {
    let tag = dataView.getUint16(start, littleEndian);

    switch (tag) {
      case 282:
        XResolution = getRational(dataView, start, littleEndian);
        break;
      case 283:
        YResolution = getRational(dataView, start, littleEndian);
        break;
      case 296:
        ResolutionUnit = dataView.getUint16(start + 8, littleEndian);
        break;
    }

    i += 1;
    start += 12;
  }

  return normalizeResolution(XResolution, YResolution, ResolutionUnit);
}

export const getResolution = (dataView: DataView): number => {
  try {
    if (isEXIF(dataView)) {
      return getJpgResolution(dataView);
    }
    if (isJFIF(dataView)) {
      return getJfifResolution(dataView);
    }
    return DEFAULT_RESOLUTION;
  } catch (_error) {
    return DEFAULT_RESOLUTION;
  }
};
