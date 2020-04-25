import { PrivateConstructorError } from 'src/core/errors';
import PDFObject from 'src/core/objects/PDFObject';
import CharCodes from 'src/core/syntax/CharCodes';
import { IsIrregular } from 'src/core/syntax/Irregular';
import {
  charFromHexCode,
  copyStringIntoBuffer,
  toCharCode,
  toHexString,
} from 'src/utils';

const decodeName = (name: string) =>
  name.replace(/#([\dABCDEF]{2})/g, (_, hex) => charFromHexCode(hex));

const isRegularChar = (charCode: number) =>
  charCode >= CharCodes.ExclamationPoint &&
  charCode <= CharCodes.Tilde &&
  !IsIrregular[charCode];

const ENFORCER = {};
const pool = new Map<string, PDFName>();

class PDFName extends PDFObject {
  static of = (name: string): PDFName => {
    const decodedValue = decodeName(name);

    let instance = pool.get(decodedValue);
    if (!instance) {
      instance = new PDFName(ENFORCER, decodedValue);
      pool.set(decodedValue, instance);
    }

    return instance;
  };

  /* tslint:disable member-ordering */
  static readonly Length = PDFName.of('Length');
  static readonly FlateDecode = PDFName.of('FlateDecode');
  static readonly Resources = PDFName.of('Resources');
  static readonly Font = PDFName.of('Font');
  static readonly XObject = PDFName.of('XObject');
  static readonly Contents = PDFName.of('Contents');
  static readonly Type = PDFName.of('Type');
  static readonly Parent = PDFName.of('Parent');
  static readonly MediaBox = PDFName.of('MediaBox');
  static readonly Page = PDFName.of('Page');
  static readonly Annots = PDFName.of('Annots');
  static readonly TrimBox = PDFName.of('TrimBox');
  static readonly ArtBox = PDFName.of('ArtBox');
  static readonly BleedBox = PDFName.of('BleedBox');
  static readonly CropBox = PDFName.of('CropBox');
  static readonly Rotate = PDFName.of('Rotate');
  static readonly Title = PDFName.of('Title');
  static readonly Author = PDFName.of('Author');
  static readonly Subject = PDFName.of('Subject');
  static readonly Creator = PDFName.of('Creator');
  static readonly Keywords = PDFName.of('Keywords');
  static readonly Producer = PDFName.of('Producer');
  static readonly CreationDate = PDFName.of('CreationDate');
  static readonly ModDate = PDFName.of('ModDate');
  /* tslint:enable member-ordering */

  private readonly encodedName: string;

  private constructor(enforcer: any, name: string) {
    if (enforcer !== ENFORCER) throw new PrivateConstructorError('PDFName');
    super();

    let encodedName = '/';
    for (let idx = 0, len = name.length; idx < len; idx++) {
      const character = name[idx];
      const code = toCharCode(character);
      encodedName += isRegularChar(code) ? character : `#${toHexString(code)}`;
    }

    this.encodedName = encodedName;
  }

  asString(): string {
    return this.encodedName;
  }

  /** @deprecated in favor of [[PDFName.asString]] */
  value(): string {
    return this.encodedName;
  }

  clone(): PDFName {
    return this;
  }

  toString(): string {
    return this.encodedName;
  }

  sizeInBytes(): number {
    return this.encodedName.length;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): number {
    offset += copyStringIntoBuffer(this.encodedName, buffer, offset);
    return this.encodedName.length;
  }
}

export default PDFName;
