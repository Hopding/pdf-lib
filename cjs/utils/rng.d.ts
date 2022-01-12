/**
 * Generates a pseudo random number. Although it is not cryptographically secure
 * and uniformly distributed, it is not a concern for the intended use-case,
 * which is to generate distinct numbers.
 *
 * Credit: https://stackoverflow.com/a/19303725/10254049
 */
export declare class SimpleRNG {
    static withSeed: (seed: number) => SimpleRNG;
    private seed;
    private constructor();
    nextInt(): number;
}
//# sourceMappingURL=rng.d.ts.map