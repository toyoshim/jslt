#!env node
/**
 * Copyright (c) 2014, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */
 
assert = require('assert');
Unicode = require('../src/Unicode').Unicode;

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
var ab = Unicode.createUTF8ArrayBufferFromString(text);
var u8 = new Uint8Array(ab);
for (var i = 0; i < buffer.length; ++i)
    assert.equal(buffer[i], u8[i]);
assert.equal(Unicode.createStringFromUTF8ArrayBuffer(ab), text);
console.log('[PASS] UTF-8 to UTF-16 conversion');

var ascii = 'Hello Unicode!';
assert.equal(Unicode.countUTF8Length(ascii), ascii.length);
assert.equal(Unicode.countUTF8Length(text), buffer.length);
console.log('[PASS] count UTF-8 length');
