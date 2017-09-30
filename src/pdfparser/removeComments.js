import parseHeader from './parseHeader';

const removeComments = (input) => {
  // Add newline to catch comments at end of file since it got trimmed off
  const trimmed = input.trim() + '\n';
  let result = trimmed;
  let stopIdx = trimmed.indexOf('%');
  while (stopIdx !== -1) {
    if (
      !parseHeader(result.substring(stopIdx)) &&
      !result.substring(stopIdx, stopIdx + 5).includes('%EOF')
    ) {
      const nearestNewline = result.indexOf('\n', stopIdx + 1);
      result =
        result.substring(0, stopIdx) +
        result.substring(nearestNewline);
    }
    stopIdx = result.indexOf('%', stopIdx + 1);
  }
  return result;
}

export default removeComments;
