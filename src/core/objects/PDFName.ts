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
  static readonly BleedBox = PDFName.of('BleedBox');
  static readonly CropBox = PDFName.of('CropBox');
  static readonly Rotate = PDFName.of('Rotate');
  static readonly AcroForm = PDFName.of('AcroForm');
  static readonly Pages = PDFName.of('Pages');
  static readonly Catalog = PDFName.of('Catalog');
  static readonly FT = PDFName.of('FT');
  static readonly Ff = PDFName.of('Ff');
  static readonly Kids = PDFName.of('Kids');
  static readonly Fields = PDFName.of('Fields');
  static readonly Btn = PDFName.of('Btn');
  static readonly Ch = PDFName.of('Ch');
  static readonly Tx = PDFName.of('Tx');
  static readonly Sig = PDFName.of('Sig');
  static readonly Opt = PDFName.of('Opt');
  static readonly TI = PDFName.of('TI');
  static readonly I = PDFName.of('I');
  static readonly V = PDFName.of('V');
  static readonly DV = PDFName.of('DV');
  static readonly Yes = PDFName.of('Yes');
  static readonly Off = PDFName.of('Off');
  static readonly RV = PDFName.of('RV');
  static readonly MaxLen = PDFName.of('MaxLen');
  static readonly AP = PDFName.of('AP');
  static readonly N = PDFName.of('N');
  static readonly P = PDFName.of('P');
  static readonly NM = PDFName.of('NM');
  static readonly M = PDFName.of('M');
  static readonly F = PDFName.of('F');
  static readonly AS = PDFName.of('AS');
  static readonly Border = PDFName.of('Border');
  static readonly C = PDFName.of('C');
  static readonly StructParent = PDFName.of('StructParent');
  static readonly OC = PDFName.of('OC');
  static readonly Subtype = PDFName.of('Subtype');
  static readonly Text = PDFName.of('Text');
  static readonly Link = PDFName.of('Link');
  static readonly FreeText = PDFName.of('FreeText');
  static readonly Line = PDFName.of('Line');
  static readonly Square = PDFName.of('Square');
  static readonly Circle = PDFName.of('Circle');
  static readonly Polygon = PDFName.of('Polygon');
  static readonly PolyLine = PDFName.of('PolyLine');
  static readonly Highlight = PDFName.of('Highlight');
  static readonly Underline = PDFName.of('Underline');
  static readonly Squiggly = PDFName.of('Squiggly');
  static readonly StrikeOut = PDFName.of('StrikeOut');
  static readonly Stamp = PDFName.of('Stamp');
  static readonly Caret = PDFName.of('Caret');
  static readonly Ink = PDFName.of('Ink');
  static readonly Popup = PDFName.of('Popup');
  static readonly FileAttachment = PDFName.of('FileAttachment');
  static readonly Sound = PDFName.of('Sound');
  static readonly Movie = PDFName.of('Movie');
  static readonly Widget = PDFName.of('Widget');
  static readonly Screen = PDFName.of('Screen');
  static readonly PrinterMark = PDFName.of('PrinterMark');
  static readonly TrapNet = PDFName.of('TrapNet');
  static readonly Watermark = PDFName.of('Watermark');
  static readonly ThreeD = PDFName.of('3D');
  static readonly Redact = PDFName.of('Redact');
  static readonly Rect = PDFName.of('Rect');
  static readonly R = PDFName.of('R');
  static readonly D = PDFName.of('D');
  static readonly On = PDFName.of('On');
  static readonly Lock = PDFName.of('Lock');
  static readonly SV = PDFName.of('SV');
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
