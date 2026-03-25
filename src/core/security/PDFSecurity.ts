import CryptoJS from 'crypto-js';
import PDFContext from '../PDFContext';

type WordArray = CryptoJS.lib.WordArray;
type RandomWordArrayGenerator = (bytes: number) => WordArray;

/**
 * Interface representing user permissions.
 *
 * @interface UserPermissions
 */
interface UserPermissions {
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
 * Interface options for security
 * @interface SecurityOptions
 */
export interface SecurityOptions {
  /**
   * Password that provides unlimited access to the encrypted document.
   *
   * Opening encrypted document with owner password allows full (owner) access to the document
   */
  ownerPassword?: string;

  /** Password that restricts reader according to the defined permissions.
   *
   * Opening encrypted document with user password will have limitations in accordance to the permission defined.
   */
  userPassword?: string;

  /** Object representing type of user permission enforced on the document
   * @link {@link UserPermissions}
   */
  permissions?: UserPermissions;
}

type Algorithm = 1 | 2 | 4 | 5;
type Revision = 2 | 3 | 4 | 5;
type KeyBits = 40 | 128 | 256;

type Encryption = {
  V: number;
  R: number;
  O: Uint8Array;
  U: Uint8Array;
  P: number;
  Filter: string;
  Length?: number;
  CF?: {
    StdCF: {
      AuthEvent: 'DocOpen';
      CFM: 'AESV2' | 'AESV3';
      Length: number;
    };
  };
  StmF?: string;
  StrF?: string;
  OE?: Uint8Array;
  UE?: Uint8Array;
  Perms?: Uint8Array;
};

class PDFSecurity {
  context: PDFContext;

  // These are required values which are set by the `initalize` function.
  private id!: Uint8Array;
  private encryption!: Encryption;
  private keyBits!: KeyBits;
  private encryptionKey!: WordArray;

  static create(context: PDFContext, options: SecurityOptions) {
    return new PDFSecurity(context, options);
  }

  constructor(context: PDFContext, options: SecurityOptions) {
    if (!options.ownerPassword && !options.userPassword) {
      throw new Error(
        'Either an owner password or a user password must be specified.',
      );
    }

    this.context = context;

    this.initialize(options);
  }

  private initialize(options: SecurityOptions) {
    this.id = generateFileID();

    let v: Algorithm;
    switch (this.context.header.getVersionString()) {
      case '1.4':
      case '1.5':
        v = 2;
        break;
      case '1.6':
      case '1.7':
        v = 4;
        break;
      case '1.7ext3':
        v = 5;
        break;
      default:
        v = 1;
        break;
    }

    switch (v) {
      case 1:
      case 2:
      case 4:
        this.encryption = this.initializeV1V2V4(v, options);
        break;
      case 5:
        this.encryption = this.initializeV5(options);
        break;
    }
  }

  private initializeV1V2V4(v: Algorithm, options: SecurityOptions): Encryption {
    const encryption = {
      Filter: 'Standard',
    } as Encryption;

    let r: Revision;
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
        throw new Error(`Unsupported algorithm '${v}'.`);
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
      this.id,
      paddedUserPassword,
      ownerPasswordEntry,
      permissions,
    );

    let userPasswordEntry;
    if (r === 2) {
      userPasswordEntry = getUserPasswordR2(this.encryptionKey);
    } else {
      userPasswordEntry = getUserPasswordR3R4(this.id, this.encryptionKey);
    }

    encryption.V = v;
    if (v >= 2) {
      encryption.Length = this.keyBits;
    }
    if (v === 4) {
      encryption.CF = {
        StdCF: {
          AuthEvent: 'DocOpen',
          CFM: 'AESV2',
          Length: this.keyBits / 8,
        },
      };
      encryption.StmF = 'StdCF';
      encryption.StrF = 'StdCF';
    }

    encryption.R = r;

    encryption.O = wordArrayToBuffer(ownerPasswordEntry);
    encryption.U = wordArrayToBuffer(userPasswordEntry);
    encryption.P = permissions;

    return encryption;
  }

