/**
 * Copyright (c) 2012, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */
/**
 * Pseudo ArrayBuffer.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 * @param length {Number} Buffer length.
 * @constructor
 */
function ArrayBuffer (length) {
    Object.defineProperty(this, 'byteLength', {
        value: length,
        enumerable: true
    });
    Object.defineProperty(this, '__buffer__', {
        value: new Array(length)
    });
}
exports.ArrayBuffer = ArrayBuffer;

/**
 * Returns a new ArrayBuffer whose contents are a copy of this ArrayBuffer's
 * bytes from |begin|, inclusive, up to |end|, exclusive.
 * TODO: Support negative value of begin and end.
 * @param begin {number} Start offset in this ArrayBuffer.
 * @param end {number} End offset in this ArrayBuffer.
 * @return {ArrayBuffer} New ArrayBuffer.
 */
ArrayBuffer.prototype.slice = function (begin, end) {
    if (arguments.length < 2)
        end = this.byteLength;
    var length = end - begin;
    var array = new ArrayBuffer(length);
    for (var i = 0; i < length; i++)
        array.__buffer__[i] = this.__buffer__[begin + i];
    return array;
};

/**
 * Pseudo DataView.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 * @param buffer {ArrayBuffer} ArrayBuffer.
 * @param byteOffset {number} Start offset in ArrayBuffer.
 * @param byteLength {number} Byte length from start offset in ArrayBuffer.
 * @constructor
 * TODO: Uint16/Int16/Int32/Float32/Float64 functions.
 */
function DataView (buffer, byteOffset, byteLength) {
    if (arguments.length < 3) {
        if (arguments.length < 2)
            byteOffset = 0;
        byteLength = buffer.byteLength - byteOffset;
    }
    Object.defineProperty(this, 'buffer', {
        value: buffer,
        enumerable: true
    });
    Object.defineProperty(this, 'byteOffset', {
        value: byteOffset,
        enumerable: true
    });
    Object.defineProperty(this, 'byteLength', {
        value: byteLength,
        enumerable: true
    });
}
exports.DataView = DataView;

/**
 * Sets Uint8, Int8, and Uint32 |value| at offset |byteOffset| of bytes.
 * Stores it in little endian format if |littleEndian| is true. Otherwise in
 * big endian format.
 * @param byteOffset {number} Offset in bytes.
 * @param value {number} Value to store.
 * @param littleEndian {boolean} Little endian or not.
 */
DataView.prototype.setUint8 = function (byteOffset, value) {
    this.buffer.__buffer__[this.byteOffset + byteOffset] = value & 0xff;
};
DataView.prototype.setInt8 = function (byteOffset, value) {
    this.setUint8(byteOffset, value);
};
DataView.prototype.setUint32 = function (byteOffset, value, littleEndian) {
    if (arguments.length < 3)
        littleEndian = false;
    if (littleEndian) {
        this.setUint8(byteOffset, value & 0xff);
        this.setUint8(byteOffset + 1, (value >> 8) & 0xff);
        this.setUint8(byteOffset + 2, (value >> 16) & 0xff);
        this.setUint8(byteOffset + 3, (value >> 24) & 0xff);
    } else {
        this.setUint8(byteOffset + 3, value & 0xff);
        this.setUint8(byteOffset + 2, (value >> 8) & 0xff);
        this.setUint8(byteOffset + 1, (value >> 16) & 0xff);
        this.setUint8(byteOffset, (value >> 24) & 0xff);
    }
};

/**
 * Gets Uint8, Int8, Uint16, and Uint32 value at offset |byteOffset| of bytes.
 * Loads it in little endian format if |littleEndian| is true. Otherwise in big
 * endian format.
 * @param byteOffset {number} Offset in bytes.
 * @param littleEndian {boolean} Little endian or not.
 * @return {number} Value.
 */
DataView.prototype.getUint8 = function (byteOffset) {
    return this.buffer.__buffer__[this.byteOffset + byteOffset];
};
DataView.prototype.getInt8 = function (byteOffset) {
    var value = this.getUint8(byteOffset);
    if (value < 0x80)
        return value;
    return value - 0x100;
};
DataView.prototype.getUint16 = function (byteOffset, littleEndian) {
    if (arguments.length < 2)
        littleEndian = false;
    var value = 0;
    if (littleEndian) {
        value = this.getUint8(byteOffset) |
                (this.getUint8(byteOffset + 1) << 8);
    } else {
        value = this.getUint8(byteOffset + 1) |
                (this.getUint8(byteOffset) << 8);
    }
    return value;
};
DataView.prototype.getUint32 = function (byteOffset, littleEndian) {
    if (arguments.length < 2)
        littleEndian = false;
    var value = 0;
    if (littleEndian) {
        value = this.getUint8(byteOffset) |
                (this.getUint8(byteOffset + 1) << 8) |
                (this.getUint8(byteOffset + 2) << 16) |
                (this.getUint8(byteOffset + 3) << 24);
    } else {
        value = this.getUint8(byteOffset + 3) |
            (this.getUint8(byteOffset + 2) << 8) |
            (this.getUint8(byteOffset + 1) << 16) |
            (this.getUint8(byteOffset) << 24);
    }
    return value >>> 0;
};

