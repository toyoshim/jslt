/**
 * Copyright (c) 2014, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */
/**
 * ArrayBufferFile class.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 * @param buffer {ArrayBuffer} object that is handled as a file in the instance.
 * @param offset {Number} offset to start in bytes (optional).
 * @param size {Number} size in bytes (optional).
 * @constructor
 */
function ArrayBufferFile (buffer, offset, size) {
  if (buffer.constructor.name != 'ArrayBuffer')
      throw Error('the first argument should be an instance of ArrayBuffer');
  File.call(this);
  if (!offset)
      offset = 0;
  if (!size)
      size = buffer.byteLength - offset;
  this._buffer = new Uint8Array(buffer, offset, size);
  this._position = 0;
}
try {
    exports.ArrayBufferFile = ArrayBufferFile;
} catch (e) {}

/** Inherits File */
ArrayBufferFile.prototype = File.prototype;
ArrayBufferFile.prototype.constructor = ArrayBufferFile;

/**
 * Reads data. See also File.prototype.read.
 * @param size size to read in byte.
 * @param buffer {Uint8Array} buffer to store read data (optional).
 * @return {Promise}
 */
ArrayBufferFile.prototype.read = function (size, buffer) {
    return new Promise(function (success, error) {
        if (size < 0) {
            error({status: File.INVALID});
            return;
        }
        var readSize = size;
        var position = this.position();
        if (position + size > this.size())
            readSize = this.size() - position;
        var readBuffer;
        if (buffer) {
            for (var i = 0; i < readSize; ++i)
                buffer[i] = this._buffer[position + i];
            readBuffer = buffer;
        } else {
            readBuffer = this._buffer.subarray(
                position, position + readSize);
        }
        this._position += readSize;
        success({size: readSize, buffer: readBuffer});
    }.bind(this));
};

/**
 * Writes data. See also File.prototype.write.
 * @param buffer {Uint8Array} buffer containng data for writing.
 * @return {Promise}
 */
ArrayBufferFile.prototype.write = function (buffer) {
    return new Promise(function (success, error) {
        var position = this.position();
        if (position + buffer.byteLength > this.size()) {
            error({status: File.STORAGE_FULL});
            return;
        }
        for (var i = 0; i < buffer.byteLength; ++i)
            this._buffer[position + i] = buffer[i];
        this._position += buffer.byteLength;
        success();
    }.bind(this));
};

/**
 * Seeks. See also File.prototype.seek.
 * @param offset {Number} offset from whence
 * @param whence {Number} base position, one of File.SET, CUR, and END.
 * @return {Promise}
 */
ArrayBufferFile.prototype.seek = function (offset, whence) {
    return new Promise(function (success, error) {
        var newPosition = offset;
        if (whence == File.SET) {
        } else if (whence == File.CUR) {
            newPosition += this.position();
        } else if (whence == File.END) {
            newPosition += this.size();
        } else {
            error({status: File.INVALID});
            return;
        }
        if (newPosition < 0 || this.size() < newPosition) {
            error({status: File.OUT_OF_RANGE});
            return;
        }
        this._position = newPosition;
        success();
    }.bind(this));
};

/**
 * Returns current seek position. See also File.prototype.position.
 * @return {Number}
 */
ArrayBufferFile.prototype.position = function () {
    return this._position;
};

/**
 * Returns file size. See also File.prototype.size.
 * @return {Number}
 */
ArrayBufferFile.prototype.size = function () {
    return this._buffer.byteLength;
};

