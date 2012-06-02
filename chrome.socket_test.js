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
    ArrayBuffer = require('./ArrayBuffer').ArrayBuffer;
    DataView = require('./ArrayBuffer').DataView;
    Uint8Array = require('./ArrayBuffer').Uint8Array;
    Uint32Array = require('./ArrayBuffer').Uint32Array;
}

socket = require('./chrome.socket').chrome.socket;
assert.ok(socket);
console.log('[PASS] import test');

socket.create("udp", {}, function(socketInfo) {
    console.log(socketInfo);
    console.log('[PASS] udp create callback');
    assert.ok(socketInfo.socketId);
    assert.ok(socketInfo.socketId > 0);
    console.log('[PASS] udp create socketInfo');
    var id = socketInfo.socketId;
    socket.create("udp", {}, function(socketInfo) {
        assert.ok(socketInfo.socketId != id);
        console.log('[PASS] udp create socketId');
        socket.destroy(socketInfo.socketId);
        console.log('[PASS] udp destroy');
    });
    socket.bind(id, "0.0.0.0", 0, function(result) {
        console.log('[PASS] udp bind');
        assert.equal(0, result);
        var data = new Uint8Array(4);
        data[0] = 'h'.charCodeAt(0);
        data[1] = 'e'.charCodeAt(0);
        data[2] = 'l'.charCodeAt(0);
        data[3] = 'o'.charCodeAt(0);
        socket.sendTo(id, data, "192.168.12.1", 7, function (writeInfo) {
            console.log('[PASS] udp sendTo');
            console.log(writeInfo);
            assert.ok(writeInfo);
            assert.equal(4, writeInfo.bytesWritten);
            socket.recvFrom(id, undefined, function (readInfo) {
                console.log('[PASS] udp recvFrom');
                console.log(readInfo);
                assert.ok(readInfo);
                assert.ok(readInfo.address);
                assert.equal("192.168.12.1", readInfo.address);
                assert.ok(readInfo.port);
                assert.equal(7, readInfo.port);
                assert.ok(readInfo.resultCode);
                assert.equal(4, readInfo.resultCode);
                assert.ok(readInfo.data);
                var data = new Uint8Array(readInfo.data);
                assert.equal('h'.charCodeAt(0), data[0]);
                assert.equal('e'.charCodeAt(0), data[1]);
                assert.equal('l'.charCodeAt(0), data[2]);
                assert.equal('o'.charCodeAt(0), data[3]);
                socket.destroy(id);
            });
        });
    });
});

console.log('[PASS] all test');
