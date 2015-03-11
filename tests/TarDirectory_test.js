#!env node
/**
 * Copyright (c) 2014, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */

assert = require('assert');
fs = require('fs');

Promise = require('../src/Promise').Promise;
File = require('../src/File').File;
ArrayBufferFile = require('../src/ArrayBufferFile').ArrayBufferFile;
Directory = require('../src/Directory').Directory;
TarDirectory = require('../src/TarDirectory').TarDirectory;

assert.ok(Promise);
assert.ok(File);
assert.ok(TarDirectory);
console.log('[PASS] import test');

var data = (function (buffer) {
    var data = new Uint8Array(buffer.length);
    for (var i = 0; i < buffer.length; ++i)
        data[i] = buffer[i];
    return data.buffer;
})(fs.readFileSync('data/test.tar'));
assert.ok(data);
console.log('[PASS] load test data');

var tar = new TarDirectory(data);
console.log('[PASS] tar file is parsed correctly');

var entries = tar.getEntries();
var expectedEntries = {
    foo: false,
    bar: true,
    test: false
};
var foundEntries = [];
var bar;
assert.equal(3, entries.length);
for (var i = 0; i < entries.length; ++i) {
    var name = entries[i].name();
    var expect = expectedEntries[name];
    assert.notEqual(undefined, expect);
    assert.equal(expect, entries[i].isDirectory());
    foundEntries.push(name);
    if (expect)
      bar = entries[i].directory().getEntries();
}
assert.equal(3, foundEntries.length);
assert.ok(bar);
var expectedBarEntries = {
    x: false,
    y: false,
    z: true
};
var foundBarEntries = [];
var z;
for (i = 0; i < bar.length; ++i) {
    name = bar[i].name();
    expect = expectedBarEntries[name];
    assert.notEqual(undefined, expect);
    assert.equal(expect, bar[i].isDirectory());
    foundBarEntries.push(name);
    if (expect)
      z = bar[i].directory().getEntries();
}
assert.equal(3, foundBarEntries.length);
assert.ok(z);
assert.equal(1, z.length);
assert.equal('1', z[0].name());
assert.ok(z[0].isFile());
console.log('[PASS] check expanded tar file contents');

var longdata = (function (buffer) {
    var data = new Uint8Array(buffer.length);
    for (var i = 0; i < buffer.length; ++i)
        data[i] = buffer[i];
    return data.buffer;
})(fs.readFileSync('data/long.tar'));
assert.ok(longdata);
console.log('[PASS] load test data for longname/longlink');

var longtar = new TarDirectory(longdata);
console.log('[PASS] long tar file is parsed correctly');

var longentries = longtar.getEntries();
assert.equal(1, longentries.length);
assert.equal('long', longentries[0].name());
assert.equal(true, longentries[0].isDirectory());

var longdirentries = longentries[0].directory().getEntries();
assert.equal('this-file-name-is-too-long-to-contain-it-in-traditional-' +
             'tar-format-that-can-contain-100-characters-for-filename',
             longdirentries[0].name());
assert.equal(false, longdirentries[0].isDirectory());
console.log('[PASS] check expanded long tar file contents');

var paxdata = (function (buffer) {
    var data = new Uint8Array(buffer.length);
    for (var i = 0; i < buffer.length; ++i)
        data[i] = buffer[i];
    return data.buffer;
})(fs.readFileSync('data/pax.tar'));
assert.ok(paxdata);
console.log('[PASS] load test data for global extended header');

var paxtar = new TarDirectory(paxdata);
console.log('[PASS] pax tar file is parsed correctly');
var paxentries = paxtar.getEntries();
assert.equal(1, paxentries.length);
assert.equal('with_global_extended_header', paxentries[0].name());
assert.equal(false, paxentries[0].isDirectory());

/*
var longdirentries = longentries[0].directory().getEntries();
assert.equal('this-file-name-is-too-long-to-contain-it-in-traditional-' +
             'tar-format-that-can-contain-100-characters-for-filename',
             longdirentries[0].name());
assert.equal(false, longdirentries[0].isDirectory());
console.log('[PASS] check expanded long tar file contents');
*/
