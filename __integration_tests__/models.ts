export interface ITestAssets {
  fonts: {};
  images: {};
}

export type IPDFCreator = (assets: ITestAssets) => Uint8Array;

export type IPDFModifier = (
  assets: ITestAssets,
  basePdf: Uint8Array,
) => Uint8Array;

export interface ITest {
  kernel: IPDFCreator | IPDFModifier;
  description: string;
  checklist: string[];
}
