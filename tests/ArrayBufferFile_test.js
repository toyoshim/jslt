#!env node
/**
 * Copyright (c) 2014, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */

assert = require('assert');
Promise = require('../src/Promise').Promise;
File = require('../src/File').File;
ArrayBufferFile = require('../src/ArrayBufferFile').ArrayBufferFile;

assert.ok(Promise);
assert.ok(File);
assert.ok(ArrayBufferFile);
console.log('[PASS] import test');

var data = new Uint8Array(16);
assert.equal(16, data.byteLength);
for (var i = 0; i < 16; ++i)
    data[i] = i;
var file = new ArrayBufferFile(data.buffer);
assert.ok(file);
console.log('[PASS] constructor test');

assert.equal(0, file.position());
assert.equal(16, file.size());
console.log('[PASS] check file initial status');

var unexpectedCallback = function () {
    assert.ok(false, 'unexpected callback is invoked.');
};

var promise = file.read(4);
var invoked = false;
assert.ok(promise);
promise.then(function (result) {
    invoked = true;
    assert.ok(result);
    assert.ok(result.size);
    assert.ok(result.buffer);
    assert.equal(4, result.size);
    assert.equal(0, result.buffer[0]);
    assert.equal(1, result.buffer[1]);
    assert.equal(2, result.buffer[2]);
    assert.equal(3, result.buffer[3]);
}, unexpectedCallback);
assert.ok(invoked);
assert.equal(4, file.position());
console.log('[PASS] read without buffer');

invoked = false;
var readBuffer = new Uint8Array(4);
file.read(4, readBuffer).then(function (result) {
    invoked = true;
    assert.ok(result);
    assert.ok(result.size);
    assert.ok(result.buffer);
    assert.equal(4, result.size);
    assert.equal(readBuffer, result.buffer);
    assert.equal(4, result.buffer[0]);
    assert.equal(5, result.buffer[1]);
    assert.equal(6, result.buffer[2]);
    assert.equal(7, result.buffer[3]);

}, unexpectedCallback);
assert.ok(invoked);
assert.equal(8, file.position());
console.log('[PASS] read with buffer');

invoked = false;
file.read(16).then(function (result) {
    invoked = true;
    assert.ok(result);
    assert.ok(result.size);
    assert.ok(result.buffer);
    assert.equal(8, result.size);
    assert.equal(8, result.buffer[0]);
    assert.equal(15, result.buffer[7]);
}, unexpectedCallback);
assert.ok(invoked);
assert.equal(16, file.position());
console.log('[PASS] read with size over EOF');

invoked = false;
file.read(1).then(function (result) {
    invoked = true;
    assert.ok(result);
    assert.equal(0, result.size);
}, unexpectedCallback);
assert.ok(invoked);
assert.equal(16, file.position());
console.log('[PASS] read at EOF');

invoked = false;
file.seek(-4, File.CUR).then(function () {
    invoked = true;
}, unexpectedCallback);
assert.ok(invoked);
assert.equal(12, file.position());
file.seek(-1, File.SET).then(unexpectedCallback, function (e) {
    assert.ok(e);
    assert.equal(File.OUT_OF_RANGE, e.status);
});
file.seek(-1, -1).then(unexpectedCallback, function (e) {
    assert.ok(e);
    assert.equal(File.INVALID, e.status);
});
file.seek(-8, File.END).then(function () {}, unexpectedCallback);
assert.equal(8, file.position());
file.seek(8, File.SET).then(function () {}, unexpectedCallback);
assert.equal(8, file.position());
console.log('[PASS] seek test');

invoked = false;
file.write(new Uint8Array([5, 7, 3])).then(function () {
    invoked = true;
}, unexpectedCallback);
assert.ok(invoked);
assert.equal(5, data[8]);
assert.equal(7, data[9]);
assert.equal(3, data[10]);

invoked = false;
file.write(new Uint8Array(16)).then(unexpectedCallback, function (e) {
    invoked = true;
    assert.ok(e);
    assert.ok(e.status);
    assert.equal(File.STORAGE_FULL, e.status);
});
assert.ok(invoked);
console.log('[PASS] write test');
