import parseHeader from './parseHeader';
import { mergeUint8Arrays } from '../utils';

// const removeComments = (input) => {
//   // Add newline to catch comments at end of file since it got trimmed off
//   const trimmed = input.trim() + '\n';
//   let result = trimmed;
//   let stopIdx = trimmed.indexOf('%');
//   while (stopIdx !== -1) {
//     if (
//       !parseHeader(result.substring(stopIdx)) &&
//       !result.substring(stopIdx, stopIdx + 5).includes('%EOF')
//     ) {
//       const nearestNewline = result.indexOf('\n', stopIdx + 1);
//       result =
//         result.substring(0, stopIdx) +
//         result.substring(nearestNewline);
//     }
//     stopIdx = result.indexOf('%', stopIdx + 1);
//   }
//   return result;
// }

const removeComments = input => {
  console.log('removing comments');
  let result = new StringView(input);
  let stopIdx = result.indexOfChar('%');
  while (stopIdx !== -1) {
    const str = Array.from(result.rawData.slice(stopIdx, stopIdx + 5)).map(n =>
      String.fromCharCode(n),
    );
    console.log('result.subview:', str);
    if (
      // !parseHeader(result.subview(stopIdx).toString()) &&
      !parseHeader(result.rawData, stopIdx) &&
      !result
        .subview(stopIdx, stopIdx + 5)
        .toString()
        .includes('%EOF')
    ) {
      const nearestNewline = result.indexOfChar('\n', stopIdx + 1);
      const newDataLeft = result.rawData.slice(0, stopIdx);
      const newDataRight = result.rawData.slice(nearestNewline);
      result = new StringView(mergeUint8Arrays(newDataLeft, newDataRight));
      console.log(result.toString().length);
    }
    stopIdx = result.indexOfChar('%', stopIdx + 1);
  }
  return result.rawData;
};

export default removeComments;
