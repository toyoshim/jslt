#!env node
/**
 * Copyright (c) 2014, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */
 
assert = require('assert');
TextModel = require('./TextModel').TextModel;
 
assert.ok(TextModel);
assert.ok(TextModel.Cell);
assert.ok(TextModel.List);
console.log('[PASS] import test');

var cell = [];
cell[0] = new TextModel.Cell('a');
assert.equal(cell[0].character, 'a');
assert.equal(cell[0].previous, undefined);
assert.equal(cell[0].next, undefined);
console.log('[PASS] Cell constructor test');

cell[1] = new TextModel.Cell('b');
cell[0].insertNext(cell[1]);
assert.equal(cell[0].next, cell[1]);
assert.equal(cell[1].previous, cell[0]);
console.log('[PASS] Cell set next test');

cell[2] = new TextModel.Cell('x');
cell[0].insertPrevious(cell[2]);
assert.equal(cell[0].previous, cell[2]);
assert.equal(cell[2].next, cell[0]);
console.log('[PASS] Cell set previous test');

// [2](x) <-> [0](a) <-> [1](b)
cell[3] = new TextModel.Cell('0');
cell[0].insertNext(cell[3]);
assert.equal(cell[0].next, cell[3]);
assert.equal(cell[3].next, cell[1]);
assert.equal(cell[1].previous, cell[3]);
assert.equal(cell[3].previous, cell[0]);
console.log('[PASS] Cell insert next test');

var list = new TextModel.List();
assert.equal(list.getLength(), 0);
assert.equal(list.getPosition(), -1);
assert.throws(function(){list.at(0)}, RangeError);
assert.throws(function(){list.at(-1)}, RangeError);
console.log('[PASS] List constructor test');

list.insert(new TextModel.Cell('1'));
assert.equal(list.getLength(), 1);
assert.equal(list.getPosition(), 0);
assert.equal(list.at(0).character, '1');
assert.equal(list.getPosition(), 0);
assert.throws(function(){list.at(1)}, RangeError);
console.log('[PASS] List insert the first item');

list.insert(new TextModel.Cell('3'));
assert.equal(list.getLength(), 2);
assert.equal(list.getPosition(), 1);
assert.equal(list.at(0).character, '1');
assert.equal(list.getPosition(), 0);
assert.equal(list.at(1).character, '3');
assert.equal(list.getPosition(), 1);
assert.throws(function(){list.at(2)}, RangeError);
console.log('[PASS] List append the second item');

list.at(0);
assert.equal(list.getPosition(), 0);
list.insert(new TextModel.Cell('2'));
assert.equal(list.getLength(), 3);
assert.equal(list.getPosition(), 1);
assert.equal(list.at(0).character, '1');
assert.equal(list.getPosition(), 0);
assert.equal(list.at().character, '1');
assert.equal(list.at(1).character, '2');
assert.equal(list.getPosition(), 1);
assert.equal(list.at().character, '2');
assert.equal(list.at(2).character, '3');
assert.equal(list.getPosition(), 2);
assert.equal(list.at().character, '3');
assert.throws(function(){list.at(3)}, RangeError);
console.log('[PASS] List insert the third item');

var text = new TextModel();
assert.equal(text.getLineLength(), 0);
assert.equal(text.getLinePosition(), -1);
assert.throws(function(){text.getRowLength()}, RangeError);
assert.throws(function(){text.getRowPosition()}, RangeError);
assert.throws(function(){text.atLine()}, RangeError)
assert.throws(function(){text.atRow()}, RangeError)
assert.throws(function(){text.at()}, RangeError)
console.log('[PASS] TextModel constructor test');

text.insert('A');
assert.equal(text.getLineLength(), 1);
assert.equal(text.getLinePosition(), 0);
assert.throws(function(){text.atLine(1)}, RangeError)
assert.equal(text.getRowLength(), 1);
assert.equal(text.getRowPosition(), 0);
assert.equal(text.at(), 'A');
var line = text.atLine(0);
assert.equal(text.atLine(), line);
assert.equal(line.getLength(), 1);
assert.equal(line.getPosition(), 0);
assert.equal(line.at().character, 'A');
console.log('[PASS] TextModel insert test');

text.breakLine();
assert.equal(text.getLineLength(), 2);
assert.equal(text.getLinePosition(), 1);
assert.throws(function(){text.atLine(2)}, RangeError)
assert.equal(text.getRowLength(), 0);
assert.equal(text.getRowPosition(), -1);
assert.throws(function(){text.at()}, RangeError)
console.log('[PASS] TextModel line break test');
