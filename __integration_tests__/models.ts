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
  images: {
    jpg: {
      cat_riding_unicorn: Uint8Array;
      minions_laughing: Uint8Array;
    };
    png: {
      greyscale_bird: Uint8Array;
      minions_banana_alpha: Uint8Array;
      minions_banana_no_alpha: Uint8Array;
      small_mario: Uint8Array;
    };
  };
  pdfs: {
    normal: Uint8Array;
    with_update_sections: Uint8Array;
    linearized_with_object_streams: Uint8Array;
    with_large_page_count: Uint8Array;
    with_missing_endstream_eol_and_polluted_ctm: Uint8Array;
  };
}

export type ITestKernel = (assets: ITestAssets) => Uint8Array;

export interface ITest {
  kernel: ITestKernel;
  description: string;
  checklist: string[];
}