  private initializeV5(options: SecurityOptions): Encryption {
    const encryption = {
      Filter: 'Standard',
    } as Encryption;

    this.keyBits = 256;

    this.encryptionKey = getEncryptionKeyR5(generateRandomWordArray);

    const processedUserPassword = processPasswordR5(options.userPassword);
    const userPasswordEntry = getUserPasswordR5(
      processedUserPassword,
      generateRandomWordArray,
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

    const processedOwnerPassword = options.ownerPassword
      ? processPasswordR5(options.ownerPassword)
      : processedUserPassword;
    const ownerPasswordEntry = getOwnerPasswordR5(
      processedOwnerPassword,
      userPasswordEntry,
      generateRandomWordArray,
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

    const permissions = getPermissionsR3(options.permissions);
    const permissionsEntry = getEncryptedPermissionsR5(
      permissions,
      this.encryptionKey,
      generateRandomWordArray,
    );

    encryption.V = 5;
    encryption.Length = this.keyBits;
    encryption.CF = {
      StdCF: {
        AuthEvent: 'DocOpen',
        CFM: 'AESV3',
        Length: this.keyBits / 8,
      },
    };
    encryption.StmF = 'StdCF';
    encryption.StrF = 'StdCF';

    encryption.R = 5;

    encryption.O = wordArrayToBuffer(ownerPasswordEntry);
    encryption.OE = wordArrayToBuffer(ownerEncryptionKeyEntry);
    encryption.U = wordArrayToBuffer(userPasswordEntry);
    encryption.UE = wordArrayToBuffer(userEncryptionKeyEntry);
    encryption.P = permissions;
    encryption.Perms = wordArrayToBuffer(permissionsEntry);

    return encryption;
  }

  getEncryptFn(obj: number, gen: number) {
    const v = this.encryption.V;

    let digest: WordArray;
    let key: WordArray;
    if (v < 5) {
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

      if (v === 1 || v === 2) {
        key = CryptoJS.MD5(digest);
        key.sigBytes = Math.min(16, this.keyBits / 8 + 5);
        return (buffer: Uint8Array) =>
          wordArrayToBuffer(
            CryptoJS.RC4.encrypt(
              CryptoJS.lib.WordArray.create(buffer as unknown as number[]),
              key,
            ).ciphertext,
          );
      }

      if (v === 4) {
        key = CryptoJS.MD5(
          digest.concat(CryptoJS.lib.WordArray.create([0x73416c54], 4)),
        );
      }
    } else if (v === 5) {
      key = this.encryptionKey;
    } else {
      throw new Error(`Unsupported algorithm '${v}'.`);
    }

    const iv = generateRandomWordArray(16);
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
              CryptoJS.lib.WordArray.create(buffer as unknown as number[]),
              key,
              options,
            ).ciphertext,
          ),
      );
  }

  encrypt() {
    const ID = this.context.obj([this.id, this.id]);
    this.context.trailerInfo.ID = ID;

    const Encrypt = this.context.obj(this.encryption);
    this.context.trailerInfo.Encrypt = this.context.register(Encrypt);

    return this;
  }
}

/**
 * A file ID is required if Encrypt entry is present in Trailer
 * Doesn't really matter what it is as long as it is consistently
 * used.
 *
 * @returns Uint8Array
 */
const generateFileID = (): Uint8Array =>
  wordArrayToBuffer(CryptoJS.MD5(Date.now().toString()));

const generateRandomWordArray = (bytes: number): WordArray =>
  CryptoJS.lib.WordArray.random(bytes);

/**
 * Get Permission Flag for use Encryption Dictionary (Key: P)
 * For Security Handler revision 2
 *
 * Only bit position 3,4,5,6,9,10,11 and 12 is meaningful
 * Refer Table 22 - User access permission
 * @param  {permissions} {@link UserPermissions}
 * @returns number - Representing unsigned 32-bit integer
 */
const getPermissionsR2 = (permissions: UserPermissions = {}) => {
  let flags = 0xffffffc0 >> 0;
  if (permissions.printing) {
    flags |= 0b000000000100;
  }
  if (permissions.modifying) {
    flags |= 0b000000001000;
  }
  if (permissions.copying) {
    flags |= 0b000000010000;
  }
  if (permissions.annotating) {
    flags |= 0b000000100000;
  }
  return flags;
};

/**
 * Get Permission Flag for use Encryption Dictionary (Key: P)
 * For Security Handler revision 2
 *
 * Only bit position 3,4,5,6,9,10,11 and 12 is meaningful
 * Refer Table 22 - User access permission
 * @param  {permissions} {@link UserPermissions}
 * @returns number - Representing unsigned 32-bit integer
 */
