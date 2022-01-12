"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Cache = /** @class */ (function () {
    function Cache(populate) {
        this.populate = populate;
        this.value = undefined;
    }
    Cache.prototype.getValue = function () {
        return this.value;
    };
    Cache.prototype.access = function () {
        if (!this.value)
            this.value = this.populate();
        return this.value;
    };
    Cache.prototype.invalidate = function () {
        this.value = undefined;
    };
    Cache.populatedBy = function (populate) { return new Cache(populate); };
    return Cache;
}());
exports.default = Cache;
//# sourceMappingURL=Cache.js.map