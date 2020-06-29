import { ExifParserFactory } from 'ts-exif-parser';

// default resolution
const DEFAULT_RESOLUTION = 72;
const EXIF_MARKER = 0x45786966; // 'Exif'
const JFIF_MARKER = 0x4a464946; // 'JFIF'

function isEXIF(data: DataView): boolean {
    return (data.getUint16(2) === 0xffe1 && data.getUint32(6) === EXIF_MARKER)
}

function isJFIF(data: DataView): boolean {
    return (data.getUint32(6) === JFIF_MARKER)
}

const getJfifResolution = (dataView: DataView): number => {
    let resolution = DEFAULT_RESOLUTION;

    const resunits = dataView.getUint8(13);
    const xDensity = dataView.getUint16(14);
    const yDensity = dataView.getUint16(16);
    if (xDensity !== yDensity) console.warn(`Non-square pixels in JPG`);

    if (resunits === 1) {    // density is per inch
        resolution = xDensity;
    } else if (resunits == 2) { // density is per cm
        resolution = Math.round(xDensity * 2.54);
    }
    return resolution;
}

export const getJpgResolution = (dataView: DataView): number => {

    if (isEXIF(dataView)) {
        // parse exif data
        // console.time("Exif parse");
        let parser = ExifParserFactory.create(dataView.buffer);
        let exif = parser.parse();

        const { XResolution, YResolution, ResolutionUnit } = exif.tags!;

        // patch for wrong type definition in ts-exif-parser
        // ResolutionUnit is declared as string, when in fact it is a number
        // submitted PR to fix this
        const correctedResUnit: number = (ResolutionUnit as unknown) as number;
        // end patch

        // console.timeEnd("Exif parse");

        if (XResolution !== YResolution) {
            console.warn(
                "Non-square pixels detected. Falling back to default resolution."
            );
            return DEFAULT_RESOLUTION;
        }
        let resolutionPpi: number | undefined = DEFAULT_RESOLUTION;

        // Unit of XResolution (Tag # 0x011a)/YResolution ( Tag # 0x011b).
        // '1' means no-unit, '2' means inch, '3' means centimeter.
        //

        switch (correctedResUnit) {
            case 2:
                resolutionPpi = XResolution;
                break;
            case 3:
                resolutionPpi = XResolution! * 2.54;
                break;
            default:
                resolutionPpi = DEFAULT_RESOLUTION;
        }
        return resolutionPpi || DEFAULT_RESOLUTION;
    }
    if (isJFIF(dataView)) {
        return getJfifResolution(dataView);
    }
    return DEFAULT_RESOLUTION;
}
