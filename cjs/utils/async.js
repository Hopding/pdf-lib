"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForTick = void 0;
/**
 * Returns a Promise that resolves after at least one tick of the
 * Macro Task Queue occurs.
 */
exports.waitForTick = function () {
    return new Promise(function (resolve) {
        setTimeout(function () { return resolve(); }, 0);
    });
};
//# sourceMappingURL=async.js.map