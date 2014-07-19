/**
 * Copyright (c) 2012, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */
/**
 * Unicode conversion library.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 */
Unicode = {};
exports.Unicode = Unicode;

/**
 * Check if the specified code is BMP.
 * @param code {number} character code in UTF-16.
 * @return {boolean} true if the code is BMP.
 * @private
 */
Unicode._isBMP = function (code) {
    if ((code < 0) || (0x10000 <= code))
        return false;
    if (code < 0xd800)
        return true;
    if (code >= 0xe000)
        return true;
    return false;
};

/**
 * Check if the specified code is the first code of surrogate pair.
 * @param code {number} character code in UTF-16.
 * @return {boolean} true if the code is the first code of surrogate pair.
 * @private
 */
Unicode._isHighSurrogates = function (code) {
    if ((0xd800 <= code) && (code < 0xdc00))
        return true;
    return false;
};

/**
 * Check if the specified code is the second code of surroage pair.
 * @param code {number} character code in UTF-16.
 * @return {boolean} true if the code is the second code of surrogate pair.
 * @private
 */
Unicode._isLowSurrogates = function (code) {
    if ((0xdc00 <= code) && (code < 0xe000))
        return true;
    return false;
};

/**
 * Decode UTF-16 surrogate pair and return Unicode.
 * @param first {number} the first code of a pair.
 * @param second {number} the second code of a pair.
 * @return {number} Unicode.
 * @raise {RangeError} when the specified code pair is an invalid pair.
 * @private
 */
Unicode._decodeSurrogatePair = function (first, second) {
    if (!Unicode._isHighSurrogates(first) || !Unicode._isLowSurrogates(second))
        throw new RangeError('invalid surrogate pair (' + first + ', ' +
                second + ')');
    var w = (first >> 6) & 0xf;
    var u = w + 1;
    var x = ((first & 0x3f) << 10) | (second & 0x3ff);
    var i32 = (u << 16) + x;
    if (i32 < 0)
        return 0x100000000 + i32;
    return i32;
};

/**
 * Calculate code size in UTF-8.
 * @param code {number} A Unicode code.
 * @return {number} size in bytes.
 * @private
 */
Unicode._bytesInUTF8 = function (code) {
    if (code < 0)
        throw new RangeError('invalid Unicode: ' + code);
    if (code < 0x80)
        return 1;
    if (code < 0x800)
        return 2;
    if (code < 0x10000)
        return 3;
    if (code < 0x200000)
        return 4;
    if (code < 0x4000000)
        return 5;
    if (code < 0x80000000)
        return 6;
    throw new RangeError('invalid Unicode: ' + code)
};

/**
 * Count UTF-16 string length in UTF-8 bytes.
 * @param data {string} String object to count
 * @private
 */
Unicode._countString = function (data) {
    var length = 0;
    for (var i = 0; i < data.length; ++i) {
        var code = data.charCodeAt(i);
        if (!Unicode._isBMP(code)) {
            if (++i >= data.length)
                throw new RangeError('invalid surrogate pair: EOD');
            code = Unicode._decodeSurrogatePair(code, String.charCodeAt(i));
        }
        length += Unicode._bytesInUTF8(code);
    }
    return length;
};

/**
 * Set a Unicode code to Uint8Array in UTF-8.
 * @param array Uint8Array where store UTF-8 codes
 * @param offset offset in array where store UTF-8 codes
 * @param code code to be stored
 * @private
 */