/**
 * Pseudo Uint32Array.
 * TODO: subarray().
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 * @constructor
 */
function Uint32Array () {
    var buffer = null;
    var byteOffset = 0;
    var length = 0;
    if ((typeof arguments[0]) == "number") {
        /**
         * constructor (length)
         * @param {number} length
         */
        length = arguments[0];
        buffer = new ArrayBuffer(length * 4);
    } else if (arguments[0].constructor.name == "Array") {
        /**
         * constructor (array)
         * @param {Array.<number>} array
         */
        length = ~~(arguments[0].length / 4);
        buffer = new ArrayBuffer(length * 4);
        for (var i = 0; i < length * 4; i++)
            buffer.__buffer__[i] = arguments[0][i] & 0xff;
    } else if (arguments[0].constructor.name == "ArrayBuffer") {
        /**
         * constructor (buffer, byteOffset, length)
         * @param {ArrayBuffer} buffer
         * @param {number} byteOffset
         * @param {number} length
         */
        buffer = arguments[0];
        length = ~~(buffer.byteLength / 4);
        if (arguments.length > 1) {
            byteOffset = arguments[1];
            length = ~~((buffer.byteLength - byteOffset) / 4);
            if (arguments.length > 2 && length > arguments[2])
                length = arguments[2];
        }
    } else {
        throw new Error('Uint32Array unsupported type ' +
                arguments[0].constructor.name)
    }
    Object.defineProperty(this, 'buffer', {
        value: buffer,
        enumerable: true
    });
    Object.defineProperty(this, 'byteOffset', {
        value: byteOffset,
        enumerable: true
    });
    Object.defineProperty(this, 'byteLength', {
        value: length * 4,
        enumerable: true
    });
    Object.defineProperty(this, 'length', {
        value: length,
        enumerable: true
    });
    Object.defineProperty(this, 'BYTES_PER_ELEMENT', {
        value: 4,
        enumerable: true
    });
    Object.defineProperty(this, '__view__', {
        value: new DataView(buffer, byteOffset, length)
    });
    var getter = function (index) {
        return this.__view__.getUint32(index, true);
    };
    var setter = function (index, value) {
        this.__view__.setUint32(index, value, true);
    };
    for (i = 0; i < length; ++i) {
        Object.defineProperty(this, i, {
            get: getter.bind(this, i * 4),
            set: setter.bind(this, i * 4)
        });
    }
}
exports.Uint32Array = Uint32Array;

/**
 * Pseudo Uint8Array.
 * TODO: subarray().
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 * @constructor
 */
function Uint8Array () {
    var buffer = null;
    var byteOffset = 0;
    var length = 0;
    var i;
    if ((typeof arguments[0]) == "number") {
        /**
         * constructor (length)
         * @param {number} length
         */
        length = arguments[0];
        buffer = new ArrayBuffer(length);
    } else if (arguments[0].constructor.name == "Array") {
        /**
         * constructor (array)
         * @param {Array.<number>} array
         */
        length = arguments[0].length;
        buffer = new ArrayBuffer(length);
        for (i = 0; i < length; i++)
            buffer.__buffer__[i] = arguments[0][i] & 0xff;
    } else if (arguments[0].constructor.name == "ArrayBuffer") {
        /**
         * constructor (buffer, byteOffset, length)
         * @param {ArrayBuffer} buffer
         * @param {number} byteOffset
         * @param {number} length
         */
        buffer = arguments[0];
        length = buffer.byteLength;
        if (arguments.length > 1) {
            byteOffset = arguments[1];
            length = buffer.byteLength;
            if (arguments.length > 2 && length > arguments[2])
                length = arguments[2];
        }
    } else if (arguments[0].constructor.name == "Buffer") {
        /**
         * constructor (buffer)
         * @param {Buffer} buffer
         */
        length = arguments[0].length;
        buffer = new ArrayBuffer(length);
        for (i = 0; i < length; i++)
            buffer.__buffer__[i] = arguments[0][i] & 0xff;
    } else {
        throw new Error('Uint8Array unsupported type ' +
            arguments[0].constructor.name)
    }
    Object.defineProperty(this, 'buffer', {
        value: buffer,
        enumerable: true
    });
    Object.defineProperty(this, 'byteOffset', {
        value: byteOffset,
        enumerable: true
    });
    Object.defineProperty(this, 'byteLength', {
        value: length,
        enumerable: true
    });
    Object.defineProperty(this, 'length', {
        value: length,
        enumerable: true
    });
    Object.defineProperty(this, 'BYTES_PER_ELEMENT', {
        value: 1,
        enumerable: true
    });
    Object.defineProperty(this, '__view__', {
        value: new DataView(buffer, byteOffset, length)
    });
    var getter = function (index) {
        return this.__view__.getUint8(index, true);
    };
    var setter = function (index, value) {
        this.__view__.setUint8(index, value, true);
    };
    for (i = 0; i < length; ++i) {
        Object.defineProperty(this, i, {
            get: getter.bind(this, i),
            set: setter.bind(this, i)
        });
    }
}
exports.Uint8Array = Uint8Array;
