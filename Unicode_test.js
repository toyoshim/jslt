#!env node
/**
 * Copyright (c) 2014, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */
 
assert = require('assert');
Unicode = require('./Unicode').Unicode;

assert.ok(Unicode);
console.log('[PASS] import test');

var neko = '🐱';
assert.ok(!Unicode.isHighSurrogates(0));
assert.ok(!Unicode.isHighSurrogates(0xd7ff));
assert.ok(Unicode.isHighSurrogates(0xd800));
assert.ok(Unicode.isHighSurrogates(0xdbff));
assert.ok(!Unicode.isHighSurrogates(0xdc00));
assert.ok(!Unicode.isHighSurrogates(0xffff));
assert.ok(Unicode.isHighSurrogates(neko.charCodeAt(0)));
assert.ok(!Unicode.isLowSurrogates(0));
assert.ok(!Unicode.isLowSurrogates(0xdbff));
assert.ok(Unicode.isLowSurrogates(0xdc00));
assert.ok(Unicode.isLowSurrogates(0xdfff));
assert.ok(!Unicode.isLowSurrogates(0xe000));
assert.ok(Unicode.isLowSurrogates(neko.charCodeAt(1)));
console.log('[PASS] surrogate pair tests');

var text = 'こんにちは🐱\n世界は丸い';
var buffer = new Buffer(text, 'utf8');
var ab = new ArrayBuffer(buffer.length);
var u8 = new Uint8Array(ab);
for (var i = 0; i < buffer.length; ++i)
    u8[i] = buffer[i];
assert.equal(Unicode.createStringFromUTF8ArrayBuffer(ab), text);
console.log('[PASS] UTF8 to UTF16 conversion');