Unicode._setUnicode = function (array, offset, code) {
    if (code < 0)
        throw new RangeError('invalid Unicode: ' + code);
    if (code < 0x80) {  // 7bit
        array[offset] = code;  // 7bit
        return 1;
    }
    if (code < 0x800) {  // 11bit
        array[offset + 0] = 0xc0 | (code >> 6);  // 5bit
        array[offset + 1] = 0x80 | (code & 0x3f);  // 6bit
        return 2;
    }
    if (code < 0x10000) {  // 16bit
        array[offset + 0] = 0xe0 | (code >> 12); // 4bit
        array[offset + 1] = 0x80 | ((code >> 6) & 0x3f);  // 6bit
        array[offset + 2] = 0x80 | (code & 0x3f);  // 6bit
        return 3;
    }
    if (code < 0x200000) {  // 21bit
        array[offset + 0] = 0xf0 | (code >> 18); // 3bit
        array[offset + 1] = 0x80 | ((code >> 12) & 0x3f); // 6bit
        array[offset + 2] = 0x80 | ((code >> 6) & 0x3f);  // 6bit
        array[offset + 3] = 0x80 | (code & 0x3f);  // 6bit
        return 4;
    }
    if (code < 0x4000000) {  // 26bit
        array[offset + 0] = 0xf8 | (code >> 24); // 2bit
        array[offset + 1] = 0x80 | ((code >> 18) & 0x3f); // 6bit
        array[offset + 2] = 0x80 | ((code >> 12) & 0x3f); // 6bit
        array[offset + 3] = 0x80 | ((code >> 6) & 0x3f);  // 6bit
        array[offset + 4] = 0x80 | (code & 0x3f);  // 6bit
        return 5;
    }
    if (code < 0x80000000) {  // 31bit
        array[offset + 0] = 0xfc | (code >> 30); // 1bit
        array[offset + 1] = 0x80 | ((code >> 24) & 0x3f); // 6bit
        array[offset + 2] = 0x80 | ((code >> 18) & 0x3f); // 6bit
        array[offset + 3] = 0x80 | ((code >> 12) & 0x3f); // 6bit
        array[offset + 4] = 0x80 | ((code >> 6) & 0x3f);  // 6bit
        array[offset + 5] = 0x80 | (code & 0x3f);  // 6bit
        return 6;
    }
    throw new RangeError('invalid Unicode: ' + code);
};

/**
 * Create an ArrayBuffer object in UTF-8 from a string.
 * @param {string} data to convert.
 * @return {ArrayBuffer} created object.
 */
Unicode.createUTF8ArrayBufferFromString = function (data) {
    var size = Unicode._countString(data);
    var array = new Uint8Array(size);
    var offset = 0;
    for (var i = 0; i < data.length; ++i) {
        var code = data.charCodeAt(i);
        if (!Unicode._isBMP(code)) {
            if (++i >= data.length)
                throw new RangeError('invalid surrogate pair: EOD');
            code = Unicode._decodeSurrogatePair(code, String.charCodeAt(i));
        }
        offset += Unicode._setUnicode(array, offset, code);
    }
    return array.buffer;
};

/** Create a String object (in UTF-16) from an ArrayBuffer object in UTF-8.
 * TODO: Accept ArrayBufferView to specify offset and size.
 * @param {ArrayBuffer} data to convert.
 * @return {string} created object.
 */
Unicode.createStringFromUTF8ArrayBuffer = function (data) {
    var u8view = new Uint8Array(data);
    var result = [];
    var first = true;
    var length = 1;
    var value = 0;
    for (var offset = 0; offset < u8view.length; offset++) {
        var c = u8view[offset];
        if (first) {
            if (0 == c)
                break;
            if (c < 0x80) {
                // 1 Byte UTF-8 string
                result.push(String.fromCharCode(c));
                continue;
            }
            first = false;
            if (c < 0xc2) {
                // Invalid character
                throw new TypeError('invalid UTF-8: ' + c);
            } else if (c < 0xe0) {
                // 2 Bytes UTF-8 string
                length = 2;
                value = c & 0x1f;
            } else if (c < 0xf0) {
                // 3 Bytes UTF-8 string
                length = 3;
                value = c & 0x0f;
            } else if (c < 0xf8) {
                // 4 Bytes UTF-8 string
                length = 4;
                value = c & 0x07;
            } else if (c < 0xfc) {
                // 5 Bytes UTF-8 string
                length = 5;
                value = c & 0x03;
            } else if (c < 0xfe) {
                // 6 Bytes UTF-8 string
                length = 6;
                value = c & 0x01;
            } else {
                // Invalid character
                throw new TypeError('invalid UTF-8: ' + c);
            }
            length--;
        } else {
            if ((c < 0x80) || (0xbf < c)) {
                // Invalid character
                throw new TypeError('invalid UTF-8: ' + c);
            }
            value = (value << 6) | (c & 0x3f);
            length--;
            if (0 == length) {
                first = true;
                if ((value < 0xd800) || (0xe000 <= value)) {
                    result.push(String.fromCharCode(value));
                } else {
                    var u = (value >> 16) & 0x1f;
                    var w = u - 1;
                    var x = value & 0xffff;
                    result.push(String.fromCharCode(
                            0xd800 + (w << 6) + (x >> 10)));
                    result.push(String.fromCharCode(0xdc00 + (x & 0x3ff)));
                }
            }
        }
    }
    if(!first)
        throw new TypeError('invalid UTF-8: EOD');
    return result.join('');
};
