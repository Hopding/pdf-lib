"use strict";
/*
 * Copyright 2012 Mozilla Foundation
 *
 * The RunLengthStream class contained in this file is a TypeScript port of the
 * JavaScript RunLengthStream class in Mozilla's pdf.js project, made available
 * under the Apache 2.0 open source license.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var DecodeStream_1 = tslib_1.__importDefault(require("./DecodeStream"));
var RunLengthStream = /** @class */ (function (_super) {
    tslib_1.__extends(RunLengthStream, _super);
    function RunLengthStream(stream, maybeLength) {
        var _this = _super.call(this, maybeLength) || this;
        _this.stream = stream;
        return _this;
    }
    RunLengthStream.prototype.readBlock = function () {
        // The repeatHeader has following format. The first byte defines type of run
        // and amount of bytes to repeat/copy: n = 0 through 127 - copy next n bytes
        // (in addition to the second byte from the header), n = 129 through 255 -
        // duplicate the second byte from the header (257 - n) times, n = 128 - end.
        var repeatHeader = this.stream.getBytes(2);
        if (!repeatHeader || repeatHeader.length < 2 || repeatHeader[0] === 128) {
            this.eof = true;
            return;
        }
        var buffer;
        var bufferLength = this.bufferLength;
        var n = repeatHeader[0];
        if (n < 128) {
            // copy n bytes
            buffer = this.ensureBuffer(bufferLength + n + 1);
            buffer[bufferLength++] = repeatHeader[1];
            if (n > 0) {
                var source = this.stream.getBytes(n);
                buffer.set(source, bufferLength);
                bufferLength += n;
            }
        }
        else {
            n = 257 - n;
            var b = repeatHeader[1];
            buffer = this.ensureBuffer(bufferLength + n + 1);
            for (var i = 0; i < n; i++) {
                buffer[bufferLength++] = b;
            }
        }
        this.bufferLength = bufferLength;
    };
    return RunLengthStream;
}(DecodeStream_1.default));
exports.default = RunLengthStream;
//# sourceMappingURL=RunLengthStream.js.map