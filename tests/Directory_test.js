#!env node
/**
 * Copyright (c) 2014, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */

assert = require('assert');
Directory = require('../src/Directory').Directory;

assert.ok(Directory);
console.log('[PASS] import test');

var dir = new Directory();
assert.ok(dir);
var entries = dir.getEntries();
assert.ok(entries);
assert.equal(0, entries.length);
assert.equal(undefined, dir.find('not found'));
console.log('[PASS] Directory constructor test');

var entry = new Directory.Entry('foo', false, 'dummy');
assert.ok(entry);
assert.equal('foo', entry.name());
assert.ok(entry.isFile());
assert.ok(!entry.isDirectory());
assert.equal(null, entry.directory());
var dummy = entry.file();
assert.ok(dummy);
assert.equal(dummy, 'dummy');
console.log('[PASS] Directory.Entry constructor test');

dir.append(entry);
entries = dir.getEntries();
assert.ok(entries);
assert.equal(1, entries.length);
assert.equal(entries[0], entry);

var found = dir.find('foo');
assert.ok(found);
assert.equal(found, entry);
console.log('[PASS] append and find an entry');
