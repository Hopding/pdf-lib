/**
 * Generates a pseudo random number. Although it is not cryptographically secure
 * and uniformly distributed, it is not a concern for the intended use-case,
 * which is to generate distinct numbers.
 *
 * Credit: https://stackoverflow.com/a/19303725/10254049
 */
export class SimpleRNG {
  static withSeed = (seed: number) => new SimpleRNG(seed);

  private seed: number;

  private constructor(seed: number) {
    this.seed = seed;
  }

  nextInt(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
}
