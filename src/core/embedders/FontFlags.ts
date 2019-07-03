import { Font } from 'src/types/fontkit';

export interface FontFlagOptions {
  fixedPitch?: boolean;
  serif?: boolean;
  symbolic?: boolean;
  script?: boolean;
  nonsymbolic?: boolean;
  italic?: boolean;
  allCap?: boolean;
  smallCap?: boolean;
  forceBold?: boolean;
}

// prettier-ignore
const makeFontFlags = (options: FontFlagOptions) => {
  let flags = 0;

  const flipBit = (bit: number) => { flags |= (1 << (bit - 1)); };

  if (options.fixedPitch)  flipBit(1);
  if (options.serif)       flipBit(2);
  if (options.symbolic)    flipBit(3);
  if (options.script)      flipBit(4);
  if (options.nonsymbolic) flipBit(6);
  if (options.italic)      flipBit(7);
  if (options.allCap)      flipBit(17);
  if (options.smallCap)    flipBit(18);
  if (options.forceBold)   flipBit(19);

  return flags;
};

// From: https://github.com/foliojs/pdfkit/blob/83f5f7243172a017adcf6a7faa5547c55982c57b/lib/font/embedded.js#L123-L129
export const deriveFontFlags = (font: Font): number => {
  const familyClass = font['OS/2'] ? font['OS/2'].sFamilyClass : 0;
  const flags = makeFontFlags({
    fixedPitch: font.post.isFixedPitch,
    serif: 1 <= familyClass && familyClass <= 7,
    symbolic: true, // Assume the font uses non-latin characters
    script: familyClass === 10,
    italic: font.head.macStyle.italic,
  });
  return flags;
};
