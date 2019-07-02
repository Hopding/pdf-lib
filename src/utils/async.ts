/**
 * Returns a Promise that resolves after at least one tick of the
 * Macro Task Queue occurs.
 */
export const waitForTick = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), 0);
  });