const getPermissionsR3 = (permissions: UserPermissions = {}) => {
  let flags = 0xfffff0c0 >> 0;
  if (permissions.printing === 'lowResolution' || permissions.printing) {
    flags |= 0b000000000100;
  }
  if (permissions.printing === 'highResolution') {
    flags |= 0b100000000100;
  }
  if (permissions.modifying) {
    flags |= 0b000000001000;
  }
  if (permissions.copying) {
    flags |= 0b000000010000;
  }
  if (permissions.annotating) {
    flags |= 0b000000100000;
  }
  if (permissions.fillingForms) {
    flags |= 0b000100000000;
  }
  if (permissions.contentAccessibility) {
    flags |= 0b001000000000;
  }
  if (permissions.documentAssembly) {
    flags |= 0b010000000000;
  }
  return flags;
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
      CryptoJS.lib.WordArray.create(documentId as unknown as number[]),
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
    CryptoJS.lib.WordArray.create(null as unknown as undefined, 16),
  );
};

const getOwnerPasswordR2R3R4 = (
  r: Revision,
  keyBits: KeyBits,
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
  r: Revision,
  keyBits: KeyBits,
  documentId: Uint8Array,
  paddedUserPassword: WordArray,
  ownerPasswordEntry: WordArray,
  permissions: number,
): WordArray => {
  let key = paddedUserPassword
    .clone()
    .concat(ownerPasswordEntry)
    .concat(CryptoJS.lib.WordArray.create([lsbFirstWord(permissions)], 4))
    .concat(CryptoJS.lib.WordArray.create(documentId as unknown as number[]));
  const round = r >= 3 ? 51 : 1;
  for (let i = 0; i < round; i++) {
    key = CryptoJS.MD5(key);
    key.sigBytes = keyBits / 8;
  }
  return key;
};

const getUserPasswordR5 = (
  processedUserPassword: WordArray,
  randomWordArrayGenerator: RandomWordArrayGenerator,
) => {
  const validationSalt = randomWordArrayGenerator(8);
  const keySalt = randomWordArrayGenerator(8);
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
    iv: CryptoJS.lib.WordArray.create(null as unknown as undefined, 16),
  };
  return CryptoJS.AES.encrypt(encryptionKey, key, options).ciphertext;
};

const getOwnerPasswordR5 = (
  processedOwnerPassword: WordArray,
  userPasswordEntry: WordArray,
  randomWordArrayGenerator: RandomWordArrayGenerator,
) => {
  const validationSalt = randomWordArrayGenerator(8);
  const keySalt = randomWordArrayGenerator(8);
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
    iv: CryptoJS.lib.WordArray.create(null as unknown as undefined, 16),
  };
  return CryptoJS.AES.encrypt(encryptionKey, key, options).ciphertext;
};

const getEncryptionKeyR5 = (
  randomWordArrayGenerator: RandomWordArrayGenerator,
) => randomWordArrayGenerator(32);

const getEncryptedPermissionsR5 = (
  permissions: number,
  encryptionKey: WordArray,
  randomWordArrayGenerator: RandomWordArrayGenerator,
) => {
  const cipher = CryptoJS.lib.WordArray.create(
    [lsbFirstWord(permissions), 0xffffffff, 0x54616462],
    12,
  ).concat(randomWordArrayGenerator(4));
  const options = {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
  };
  return CryptoJS.AES.encrypt(cipher, encryptionKey, options).ciphertext;
};

const processPasswordR2R3R4 = (password = '') => {
  const out = new Uint8Array(32);
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
  return CryptoJS.lib.WordArray.create(out as unknown as number[]);
};

const processPasswordR5 = (password = '') => {
  // NOTE: Removed this line to eliminate need for the saslprep dependency.
  // Probably worth investigating the cases that would be impacted by this.
  // password = unescape(encodeURIComponent(saslprep(password)));

  const length = Math.min(127, password.length);
  const out = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    out[i] = password.charCodeAt(i);
  }

  return CryptoJS.lib.WordArray.create(out as unknown as number[]);
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
  0x28, 0xbf, 0x4e, 0x5e, 0x4e, 0x75, 0x8a, 0x41, 0x64, 0x00, 0x4e, 0x56, 0xff,
  0xfa, 0x01, 0x08, 0x2e, 0x2e, 0x00, 0xb6, 0xd0, 0x68, 0x3e, 0x80, 0x2f, 0x0c,
  0xa9, 0xfe, 0x64, 0x53, 0x69, 0x7a,
];

export default PDFSecurity;
