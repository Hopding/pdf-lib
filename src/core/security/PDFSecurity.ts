import CryptoJS from 'crypto-js';
import saslprep from 'saslprep';
import PDFDocument from 'src/api/PDFDocument';
import PDFDict from '../objects/PDFDict';

type WordArray = CryptoJS.lib.WordArray;
type generateRandomWordArrayFn = (bytes: number) => WordArray;

interface userPermission {
  printing?: boolean | 'lowResolution' | 'highResolution';
  modifying?: boolean;
  copying?: boolean;
  annotating?: boolean;
  fillingForms?: boolean;
  contentAccessibility?: boolean;
  documentAssembly?: boolean;
}

export type EncryptFn = (buffer: Uint8Array) => Buffer;

export interface SecurityOption {
  ownerPassword?: string;
  userPassword?: string;
  permissions?: userPermission;
  pdfVersion?: string;
}

interface StdCF {
  AuthEvent: 'DocOpen';
  CFM: 'AESV2' | 'AESV3';
  Length: number;
}

interface CF {
  StdCF: StdCF;
}

type EncDictV = 1 | 2 | 4 | 5;
type EncDictR = 2 | 3 | 4 | 5;
type EncKeyBits = 40 | 128 | 256;

interface EncDict {
  R: EncDictR;
  O: Buffer;
  U: Buffer;
  P: number;
  V: EncDictV;
  Filter: 'Standard';
}

interface EncDictV1V2V4 extends EncDict {
  // Only when V > 2
  Length?: number;
  // Only when V === 4
  CF?: CF;
  StmF?: string;
  StrF?: string;
}

interface EncDictV5 extends EncDict {
  OE: Buffer;
  UE: Buffer;
  Perms: Buffer;
  Length?: number;
  CF: CF;
  StmF: 'StdCF';
  StrF: 'StdCF';
}

class PDFSecurity {
  document: PDFDocument;
  version!: EncDictV;
  dictionary!: EncDictV5 | EncDictV1V2V4;
  keyBits!: EncKeyBits;
  encryptionKey!: WordArray;
  id!: Buffer;

  // ID file is an array of two byte-string constituing a file identifier
  // Required if Encrypt entry is present in Trailer
  // Doesn't really matter what it is as long as it is consistently used.
  static generateFileID(info: PDFDict): Buffer {
    console.log(info);
    // for (let key in info) {
    //   // eslint-disable-next-line no-prototype-builtins
    //   if (!info.hasOwnProperty(key)) {
    //     continue;
    //   }
    //   infoStr += `${key}: ${info[key].valueOf()}\n`;
    // }

    // return wordArrayToBuffer(CryptoJS.MD5(infoStr));
    return wordArrayToBuffer(CryptoJS.MD5('something'));
  }

  static generateRandomWordArray(bytes: number): WordArray {
    return CryptoJS.lib.WordArray.random(bytes);
  }

  // Probably have to fix the typing of security Option, To decide after overall flow is determined
  // Ie: to either do it at PDFDocument.encrypt({securityOption}) or PDFDocument.create({securityOption})
  static create(
    document: PDFDocument,
    options: SecurityOption = <SecurityOption>{},
  ) {
    if (!options.ownerPassword && !options.userPassword) {
      return null;
    }
    return new PDFSecurity(document, options);
  }

  constructor(
    document: PDFDocument,
    options: SecurityOption = <SecurityOption>{},
  ) {
    if (!options.ownerPassword && !options.userPassword) {
      throw new Error('None of owner password and user password is defined.');
    }

    this.document = document;
    this._setupEncryption(options);
  }

