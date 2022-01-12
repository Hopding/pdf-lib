"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleRNG = void 0;
/**
 * Generates a pseudo random number. Although it is not cryptographically secure
 * and uniformly distributed, it is not a concern for the intended use-case,
 * which is to generate distinct numbers.
 *
 * Credit: https://stackoverflow.com/a/19303725/10254049
 */
var SimpleRNG = /** @class */ (function () {
    function SimpleRNG(seed) {
        this.seed = seed;
    }
    SimpleRNG.prototype.nextInt = function () {
        var x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    };
    SimpleRNG.withSeed = function (seed) { return new SimpleRNG(seed); };
    return SimpleRNG;
}());
exports.SimpleRNG = SimpleRNG;
//# sourceMappingURL=rng.js.map