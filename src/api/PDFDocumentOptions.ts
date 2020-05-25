export enum ParseSpeeds {
  Fastest = Infinity,
  Fast = 1500,
  Medium = 500,
  Slow = 100,
}

export interface AttachmentOptions {
  mimeType: string;
  description?: string;
  creationDate?: Date;
  modificationDate?: Date;
  checkSum?: string;
}

export interface SaveOptions {
  useObjectStreams?: boolean;
  addDefaultPage?: boolean;
  objectsPerTick?: number;
}

export interface Base64SaveOptions extends SaveOptions {
  dataUri?: boolean;
}

export interface LoadOptions {
  ignoreEncryption?: boolean;
  parseSpeed?: ParseSpeeds | number;
  throwOnInvalidObject?: boolean;
  updateMetadata?: boolean;
  capNumbers?: boolean;
}

export interface CreateOptions {
  updateMetadata?: boolean;
}

export interface EmbedFontOptions {
  subset?: boolean;
}
