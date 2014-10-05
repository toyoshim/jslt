#!env node
/**
 * Copyright (c) 2012, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */

assert = require('assert');
ArrayBuffer = require('../src/ArrayBuffer').ArrayBuffer;
DataView = require('../src/ArrayBuffer').DataView;
Uint8Array = require('../src/ArrayBuffer').Uint8Array;
Uint32Array = require('../src/ArrayBuffer').Uint32Array;

assert.ok(ArrayBuffer);
assert.ok(DataView);
console.log('[PASS] import test');

var ab = new ArrayBuffer(16);
assert.equal(ab.byteLength, 16);
console.log('[PASS] ArrayBuffer byteLength property');
ab.byteLength = 0;
assert.equal(ab.byteLength, 16);
console.log('[PASS] ArrayBuffer byteLength property is read only');
for (var i = 0; i < 16; i++)
    ab.__buffer__[i] = i;
var newab = ab.slice(0, 8);
assert.equal(newab.constructor.name, 'ArrayBuffer');
assert.equal(newab.byteLength, 8);
for (i = 0; i < 8; i++)
    assert.equal(ab.__buffer__[i], newab.__buffer__[i]);
console.log('[PASS] ArrayBuffer slice with two arguments');
newab = ab.slice(1);
assert.equal(newab.constructor.name, 'ArrayBuffer');
assert.equal(newab.byteLength, 15);
for (i = 0; i < 15; i++)
    assert.equal(ab.__buffer__[i + 1], newab.__buffer__[i]);
console.log('[PASS] ArrayBuffer slice with one argument');

var view = new DataView(ab, 1);
assert.equal(view.getUint8(7), 8);
assert.equal(view.getInt8(7), 8);
console.log('[PASS] DataView getUint8 from original value');
assert.ok(view.buffer);
assert.equal(view.byteOffset, 1);
assert.equal(view.byteLength, 15);
view.setUint8(0, 255);
view.setInt8(1, 1);
view.setInt8(2, -1);
assert.equal(view.getUint8(0), 255);
assert.equal(view.getUint8(1), 1);
assert.equal(view.getUint8(2), 255);
assert.equal(view.getInt8(0), -1);
assert.equal(view.getInt8(1), 1);
assert.equal(view.getInt8(2), -1);
console.log('[PASS] DataView set/get Int8/Uint8');
assert.equal(view.getUint32(3), 0x04050607);
view.setUint8(8, 0xde);
view.setUint8(9, 0xad);
view.setUint8(10, 0xbe);
view.setUint8(11, 0xaf);
assert.equal(view.getUint32(8), 0xdeadbeaf);
assert.equal(view.getUint32(8, true), 0xafbeadde);
view.setUint32(0, 0xdeadbeaf)
assert.equal(view.getUint32(8), 0xdeadbeaf);
view.setUint32(0, 0xdeadbeaf, true);
assert.equal(view.getUint32(8), 0xdeadbeaf, true);
console.log('[PASS] DataView set/get Uint32');

var u32a_n = new Uint32Array(16);
assert.ok(u32a_n.buffer);
assert.equal(u32a_n.byteOffset, 0);
assert.equal(u32a_n.byteLength, 64);
assert.equal(u32a_n.length, 16);
assert.equal(u32a_n.BYTES_PER_ELEMENT, 4);
for (i = 0; i < 16; ++i)
    assert.equal(u32a_n[i], 0);
console.log('[PASS] Uint32Array constructor with length');
var u32a_a = new Uint32Array([ 0, 1, 2, 3, 4, 5, 6, 7 ]);
assert.equal(u32a_a[0], 0x03020100);
assert.equal(u32a_a[1], 0x07060504);
console.log('[PASS] Uint32Array constructor with Array');
var u32a_ab = new Uint32Array(u32a_a.buffer);
assert.equal(u32a_ab[0], 0x03020100);
u32a_ab[1] = 0xdeadbeaf;
assert.equal(u32a_ab[1], 0xdeadbeaf);
console.log('[PASS] Uint32Array constructor with ArrayBuffer');
var u32a_ab2 = new Uint32Array(u32a_a.buffer, 4);
assert.equal(u32a_ab2[0], 0xdeadbeaf);
console.log('[PASS] Uint32Array constructor with ArrayBuffer and offset');
