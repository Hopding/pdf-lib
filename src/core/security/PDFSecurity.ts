import CryptoJS from 'crypto-js';
import saslprep from 'saslprep';
import PDFDocument from 'src/api/PDFDocument';
import PDFDict from '../objects/PDFDict';
import { LiteralObject } from '../PDFContext';

type WordArray = CryptoJS.lib.WordArray;
type generateRandomWordArrayFn = (bytes: number) => WordArray;

/**
 * Interface representing type of user permission
 * @interface UserPermission
 */
interface UserPermission {
  /**
   * Printing Permission
   * For Security handlers of revision <= 2 : Boolean
   * For Security handlers of revision >= 3 : 'lowResolution' or 'highResolution'
   */
  printing?: boolean | 'lowResolution' | 'highResolution';
  /**
   * Modify Content Permission (Other than 'annotating', 'fillingForms' and 'documentAssembly')
   */
  modifying?: boolean;
  /** Copy or otherwise extract text and graphics from document */
  copying?: boolean;
  /** Permission to add or modify text annotations */
  annotating?: boolean;
  /**
   * Security handlers of revision >= 3
   * Fill in existing interactive form fields (including signature fields)
   */
  fillingForms?: boolean;
  /**
   * Security handlers of revision >= 3
   * Extract text and graphics (in support of accessibility to users with disabilities or for other purposes)
   */
  contentAccessibility?: boolean;
  /**
   * Security handlers of revision >= 3
   * Assemble the document (insert, rotate or delete pages and create bookmarks or thumbnail images)
   */
  documentAssembly?: boolean;
}

export type EncryptFn = (buffer: Uint8Array) => Uint8Array;

/**
 * Interface option for security
 * @interface SecurityOption
 */
export interface SecurityOption {
  /**
   * Password that provide unlimited access to the encrypted document.
   *
   * Opening encrypted document with owner password allow full (owner) access to the document
   */
  ownerPassword?: string;

  /** Password that restrict reader according to defined permissions
   *
   * Opening encrypted document with user password will have limitations in accordance to the permission defined.
   */
  userPassword: string;

  /** Object representing type of user permission enforced on the document
   * @link {@link UserPermission}
   */
  permissions?: UserPermission;

  /** Version of PDF, string of '1.x' */
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

interface EncDict extends LiteralObject {
  R: EncDictR;
  O: Uint8Array;
  U: Uint8Array;
  P: number;
  V: EncDictV;
  Filter: 'Standard';
}

export interface EncDictV1V2V4 extends EncDict {
  // Only when V > 2
  Length?: number;
  // Only when V === 4
  CF?: CF;
  StmF?: string;
  StrF?: string;
}

export interface EncDictV5 extends EncDict {
  OE: Uint8Array;
  UE: Uint8Array;
  Perms: Uint8Array;
  Length?: number;
  CF: CF;
  StmF: 'StdCF';
  StrF: 'StdCF';
}

/* 
Represent the entire security class for the PDF Document
Output from `_setupEncryption` is the Encryption Dictionary
in compliance to the PDF Specification 
*/
class PDFSecurity {
  document: PDFDocument;
  version!: EncDictV;
  dictionary!: EncDictV5 | EncDictV1V2V4;
  keyBits!: EncKeyBits;
  encryptionKey!: WordArray;
  id!: Uint8Array;

  /*   
  ID file is an array of two byte-string constituing 
  a file identifier

  Required if Encrypt entry is present in Trailer
  Doesn't really matter what it is as long as it is 
  consistently used. 
  */
  static generateFileID(info: PDFDict): Uint8Array {
    return wordArrayToBuffer(CryptoJS.MD5(info.toString()));
  }

  static generateRandomWordArray(bytes: number): WordArray {
    return CryptoJS.lib.WordArray.random(bytes);
  }

  static create(
    document: PDFDocument,
    options: SecurityOption = {} as SecurityOption,
  ) {
    return new PDFSecurity(document, options);
  }

  constructor(
    document: PDFDocument,
    options: SecurityOption = {} as SecurityOption,
  ) {
    if (!options.ownerPassword && !options.userPassword) {
      throw new Error('None of owner password and user password is defined.');
    }

    this.document = document;
    this._setupEncryption(options);
  }

  /* 
  Handle all encryption process and give back 
  EncryptionDictionary that is required
  to be plugged into Trailer of the PDF 
  */
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
    const encDict = {
      Filter: 'Standard',
    } as EncDictV1V2V4;

