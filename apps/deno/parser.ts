type ICLIArg = { [key: string]: string }[];

// A simple CLI Arg parser, doesn't handle a lot of edge cases.. It's a start..
export const parseCLIArg = (arg: Array<string>): ICLIArg => {
  return arg
    .map((argArray) => argArray.split('='))
    .map(([key, value]) => ({ [key.substr(2)]: value }));
};

export const defineReader = (): string => {
  const CLIArg = parseCLIArg(Deno.args);
  let reader = 'Preview';

  // Error handling when reader arg not passed in can be improved.
  if (CLIArg.length !== 0) {
    let readerArg = CLIArg.find((arg) => arg.hasOwnProperty('reader'));
    if (readerArg !== undefined) reader = readerArg.reader;
  }
  return reader;
};
