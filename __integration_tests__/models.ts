export interface ITestAssets {
  fonts: {
    ttf: {
      ubuntu_r: Uint8Array;
      bio_rhyme_r: Uint8Array;
      press_start_2p_r: Uint8Array;
      indie_flower_r: Uint8Array;
      great_vibes_r: Uint8Array;
    };
    otf: {
      fantasque_sans_mono_bi: Uint8Array;
      apple_storm_r: Uint8Array;
      hussar_3d_r: Uint8Array;
    };
  };
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
