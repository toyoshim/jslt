#!env node
/**
 * Copyright (c) 2014, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */
 
assert = require('assert');
TextModel = require('./TextModel').TextModel;
Unicode = require('./Unicode').Unicode;
TextModelConvert = require('./TextModelConvert').TextModelConvert;
 
assert.ok(TextModelConvert);
console.log('[PASS] import test');

var model1 = TextModelConvert.createFromString('@');
assert.ok(model1);
assert.equal(model1.getLineLength(), 1);
assert.equal(model1.getRowLength(), 1);
assert.equal(model1.at(), '@');
console.log('[PASS] convert from simple string');

var neko = '🐱'
assert.equal(neko.length, 2);  // It's surrogate pair in UTF-16.
var model2 = TextModelConvert.createFromString(neko);
assert.ok(model2);
// It should be handled as a single unicode character in TextModel.
assert.equal(model2.getLineLength(), 1);
assert.equal(model2.getRowLength(), 1);
assert.equal(model2.at(), neko);
console.log('[PASS] convert from simple surrogate string');

var hello ='こんにちは\n🐱\n世界';
var model3 = TextModelConvert.createFromString(hello);
assert.ok(model3);
assert.equal(model3.getLineLength(), 3);
assert.equal(model3.getRowLength(), 2);  // 世界
assert.equal(model3.at(), '界');
model3.atLine(0);
assert.equal(model3.getRowLength(), 5);  // こんにちは
model3.atLine(1);
assert.equal(model3.getRowLength(), 1);  // 🐱
model3.atLine(2);
assert.equal(model3.getRowLength(), 2);  // 世界
assert.equal(model3.at(0, 0), 'こ');
assert.equal(model3.at(0, 1), 'ん');
assert.equal(model3.at(0, 2), 'に');
assert.equal(model3.at(0, 3), 'ち');
assert.equal(model3.at(0, 4), 'は');
assert.equal(model3.at(1, 0), '🐱');
assert.equal(model3.at(2, 0), '世');
assert.equal(model3.at(2, 1), '界');
assert.equal(TextModelConvert.createString(model3), hello);
console.log('[PASS] convert from multi line string');