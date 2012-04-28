/**
 * Copyright (c) 2012, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */
/**
 * MD5 hash calculator.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 * @constructor
 */
function MD5 () {
    this.inputSize = 0; // @type {number}
    this.inputData = null;  // @type {DataView}
    this.md5binary = null;  // @type {ArrayBuffer}
    this.md5string = null;  // @type {string}
    this._a = 0;  // @type {number}
    this._b = 0;  // @type {number}
    this._c = 0;  // @type {number}
    this._d = 0;  // @type {number}
}
exports.MD5 = MD5;
/**
 * @type {number} Constant variables to calculate MD5.
 * @const
 * @private
 */
MD5._WORD_A = 0x67452301;
MD5._WORD_B = 0xefcdab89;
MD5._WORD_C = 0x98badcfe;
MD5._WORD_D = 0x10325476;
/**
 * @type {Array.<string>} Constant array to convert number to hex.
 * @const
 * @private
 */
MD5._HEX_CHAR = [
    '0', '1', '2', '3', '4', '5', '6', '7',
    '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'
];

/**
 * Utility functions to calculate MD5.
 * @param {number} x Input value 1.
 * @param {number} y Input value 2.
 * @param {number} z Input value 3.
 * @return {number} Output data.
 * @private
 */
MD5._FUNCTION_F = function (x, y, z) { return ((x & y) | (~x & z)) >>> 0; };
MD5._FUNCTION_G = function (x, y, z) { return ((x & z) | (y & ~z)) >>> 0; };
MD5._FUNCTION_H = function (x, y, z) { return (x ^ y ^ z) >>> 0; };
MD5._FUNCTION_I = function (x, y, z) { return (y ^ (x | ~z)) >>> 0; };

/**
 * Do internal calculation.
 * @private
 */
MD5._doRound = function (a, b, c, d, k, s, i, f) {
    // '>>> 0' converts a number to one interpreted as a uint32.
    var x = (a + f(b, c, d) + k + i) >>> 0;
    var l = (x << s) >>> 0;
    var r = x >>> (32 - s);
    return (b + l + r) >>> 0;
};

/**
 * Calculates MD5 and returns it.
 * @param {ArrayBuffer|string} data Input data.
 * @return {ArrayBuffer} MD5.
 */
MD5.createDigestBinary = function (data) {
    var md5 = new MD5();
    md5.setInputData(data);
    return md5.getDigestBinary();
};

/**
 * Calculates MD5 and returns it.
 * @param {ArrayBuffer|string} data Input data.
 * @return {string} MD5 in length 32 string.
 */
MD5.createDigestString = function (data) {
    var md5 = new MD5();
    md5.setInputData(data);
    return md5.getDigestString();
};

/**
 * Sets input data to calculate MD5.
 * @param {ArrayBuffer|string} data Input data.
 */
MD5.prototype.setInputData = function (data) {
    var view;
    if (typeof data == "string") {
        // Convert string to ArrayBuffer.
        var array = new ArrayBuffer(data.length);
        view = new DataView(array);
        for (var i = 0; i < data.length; ++i)
            view.setUint8(i, data.charCodeAt(i) & 0xff);
    } else {
        view = new DataView(data);
    }

    var paddingSize = (56 - (view.byteLength % 64)) % 64;
    this.inputSize = view.byteLength + paddingSize + 8;
    this.inputData = new DataView(new ArrayBuffer(this.inputSize));
    for (i = 0; i < view.byteLength; ++i)
        this.inputData.setUint8(i, view.getUint8(i));
    var sizeOffset = view.byteLength + paddingSize;
    for (this.inputData.setUint8(i++, 0x80); i < sizeOffset; ++i)
        this.inputData.setUint8(i, 0);
    // MD5 originally supports 60-bits length input data, but here we support
    // just 28-bits length input data.
    var sizeX8 = (view.byteLength << 3) >>> 0;
    this.inputData.setUint32(sizeOffset, sizeX8, true);
    this._a = MD5._WORD_A;
    this._b = MD5._WORD_B;
    this._c = MD5._WORD_C;
    this._d = MD5._WORD_D;
    this.md5binary = null;
    this.md5string = null;
};

/**
 * Calculates MD5 for the stored data.
 * @return {ArrayBuffer} MD5.
 */
MD5.prototype.getDigestBinary = function () {
    if (null == this.inputData)
        return null;
    if (null == this.md5binary)
        this.createDigest();
    return this.md5binary.slice(0);
};

/**
 * Calculates MD5 for the stored data and converts it to a string.
 * @return {string} MD5.
 */
MD5.prototype.getDigestString = function () {
    if (null == this.inputData)
        return null;
    if (null == this.md5string) {
        if (null == this.md5binary)
            this.createDigest();
        var array = [];
        var view = new Uint8Array(this.md5binary);
        for (var i = 0; i < 16; ++i) {
            var u8 = view[i];
            array.push(MD5._HEX_CHAR[u8 >> 4]);
            array.push(MD5._HEX_CHAR[u8 & 0xf]);
        }
        this.md5string = array.join('');
    }
    return this.md5string;
};

/**
 * Calculate MD5 internally.
 */
