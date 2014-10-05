#!env node
/**
 * Copyright (c) 2014, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */

assert = require('assert');
Promise = require('../src/Promise').Promise;

assert.ok(Promise);
console.log('[PASS] import test');

var resolverCalled = false;
var resolverSuccess = null;
var resolverError = null;
var successMessage = 'success test';
var promise = new Promise(function (success, error) {
    resolverCalled = true;
    resolverSuccess = success;
    resolverError = error;
    success(successMessage);
});

assert.ok(promise);
assert.equal(resolverCalled, true);
assert.notEqual(resolverSuccess, null);
assert.notEqual(resolverError, null);
console.log('[PASS] constructor test');

var resolved = false;
promise.then(function (result) {
    resolved = true;
    assert.equal(result, successMessage);
}, function (error) {
    assert.ok(false, 'Error callback is called unexpectedly.');
});
assert.ok(resolved);
console.log('[PASS] then success test');

resolved = false;
var errorMessage = 'error test';
new Promise(function (success, error) {
  error(errorMessage);
}).then(function (result) {
    assert.ok(false, 'Success callback is called unexpectedly.');
}, function (error) {
    resolved = true;
    assert.equal(error, errorMessage);
});
assert.ok(resolved);
console.log('[PASS] then error test');

var p1 = new Promise(function (success, error) {
  success('p1');
});
var p2 = new Promise(function (success, error) {
  success('p2');
});
resolved = false;
Promise.all([p1, p2]).then(function (results) {
    resolved = true;
    assert.equal(results[0], 'p1');
    assert.equal(results[1], 'p2');
}, function (error) {
    assert.ok(false, 'Error callback is called unexpectedly.');
});
assert.ok(resolved);
console.log('[PASS] Promise.all success test');

var p3 = new Promise(function (success, error) {
  success('p3');
});
var p4 = new Promise(function (success, error) {
  error('p4');
});
resolved = false;
Promise.all([p3, p4]).then(function (results) {
    assert.ok(false, 'Success callback is called unexpectedly.');
}, function (error) {
    resolved = true;
});
assert.ok(resolved);
console.log('[PASS] Promise.all error test');
