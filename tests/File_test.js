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

assert.ok(Promise);
assert.ok(File);
console.log('[PASS] import test');

var file = new File();
assert.ok(file);
console.log('[PASS] constructor test');

var unexpectedCallback = function () {
    assert.ok(false, 'unexpected callback is invoked.');
};

var called = false;
var notSupportedCallback = function (e) {
    called = true;
    assert.ok(e);
    assert.ok(e.status, File.NOT_SUPPORTED);
};

file.read(0).then(unexpectedCallback, notSupportedCallback);
assert.ok(called);
console.log('[PASS] read test');

called = false;
file.write(new Uint8Array(0)).then(unexpectedCallback, notSupportedCallback);
assert.ok(called);
console.log('[PASS] write test');

called = false;
file.seek(0, File.SEEK_SET).then(unexpectedCallback, notSupportedCallback);
assert.ok(called);
console.log('[PASS] seek test');

assert.equal(0, file.position());
assert.equal(0, file.size());
console.log('[PASS] test to call other functions');