  // Handle all encryption process and give back EncryptionDictionary that is required
  // to be plugged into Trailer of the PDF
  _setupEncryption(options: SecurityOption) {
    switch (options.pdfVersion) {
      case '1.4':
      case '1.5':
        this.version = 2;
        break;
      case '1.6':
      case '1.7':
        this.version = 4;
        break;
      case '1.7ext3':
        this.version = 5;
        break;
      default:
        this.version = 1;
        break;
    }

    switch (this.version) {
      case 1:
      case 2:
      case 4:
        this.dictionary = this._setupEncryptionV1V2V4(this.version, options);
        break;
      case 5:
        this.dictionary = this._setupEncryptionV5(options);
        break;
    }
  }

  _setupEncryptionV1V2V4(v: EncDictV, options: SecurityOption): EncDictV1V2V4 {
    const encDict = <EncDictV1V2V4>{
      Filter: 'Standard',
    };

    let r: EncDictR, permissions: number;
    switch (v) {
      case 1:
        r = 2;
        this.keyBits = 40;
        permissions = getPermissionsR2(options.permissions);
        break;
      case 2:
        r = 3;
        this.keyBits = 128;
        permissions = getPermissionsR3(options.permissions);
        break;
      case 4:
        r = 4;
        this.keyBits = 128;
        permissions = getPermissionsR3(options.permissions);
        break;
      default:
        throw new Error('Unknown v value');
    }

    const paddedUserPassword: WordArray = processPasswordR2R3R4(
      options.userPassword,
    );
    const paddedOwnerPassword: WordArray = options.ownerPassword
      ? processPasswordR2R3R4(options.ownerPassword)
      : paddedUserPassword;

    const ownerPasswordEntry: WordArray = getOwnerPasswordR2R3R4(
      r,
      this.keyBits,
      paddedUserPassword,
      paddedOwnerPassword,
    );
    this.encryptionKey = getEncryptionKeyR2R3R4(
      r,
      this.keyBits,
      this.document._id,
      paddedUserPassword,
      ownerPasswordEntry,
      permissions,
    );
    let userPasswordEntry;
    if (r === 2) {
      userPasswordEntry = getUserPasswordR2(this.encryptionKey);
    } else {
      userPasswordEntry = getUserPasswordR3R4(
        this.document._id,
        this.encryptionKey,
      );
    }

    encDict.V = v;
    if (v >= 2) {
      encDict.Length = this.keyBits;
    }
    if (v === 4) {
      encDict.CF = {
        StdCF: {
          AuthEvent: 'DocOpen',
          CFM: 'AESV2',
          Length: this.keyBits / 8,
        },
      };
      encDict.StmF = 'StdCF';
      encDict.StrF = 'StdCF';
    }
    encDict.R = r;
    encDict.O = wordArrayToBuffer(ownerPasswordEntry);
    encDict.U = wordArrayToBuffer(userPasswordEntry);
    encDict.P = permissions;
    return encDict;
  }

  _setupEncryptionV5(options: SecurityOption): EncDictV5 {
    const encDict = <EncDictV5>{
      Filter: 'Standard',
    };

    this.keyBits = 256;
    const permissions = getPermissionsR3(options.permissions);

    const processedUserPassword = processPasswordR5(options.userPassword);
    const processedOwnerPassword = options.ownerPassword
      ? processPasswordR5(options.ownerPassword)
      : processedUserPassword;

    this.encryptionKey = getEncryptionKeyR5(
      PDFSecurity.generateRandomWordArray,
    );
    const userPasswordEntry = getUserPasswordR5(
      processedUserPassword,
      PDFSecurity.generateRandomWordArray,
    );
    const userKeySalt = CryptoJS.lib.WordArray.create(
      userPasswordEntry.words.slice(10, 12),
      8,
    );
    const userEncryptionKeyEntry = getUserEncryptionKeyR5(
      processedUserPassword,
      userKeySalt,
      this.encryptionKey,
    );
    const ownerPasswordEntry = getOwnerPasswordR5(
      processedOwnerPassword,
      userPasswordEntry,
      PDFSecurity.generateRandomWordArray,
    );
    const ownerKeySalt = CryptoJS.lib.WordArray.create(
      ownerPasswordEntry.words.slice(10, 12),
      8,
    );
    const ownerEncryptionKeyEntry = getOwnerEncryptionKeyR5(
      processedOwnerPassword,
      ownerKeySalt,
      userPasswordEntry,
      this.encryptionKey,
    );
    const permsEntry = getEncryptedPermissionsR5(
      permissions,
      this.encryptionKey,
      PDFSecurity.generateRandomWordArray,
    );

    encDict.V = 5;
    encDict.Length = this.keyBits;
    encDict.CF = {
      StdCF: {
        AuthEvent: 'DocOpen',
        CFM: 'AESV3',
        Length: this.keyBits / 8,
      },
    };
    encDict.StmF = 'StdCF';
    encDict.StrF = 'StdCF';
    encDict.R = 5;
    encDict.O = wordArrayToBuffer(ownerPasswordEntry);
    encDict.OE = wordArrayToBuffer(ownerEncryptionKeyEntry);
    encDict.U = wordArrayToBuffer(userPasswordEntry);
    encDict.UE = wordArrayToBuffer(userEncryptionKeyEntry);
    encDict.P = permissions;
    encDict.Perms = wordArrayToBuffer(permsEntry);
    return encDict;
  }

