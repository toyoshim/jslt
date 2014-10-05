/**
 * Copyright (c) 2014, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */
/**
 * File class.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 */
function File () {
}
try {
    exports.File = File;
} catch (e) {}

// Seek parameter used for whence.
File.SET = 0;
File.CUR = 1;
File.END = 2;

// Status code.
File.OK = 0;
File.NOT_SUPPORTED = 1;

/**
 * Reads data. Success callback of Promise is called when read operation
 * successes, otherwise error callback is called. Success callback is invoked
 * with an result argument {Object} containing size {Number} for actual read
 * size, and buffer {Uint8Array} for buffer to store read data. If |buffer|
 * is not specified in arguments, new Uint8Array created internally is set.
 * Error callback is invoked with an error argument {Object} containing status
 * {Number} for failure reason, e.g. File.NOT_SUPPORTED.
 * @param size size to read in byte.
 * @param buffer {Uint8Array} buffer to store read data (optional)
 * @return {Promise}
 */
File.prototype.read = function (size, buffer) {
    return new Promise(function (success, error) {
        error({status: File.NOT_SUPPORTED});
    });
};

/**
 * Writes data. Success callback of Promise is called when write operation
 * successes, otherwise error callback is called. Success callback is invoked
 * without argument, and error callback is invoked with an error argument
 * {Object} containing status {Number} for failure reason.
 * @param buffer {Uint8Array} buffer containng data for writing.
 * @return {Promise}
 */
File.prototype.write = function (buffer) {
    return new Promise(function (success, error) {
        error({status: File.NOT_SUPPORTED});
    });
};

/**
 * Seeks. Success callback of Promise is invoked without argument on success,
 * otherwise error callback is invoked with an argument containing status.
 * @param offset {Number} offset from whence
 * @param whence {Number} base position, one of File.SET, CUR, and END.
 * @return {Promise}
 */
File.prototype.seek = function (offset, whence) {
    return new Promise(function (success, error) {
        error({status: File.NOT_SUPPORTED});
    });
};

/**
 * Returns current seek position.
 * @return {Number}
 */
File.prototype.position = function () {
    return 0;
};

/**
 * Returns file size.
 * @return {Number}
 */
File.prototype.size = function () {
    return 0;
};

