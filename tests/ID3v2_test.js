#!env node
/**
 * Copyright (c) 2015, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */

assert = require('assert');
fs = require('fs');

ID3v2 = require('../src/ID3v2').ID3v2;

assert.ok(ID3v2);
console.log('[PASS] import test');

var data = (function (buffer) {
    var data = new Uint8Array(buffer.length);
    for (var i = 0; i < buffer.length; ++i)
        data[i] = buffer[i];
    return data.buffer;
})(fs.readFileSync('data/test.id3'));
assert.ok(data);
console.log('[PASS] load test data');

var id3 = new ID3v2(data);
assert.ifError(id3.error());
assert.equal(id3.version(), '2.3.0');
console.log('[PASS] id3 file is parsed correctly');

assert.equal(id3.title(), 'Bustling time （とよしま）');
console.log('[PASS] id3 song title is parsed correctly');

assert.equal(id3.album(), 'KID\'s station - Close to Memories -');
console.log('[PASS] id3 album title is parsed correctly');

assert.equal(id3.artist(), 'とよしまハウス');
console.log('[PASS] id3 album artist is parsed correctly');