  getEncryptFn(obj: number, gen: number) {
    let digest: WordArray;
    let key: WordArray;
    if (this.version < 5) {
      digest = this.encryptionKey
        .clone()
        .concat(
          CryptoJS.lib.WordArray.create(
            [
              ((obj & 0xff) << 24) |
                ((obj & 0xff00) << 8) |
                ((obj >> 8) & 0xff00) |
                (gen & 0xff),
              (gen & 0xff00) << 16,
            ],
            5,
          ),
        );

      if (this.version === 1 || this.version === 2) {
        let key = CryptoJS.MD5(digest);
        key.sigBytes = Math.min(16, this.keyBits / 8 + 5);
        return (buffer: Uint8Array) =>
          wordArrayToBuffer(
            CryptoJS.RC4.encrypt(
              CryptoJS.lib.WordArray.create((buffer as unknown) as number[]),
              key,
            ).ciphertext,
          );
      }

      if (this.version === 4) {
        key = CryptoJS.MD5(
          digest.concat(CryptoJS.lib.WordArray.create([0x73416c54], 4)),
        );
      }
    } else if (this.version === 5) {
      key = this.encryptionKey;
    } else {
      throw new Error('Unknown V value');
    }

    const iv = PDFSecurity.generateRandomWordArray(16);
    const options = {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      iv,
    };

    return (buffer: Uint8Array) =>
      wordArrayToBuffer(
        iv
          .clone()
          .concat(
            CryptoJS.AES.encrypt(
              CryptoJS.lib.WordArray.create((buffer as unknown) as number[]),
              key,
              options,
            ).ciphertext,
          ),
      );
  }
}

function getPermissionsR2(permissionObject: userPermission = {}) {
  let permissions = 0xffffffc0 >> 0;
  if (permissionObject.printing) {
    permissions |= 0b000000000100;
  }
  if (permissionObject.modifying) {
    permissions |= 0b000000001000;
  }
  if (permissionObject.copying) {
    permissions |= 0b000000010000;
  }
  if (permissionObject.annotating) {
    permissions |= 0b000000100000;
  }
  return permissions;
}

function getPermissionsR3(permissionObject: userPermission = {}) {
  let permissions = 0xfffff0c0 >> 0;
  if (permissionObject.printing === 'lowResolution') {
    permissions |= 0b000000000100;
  }
  if (permissionObject.printing === 'highResolution') {
    permissions |= 0b100000000100;
  }
  if (permissionObject.modifying) {
    permissions |= 0b000000001000;
  }
  if (permissionObject.copying) {
    permissions |= 0b000000010000;
  }
  if (permissionObject.annotating) {
    permissions |= 0b000000100000;
  }
  if (permissionObject.fillingForms) {
    permissions |= 0b000100000000;
  }
  if (permissionObject.contentAccessibility) {
    permissions |= 0b001000000000;
  }
  if (permissionObject.documentAssembly) {
    permissions |= 0b010000000000;
  }
  return permissions;
}

