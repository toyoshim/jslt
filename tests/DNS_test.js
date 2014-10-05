#!env node
/**
 * Copyright (c) 2012, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */

assert = require('assert');

var version = process.versions.node.split('.');
if ((version[0] < 1) &&
    ((version[1] < 5) || ((version[1] == 5) && version[2] < 5))) {
    // version < 0.5.5
    console.log('Use compatible ArrayBuffer library');
    ArrayBuffer = require('../src/ArrayBuffer').ArrayBuffer;
    DataView = require('../src/ArrayBuffer').DataView;
    Uint8Array = require('../src/ArrayBuffer').Uint8Array;
    Uint32Array = require('../src/ArrayBuffer').Uint32Array;
}

chrome = require('../src/chrome.socket').chrome;

DNS = require('../src/DNS').DNS;
assert.ok(DNS);
console.log('[PASS] import test');

var dns = new DNS();
dns.resolve('www.google.com', function (result) {
    console.log('[PASS] DNS resolve callback');
    assert.equal('www.google.com', result.query);
    assert.equal(true, result.success);
    assert.ok(result.records.length > 0);
    console.log('[PASS] DNS resolve returns records');
    dns.resolveA('www.google.com', function (result) {
        console.log('[PASS] DNS resolveA callback');
        console.log(result);
        assert.ok(result.length > 0);
        dns.destroy();
        dns = null;
        console.log('[PASS] all test');
    });
});