    let r: EncDictR;
    let permissions: number;

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
    const encDict = {
      Filter: 'Standard',
    } as EncDictV5;

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
        key = CryptoJS.MD5(digest);
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

/**
 * Get Permission Flag for use Encryption Dictionary (Key: P)
 * For Security Handler revision 2
 *
 * Only bit position 3,4,5,6,9,10,11 and 12 is meaningful
 * Refer Table 22 - User access permission
 * @param  {permissionObject} {@link UserPermission}
 * @returns number - Representing unsigned 32-bit integer
 */
const getPermissionsR2 = (permissionObject: UserPermission = {}) => {
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
};

/**
 * Get Permission Flag for use Encryption Dictionary (Key: P)
 * For Security Handler revision 2
 *
 * Only bit position 3,4,5,6,9,10,11 and 12 is meaningful
 * Refer Table 22 - User access permission
 * @param  {permissionObject} {@link UserPermission}
 * @returns number - Representing unsigned 32-bit integer
 */
const getPermissionsR3 = (permissionObject: UserPermission = {}) => {
  let permissions = 0xfffff0c0 >> 0;
  if (
    permissionObject.printing === 'lowResolution' ||
    permissionObject.printing
  ) {
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
};

const getUserPasswordR2 = (encryptionKey: CryptoJS.lib.WordArray) =>
  CryptoJS.RC4.encrypt(processPasswordR2R3R4(), encryptionKey).ciphertext;

const getUserPasswordR3R4 = (
  documentId: Uint8Array,
  encryptionKey: WordArray,
) => {
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
};

const getOwnerPasswordR2R3R4 = (
  r: EncDictR,
  keyBits: EncKeyBits,
  paddedUserPassword: WordArray,
  paddedOwnerPassword: WordArray,
): CryptoJS.lib.WordArray => {
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
};

const getEncryptionKeyR2R3R4 = (
  r: EncDictR,
  keyBits: EncKeyBits,
  documentId: Uint8Array,
  paddedUserPassword: WordArray,
  ownerPasswordEntry: WordArray,
  permissions: number,
): WordArray => {
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
};

const getUserPasswordR5 = (
  processedUserPassword: WordArray,
  generateRandomWordArray: generateRandomWordArrayFn,
) => {
  const validationSalt = generateRandomWordArray(8);
  const keySalt = generateRandomWordArray(8);
  return CryptoJS.SHA256(processedUserPassword.clone().concat(validationSalt))
    .concat(validationSalt)
    .concat(keySalt);
};

const getUserEncryptionKeyR5 = (
  processedUserPassword: WordArray,
  userKeySalt: WordArray,
  encryptionKey: WordArray,
) => {
  const key = CryptoJS.SHA256(
    processedUserPassword.clone().concat(userKeySalt),
  );
  const options = {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.NoPadding,
    iv: CryptoJS.lib.WordArray.create((null as unknown) as undefined, 16),
  };
  return CryptoJS.AES.encrypt(encryptionKey, key, options).ciphertext;
};

const getOwnerPasswordR5 = (
  processedOwnerPassword: WordArray,
  userPasswordEntry: WordArray,
  generateRandomWordArray: generateRandomWordArrayFn,
) => {
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
};

const getOwnerEncryptionKeyR5 = (
  processedOwnerPassword: WordArray,
  ownerKeySalt: WordArray,
  userPasswordEntry: WordArray,
  encryptionKey: WordArray,
) => {
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
};

const getEncryptionKeyR5 = (
  generateRandomWordArray: generateRandomWordArrayFn,
) => generateRandomWordArray(32);

const getEncryptedPermissionsR5 = (
  permissions: number,
  encryptionKey: WordArray,
  generateRandomWordArray: generateRandomWordArrayFn,
) => {
  const cipher = CryptoJS.lib.WordArray.create(
    [lsbFirstWord(permissions), 0xffffffff, 0x54616462],
    12,
  ).concat(generateRandomWordArray(4));
  const options = {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
  };
  return CryptoJS.AES.encrypt(cipher, encryptionKey, options).ciphertext;
};

const processPasswordR2R3R4 = (password = '') => {
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
};

const processPasswordR5 = (password = '') => {
  password = unescape(encodeURIComponent(saslprep(password)));
  const length = Math.min(127, password.length);
  const out = Buffer.alloc(length);

  for (let i = 0; i < length; i++) {
    out[i] = password.charCodeAt(i);
  }

  return CryptoJS.lib.WordArray.create((out as unknown) as number[]);
};

const lsbFirstWord = (data: number): number =>
  ((data & 0xff) << 24) |
  ((data & 0xff00) << 8) |
  ((data >> 8) & 0xff00) |
  ((data >> 24) & 0xff);

const wordArrayToBuffer = (wordArray: WordArray): Uint8Array => {
  const byteArray = [];
  for (let i = 0; i < wordArray.sigBytes; i++) {
    byteArray.push(
      (wordArray.words[Math.floor(i / 4)] >> (8 * (3 - (i % 4)))) & 0xff,
    );
  }

  return Uint8Array.from(byteArray);
};

/* 
  7.6.3.3 Encryption Key Algorithm
  Algorithm 2
  Password Padding to pad or truncate
  the password to exactly 32 bytes
*/
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