function getUserPasswordR2(encryptionKey: CryptoJS.lib.WordArray) {
  return CryptoJS.RC4.encrypt(processPasswordR2R3R4(), encryptionKey)
    .ciphertext;
}

function getUserPasswordR3R4(documentId: Buffer, encryptionKey: WordArray) {
  const key = encryptionKey.clone();
  let cipher = CryptoJS.MD5(
    processPasswordR2R3R4().concat(
      CryptoJS.lib.WordArray.create((documentId as unknown) as number[]),
    ),
  );
  for (let i = 0; i < 20; i++) {
    const xorRound = Math.ceil(key.sigBytes / 4);
    for (let j = 0; j < xorRound; j++) {
      key.words[j] =
        encryptionKey.words[j] ^ (i | (i << 8) | (i << 16) | (i << 24));
    }
    cipher = CryptoJS.RC4.encrypt(cipher, key).ciphertext;
  }
  return cipher.concat(
    CryptoJS.lib.WordArray.create((null as unknown) as undefined, 16),
  );
}

function getOwnerPasswordR2R3R4(
  r: EncDictR,
  keyBits: EncKeyBits,
  paddedUserPassword: WordArray,
  paddedOwnerPassword: WordArray,
): CryptoJS.lib.WordArray {
  let digest = paddedOwnerPassword;
  let round = r >= 3 ? 51 : 1;
  for (let i = 0; i < round; i++) {
    digest = CryptoJS.MD5(digest);
  }

  const key = digest.clone();
  key.sigBytes = keyBits / 8;
  let cipher = paddedUserPassword;
  round = r >= 3 ? 20 : 1;
  for (let i = 0; i < round; i++) {
    const xorRound = Math.ceil(key.sigBytes / 4);
    for (let j = 0; j < xorRound; j++) {
      key.words[j] = digest.words[j] ^ (i | (i << 8) | (i << 16) | (i << 24));
    }
    cipher = CryptoJS.RC4.encrypt(cipher, key).ciphertext;
  }
  return cipher;
}

function getEncryptionKeyR2R3R4(
  r: EncDictR,
  keyBits: EncKeyBits,
  documentId: Buffer,
  paddedUserPassword: WordArray,
  ownerPasswordEntry: WordArray,
  permissions: number,
): WordArray {
  let key = paddedUserPassword
    .clone()
    .concat(ownerPasswordEntry)
    .concat(CryptoJS.lib.WordArray.create([lsbFirstWord(permissions)], 4))
    .concat(CryptoJS.lib.WordArray.create((documentId as unknown) as number[]));
  const round = r >= 3 ? 51 : 1;
  for (let i = 0; i < round; i++) {
    key = CryptoJS.MD5(key);
    key.sigBytes = keyBits / 8;
  }
  return key;
}

function getUserPasswordR5(
  processedUserPassword: WordArray,
  generateRandomWordArray: generateRandomWordArrayFn,
) {
  const validationSalt = generateRandomWordArray(8);
  const keySalt = generateRandomWordArray(8);
  return CryptoJS.SHA256(processedUserPassword.clone().concat(validationSalt))
    .concat(validationSalt)
    .concat(keySalt);
}

function getUserEncryptionKeyR5(
  processedUserPassword: WordArray,
  userKeySalt: WordArray,
  encryptionKey: WordArray,
) {
  const key = CryptoJS.SHA256(
    processedUserPassword.clone().concat(userKeySalt),
  );
  const options = {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.NoPadding,
    iv: CryptoJS.lib.WordArray.create((null as unknown) as undefined, 16),
  };
  return CryptoJS.AES.encrypt(encryptionKey, key, options).ciphertext;
}

