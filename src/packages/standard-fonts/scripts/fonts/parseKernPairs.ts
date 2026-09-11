import { extractLinesFromSection } from './utils';

export type IKernPair = [string, string, number];

/**
 * From https://www.adobe.com/content/dam/acom/en/devnet/font/pdfs/5004.AFM_Spec.pdf :
 *
 * KPX name_1 name_2 number_x:
 *   Name of the first character in the kerning pair followed by the name of the
 *   second character followed by the kerning amount in the x direction
 *   (y is zero). The kerning amount is specified in the units of the character
 *   coordinate system.
 *
 * Fallback link for AFM Spec:
 *   https://ia800603.us.archive.org/30/items/afm-format/afm-format.pdf
 */
const parseKernPair = (
  // E.g. 'KPX A G -50'
  line: string,
): IKernPair => {
  const [, firstCharName, secondCharName, kernXAmount] = line.split(' ');
  return [String(firstCharName), String(secondCharName), Number(kernXAmount)];
};

export const parseKernPairsSection = (data: string): IKernPair[] => {
  return extractLinesFromSection(data, {
    startAt: 'StartKernPairs',
    endAt: 'EndKernPairs',
  }).map(parseKernPair);
};