MD5.prototype.createDigest = function () {
    var view = new Uint32Array(this.inputData.buffer);
    for (var i = 0; i < view.length; i += 16) {
        var a = this._a;
        var b = this._b;
        var c = this._c;
        var d = this._d;
        var data = [];
        for (var j = 0; j < 16; ++j)
            data[j] = view[i + j];
        this.doRound1(data);
        this.doRound2(data);
        this.doRound3(data);
        this.doRound4(data);
        // '>>> 0' converts a number to one of modulo 0x100000000.
        this._a = (this._a + a) >>> 0;
        this._b = (this._b + b) >>> 0;
        this._c = (this._c + c) >>> 0;
        this._d = (this._d + d) >>> 0;
    }
    this.md5binary = new ArrayBuffer(16);
    var md5view = new Uint32Array(this.md5binary);
    md5view[0] = this._a;
    md5view[1] = this._b;
    md5view[2] = this._c;
    md5view[3] = this._d;
};

/**
 * Perform round 1 calculation.
 * @param data {Array.<number>} calculation targets
 */
MD5.prototype.doRound1 = function (data) {
    var a = this._a;
    var b = this._b;
    var c = this._c;
    var d = this._d;
    var S1 = [  7, 12, 17, 22 ];
    var key = [
        0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
        0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
        0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
        0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821
    ];
    var f = MD5._FUNCTION_F;
    for (var i = 0; i < 16; i += 4) {
        a = MD5._doRound(a, b, c, d, data[i + 0], S1[0], key[i + 0], f);
        d = MD5._doRound(d, a, b, c, data[i + 1], S1[1], key[i + 1], f);
        c = MD5._doRound(c, d, a, b, data[i + 2], S1[2], key[i + 2], f);
        b = MD5._doRound(b, c, d, a, data[i + 3], S1[3], key[i + 3], f);
    }
    this._a = a;
    this._b = b;
    this._c = c;
    this._d = d;
};

/**
 * Perform round 2 calculation.
 * @param data {Array.<number>} calculation targets
 */
MD5.prototype.doRound2 = function (data) {
    var a = this._a;
    var b = this._b;
    var c = this._c;
    var d = this._d;
    var S2 = [  5,  9, 14, 20 ];
    var key = [
        0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
        0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
        0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
        0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a
    ];
    var index = [
        1,  6, 11,  0,  5, 10, 15,  4,  9, 14,  3,  8, 13,  2,  7, 12 ];
    var f = MD5._FUNCTION_G;
    for (var i = 0; i < 16; i += 4) {
        a = MD5._doRound(a, b, c, d, data[index[i + 0]], S2[0], key[i + 0], f);
        d = MD5._doRound(d, a, b, c, data[index[i + 1]], S2[1], key[i + 1], f);
        c = MD5._doRound(c, d, a, b, data[index[i + 2]], S2[2], key[i + 2], f);
        b = MD5._doRound(b, c, d, a, data[index[i + 3]], S2[3], key[i + 3], f);
    }
    this._a = a;
    this._b = b;
    this._c = c;
    this._d = d;
};

/**
 * Perform round 3 calculation.
 * @param data {Array.<number>} calculation targets
 */
MD5.prototype.doRound3 = function (data) {
    var a = this._a;
    var b = this._b;
    var c = this._c;
    var d = this._d;
    var S3 = [  4, 11, 16, 23 ];
    var key = [
        0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
        0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
        0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
        0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665
    ];
    var index = [
        5,  8, 11, 14,  1,  4,  7, 10, 13,  0,  3,  6,  9, 12, 15,  2 ];
    var f = MD5._FUNCTION_H;
    for (var i = 0; i < 16; i += 4) {
        a = MD5._doRound(a, b, c, d, data[index[i + 0]], S3[0], key[i + 0], f);
        d = MD5._doRound(d, a, b, c, data[index[i + 1]], S3[1], key[i + 1], f);
        c = MD5._doRound(c, d, a, b, data[index[i + 2]], S3[2], key[i + 2], f);
        b = MD5._doRound(b, c, d, a, data[index[i + 3]], S3[3], key[i + 3], f);
    }
    this._a = a;
    this._b = b;
    this._c = c;
    this._d = d;
};

/**
 * Perform round 4 calculation.
 * @param data {Array.<number>} calculation targets
 */
MD5.prototype.doRound4 = function (data) {
    var a = this._a;
    var b = this._b;
    var c = this._c;
    var d = this._d;
    var S4 = [  6, 10, 15, 21 ];
    var key = [
        0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
        0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
        0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
        0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
    ];
    var index = [
        0,  7, 14,  5, 12,  3, 10,  1,  8, 15,  6, 13,  4, 11,  2,  9 ];
    var f = MD5._FUNCTION_I;
    for (var i = 0; i < 16; i += 4) {
        a = MD5._doRound(a, b, c, d, data[index[i + 0]], S4[0], key[i + 0], f);
        d = MD5._doRound(d, a, b, c, data[index[i + 1]], S4[1], key[i + 1], f);
        c = MD5._doRound(c, d, a, b, data[index[i + 2]], S4[2], key[i + 2], f);
        b = MD5._doRound(b, c, d, a, data[index[i + 3]], S4[3], key[i + 3], f);
    }
    this._a = a;
    this._b = b;
    this._c = c;
    this._d = d;
};