function getOwnerPasswordR5(
  processedOwnerPassword: WordArray,
  userPasswordEntry: WordArray,
  generateRandomWordArray: generateRandomWordArrayFn,
) {
  const validationSalt = generateRandomWordArray(8);
  const keySalt = generateRandomWordArray(8);
  return CryptoJS.SHA256(
    processedOwnerPassword
      .clone()
      .concat(validationSalt)
      .concat(userPasswordEntry),
  )
    .concat(validationSalt)
    .concat(keySalt);
}

function getOwnerEncryptionKeyR5(
  processedOwnerPassword: WordArray,
  ownerKeySalt: WordArray,
  userPasswordEntry: WordArray,
  encryptionKey: WordArray,
) {
  const key = CryptoJS.SHA256(
    processedOwnerPassword
      .clone()
      .concat(ownerKeySalt)
      .concat(userPasswordEntry),
  );
  const options = {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.NoPadding,
    iv: CryptoJS.lib.WordArray.create((null as unknown) as undefined, 16),
  };
  return CryptoJS.AES.encrypt(encryptionKey, key, options).ciphertext;
}

function getEncryptionKeyR5(
  generateRandomWordArray: generateRandomWordArrayFn,
) {
  return generateRandomWordArray(32);
}

function getEncryptedPermissionsR5(
  permissions: number,
  encryptionKey: WordArray,
  generateRandomWordArray: generateRandomWordArrayFn,
) {
  const cipher = CryptoJS.lib.WordArray.create(
    [lsbFirstWord(permissions), 0xffffffff, 0x54616462],
    12,
  ).concat(generateRandomWordArray(4));
  const options = {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
  };
  return CryptoJS.AES.encrypt(cipher, encryptionKey, options).ciphertext;
}

function processPasswordR2R3R4(password = '') {
  const out = Buffer.alloc(32);
  const length = password.length;
  let index = 0;
  while (index < length && index < 32) {
    const code = password.charCodeAt(index);
    if (code > 0xff) {
      throw new Error('Password contains one or more invalid characters.');
    }
    out[index] = code;
    index++;
  }
  while (index < 32) {
    out[index] = PASSWORD_PADDING[index - length];
    index++;
  }
  return CryptoJS.lib.WordArray.create((out as unknown) as number[]);
}

function processPasswordR5(password = '') {
  password = unescape(encodeURIComponent(saslprep(password)));
  const length = Math.min(127, password.length);
  const out = Buffer.alloc(length);

  for (let i = 0; i < length; i++) {
    out[i] = password.charCodeAt(i);
  }

  return CryptoJS.lib.WordArray.create((out as unknown) as number[]);
}

function lsbFirstWord(data: number): number {
  return (
    ((data & 0xff) << 24) |
    ((data & 0xff00) << 8) |
    ((data >> 8) & 0xff00) |
    ((data >> 24) & 0xff)
  );
}

function wordArrayToBuffer(wordArray: WordArray): Buffer {
  const byteArray = [];
  for (let i = 0; i < wordArray.sigBytes; i++) {
    byteArray.push(
      (wordArray.words[Math.floor(i / 4)] >> (8 * (3 - (i % 4)))) & 0xff,
    );
  }
  return Buffer.from(byteArray);
}

const PASSWORD_PADDING = [
  0x28,
  0xbf,
  0x4e,
  0x5e,
  0x4e,
  0x75,
  0x8a,
  0x41,
  0x64,
  0x00,
  0x4e,
  0x56,
  0xff,
  0xfa,
  0x01,
  0x08,
  0x2e,
  0x2e,
  0x00,
  0xb6,
  0xd0,
  0x68,
  0x3e,
  0x80,
  0x2f,
  0x0c,
  0xa9,
  0xfe,
  0x64,
  0x53,
  0x69,
  0x7a,
];

export default PDFSecurity;
