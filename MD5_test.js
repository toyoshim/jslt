#!env node
/**
 * Copyright (c) 2012, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */

assert = require('assert');
MD5 = require('./MD5').MD5;

assert(MD5);
assert(MD5.createDigestBinary);
assert(MD5.createDigestString);
console.log('[PASS] import test');

var x = 0x01234567;
var y = 0x89abcdef;
var z = 0x77777777;
assert.equal(MD5._FUNCTION_F(x, y, z), 2004318071);
console.log('[PASS] function F');
assert.equal(MD5._FUNCTION_G(x, y, z), 2309737967);
console.log('[PASS] function G');
assert.equal(MD5._FUNCTION_H(x, y, z), 4294967295);
console.log('[PASS] function H');
assert.equal(MD5._FUNCTION_I(x, y, z), 0);
console.log('[PASS] function I');

var a = 0x12345678;
var b = 0xabcdefab;
var c = 0x87654321;
var d = 0xfedcba98;
var k = 0x33333333;
var s = 7;
var i = 0xdeadbeaf;
assert.equal(MD5._doRound(a, b, c, d, k, s, i, MD5._FUNCTION_F), 1629205928);
console.log('[PASS] internal calculation');

var md5 = new MD5();
md5.setInputData('hello');
var data = [];
for (i = 0; i < 16; ++i)
    data[i] = 0x11111111 * i;
md5.doRound1(data);
assert.equal(md5._a, 897665665);
assert.equal(md5._b, 2290347670);
assert.equal(md5._c, 2412986225);
assert.equal(md5._d, 575014553);
console.log('[PASS] round 1 calculation');

md5 = new MD5();
md5.setInputData('hello');
md5.doRound2(data);
assert.equal(md5._a, 217611664);
assert.equal(md5._b, 333425764);
assert.equal(md5._c, 896063437);
assert.equal(md5._d, 674583994);
console.log('[PASS] round 2 calculation');

md5 = new MD5();
md5.setInputData('hello');
md5.doRound3(data);
assert.equal(md5._a, 2876679726);
assert.equal(md5._b, 2228622847);
assert.equal(md5._c, 2616277241);
assert.equal(md5._d, 3963459981);
console.log('[PASS] round 3 calculation');

md5 = new MD5();
md5.setInputData('hello');
md5.doRound4(data);
assert.equal(md5._a, 4181518630);
assert.equal(md5._b, 4000144174);
assert.equal(md5._c, 2761065934);
assert.equal(md5._d, 1427065944);
console.log('[PASS] round 4 calculation');

var input = 'hello';
var expected = [
    '5d41402abc4b2a76b9719d911017c592',
    'de429a8a7a8405f289708f2257438cef',
    '0fcc2a8655e202e78eaaa11e290d10d2',
    'f9ae60e0bf8db68fbae94647ec1170b1',
    'd14c5fca5f92c885a604f450509c0b8b',
    '90663b4e10573ef138b84762bffc4042',
    'afb1233e36b56c814e33dfda65c94464',
    '05d21633141c030285109e97387de2cc',
    'f09c6af337cad37d4b9339306150419b',
    '183e25a6615ba97a86be17b2fba90c25',
    '8667c486c8302a349de6b8aa95d98457',
    '4071b64cb7eb2bc1b10dc6f97c0a7caf',
    '4494560e5bce40ade5bd28aedbaa32fa',
    '00e8c131229372414dde09fe4524617f',
    'f90d186b7d3e5c17862450fd79765f60',
    '477e32244ae1eb6f1507631916b8e438'
];

for (var n = 0; n < 16; ++n) {
    var result = MD5.createDigestString(input);
    assert.equal(result, expected[n]);
    console.log('[PASS] circular digest calculation test level ' + n);
    input = input + result;
}

console.log('Awesome! All your test are belong to us!!');
