#!env node
/**
 * Copyright (c) 2014, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */
 
assert = require('assert');
Unicode = require('./Unicode').Unicode;
TextModel = require('./TextModel').TextModel;
TextModelConvert = require('./TextModelConvert').TextModelConvert;
ScreenModel = require('./ScreenModel').ScreenModel;

assert.ok(ScreenModel);
console.log('[PASS] import test');

var text1 = new TextModel();
var screen1 = new ScreenModel(2, 2, text1.atLine(), 0);
assert.equal(screen1.getNextLine(), null);
assert.equal(screen1.getNextLinePosition(), 0);
assert.equal(screen1.getCharacterAt(0, 0), '');
assert.equal(screen1.getCharacterAt(0, 1), '');
assert.equal(screen1.getCharacterAt(0, 2), ''); // Can access for Kinsoku.
assert.throws(function(){screen1.getCharacterAt(0,3)}, RangeError);
assert.equal(screen1.getCharacterAt(1, 0), '');
assert.equal(screen1.getCharacterAt(1, 1), '');
assert.equal(screen1.getCharacterAt(1, 2), ''); // Can access for Kinsoku.
assert.throws(function(){screen1.getCharacterAt(1,3)}, RangeError);
assert.throws(function(){screen1.getCharacterAt(2,0)}, RangeError);
console.log('[PASS] constructor test');

// あい
// う
var text2 = new TextModelConvert.createFromString('あいう');
var screen2 = new ScreenModel(2, 2, text2.atLine(), 0);
assert.equal(screen2.getNextLine(), null);
assert.equal(screen2.getNextLinePosition(), 0);
assert.equal(screen2.getCharacterAt(0, 0), 'あ');
assert.equal(screen2.getCharacterAt(0, 1), 'い');
assert.equal(screen2.getCharacterAt(0, 2), ''); // Can access for Kinsoku.
assert.throws(function(){screen2.getCharacterAt(0,3)}, RangeError);
assert.equal(screen2.getCharacterAt(1, 0), 'う');
assert.equal(screen2.getCharacterAt(1, 1), '');
assert.equal(screen2.getCharacterAt(1, 2), ''); // Can access for Kinsoku.
assert.throws(function(){screen2.getCharacterAt(1,3)}, RangeError);
assert.throws(function(){screen2.getCharacterAt(2,0)}, RangeError);
console.log('[PASS] simple model load test');

// あ\n
// いう
// ----
// え
var text3 = new TextModelConvert.createFromString('あ\nいうえ');
var screen3 = new ScreenModel(2, 2, text3.atLine(), 0);
assert.equal(screen3.getNextLine(), text3.atLine(1));
assert.equal(screen3.getNextLinePosition(), 2);
assert.equal(screen3.getNextLine().at(screen3.getNextLinePosition()).character,
             'え');
assert.equal(screen3.getCharacterAt(0, 0), 'あ');
assert.equal(screen3.getCharacterAt(0, 1), '');
assert.equal(screen3.getCharacterAt(0, 2), ''); // Can access for Kinsoku.
assert.throws(function(){screen3.getCharacterAt(0,3)}, RangeError);
assert.equal(screen3.getCharacterAt(1, 0), 'い');
assert.equal(screen3.getCharacterAt(1, 1), 'う');
assert.equal(screen3.getCharacterAt(1, 2), ''); // Can access for Kinsoku.
assert.throws(function(){screen3.getCharacterAt(1,3)}, RangeError);
assert.throws(function(){screen3.getCharacterAt(2,0)}, RangeError);
console.log('[PASS] simple large model load test');

// あい、
var text4 = new TextModelConvert.createFromString('あい、');
var screen4 = new ScreenModel(2, 2, text4.atLine(), 0);
assert.equal(screen4.getNextLine(), null);
assert.equal(screen4.getNextLinePosition(), 0);
assert.equal(screen4.getCharacterAt(0, 0), 'あ');
assert.equal(screen4.getCharacterAt(0, 1), 'い');
assert.equal(screen4.getCharacterAt(0, 2), '、');
assert.throws(function(){screen4.getCharacterAt(0,3)}, RangeError);
assert.equal(screen4.getCharacterAt(1, 0), '');
assert.equal(screen4.getCharacterAt(1, 1), '');
assert.equal(screen4.getCharacterAt(1, 2), ''); // Can access for Kinsoku.
assert.throws(function(){screen4.getCharacterAt(1,3)}, RangeError);
assert.throws(function(){screen4.getCharacterAt(2,0)}, RangeError);
console.log('[PASS] dangling wrap test');

// う
// ひょ
var text5 = new TextModelConvert.createFromString('うひょ');
var screen5 = new ScreenModel(2, 2, text5.atLine(), 0);
assert.equal(screen5.getNextLine(), null);
assert.equal(screen5.getNextLinePosition(), 0);
assert.equal(screen5.getCharacterAt(0, 0), 'う');
assert.equal(screen5.getCharacterAt(0, 1), '');
assert.equal(screen5.getCharacterAt(0, 2), '');
assert.throws(function(){screen5.getCharacterAt(0,3)}, RangeError);
assert.equal(screen5.getCharacterAt(1, 0), 'ひ');
assert.equal(screen5.getCharacterAt(1, 1), 'ょ');
assert.equal(screen5.getCharacterAt(1, 2), ''); // Can access for Kinsoku.
assert.throws(function(){screen5.getCharacterAt(1,3)}, RangeError);
assert.throws(function(){screen5.getCharacterAt(2,0)}, RangeError);
console.log('[PASS] line start wrap test');

// ※
// 「あ
var text6 = new TextModelConvert.createFromString('※「あ');
var screen6 = new ScreenModel(2, 2, text6.atLine(), 0);
assert.equal(screen6.getNextLine(), null);
assert.equal(screen6.getNextLinePosition(), 0);
assert.equal(screen6.getCharacterAt(0, 0), '※');
assert.equal(screen6.getCharacterAt(0, 1), '');
assert.equal(screen6.getCharacterAt(0, 2), '');
assert.throws(function(){screen6.getCharacterAt(0,3)}, RangeError);
assert.equal(screen6.getCharacterAt(1, 0), '「');
assert.equal(screen6.getCharacterAt(1, 1), 'あ');
assert.equal(screen6.getCharacterAt(1, 2), ''); // Can access for Kinsoku.
assert.throws(function(){screen6.getCharacterAt(1,3)}, RangeError);
assert.throws(function(){screen6.getCharacterAt(2,0)}, RangeError);
console.log('[PASS] line end wrap test');