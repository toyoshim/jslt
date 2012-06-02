/**
 * Copyright (c) 2012, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */
/**
 * Pseudo chrome.socket.
 * TODO: Support TCP functions, connect, read and write.
 * TODO: Support setKeepAlive and setNoDelay.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 */
if (typeof chrome === "undefined")
    chrome = {};
chrome.socket = {};
if (typeof exports.chrome === "undefined")
    exports.chrome = {};
exports.chrome.socket = chrome.socket;

chrome.socket._id = {
    map: [],
    messages: [],
    callback: [],
    next: 1
};

chrome.socket._dgram = require("dgram");

/**
 * Creates a socket of the specified type that will connect to the specified
 * remote machine.
 * @param type {string} The type of socket to create. Must be "tcp" or "udp".
 * @param options {CreateOptions} The socket options.
 * @param callback {function(CreateInfo)} Called when the socket has been
 *         created.
 */
chrome.socket.create = function (type, options, callback) {
    if (type == 'udp') {
        var id = chrome.socket._id.next++;
        chrome.socket._id.map[id] = chrome.socket._dgram.createSocket("udp4");
        chrome.socket._id.messages[id] = [];
        chrome.socket._id.callback[id] = null;
        callback({ socketId: id });
    } else if (type == 'tcp') {
        // TODO: Support TCP interfaces.
    } else {
        throw new Error('Invalid value for argument 1. Value must be one of' +
                ': [tcp, udp].');
    }
};

/**
 * Destroys the socket. Each socket created should be destroyed after use.
 * @param socketId {Number} The socketId.
 */
chrome.socket.destroy = function (socketId) {
    if (!chrome.socket._id.map[socketId])
        throw new Error('Socket not found');
    chrome.socket._id.map[socketId].close();
    chrome.socket._id.map[socketId] = null;
    chrome.socket._id.messages[socketId] = null;
    chrome.socket._id.callback[socketId] = null;
};

/**
 * Binds the local address for UDP socket. Currently, it does not support TCP
 * socket.
 * @param socketId {Number} The socketId.
 * @param address {String} The address of the local machine ("0.0.0.0").
 * @param port {Number} The port of the local machine (0).
 * @param callback {function(Number)} Called when the bind attempt is complete.
 */
chrome.socket.bind = function (socketId, address, port, callback) {
    if (!chrome.socket._id.map[socketId])
        throw new Error('Socket not found');
    try {
        chrome.socket._id.map[socketId].on("message", function (msg, rinfo) {
            chrome.socket._id.messages[socketId].push([msg, rinfo]);
            chrome.socket._recvFrom(socketId);
        });
        chrome.socket._id.map[socketId].bind(port, address);
        callback(0);
    } catch (e) {
        // TODO: Should set right code.
        console.log(e);
        callback(-1);
    }
};

chrome.socket._recvFrom = function (socketId) {
    if (!chrome.socket._id.callback[socketId] ||
            chrome.socket._id.messages[socketId].length == 0)
        return;
    var data = chrome.socket._id.messages[socketId].shift();
    var callback = chrome.socket._id.callback[socketId];
    chrome.socket._id.callback[socketId] = null;
    callback({
        address: data[1].address,
        data: new Uint8Array(data[0]).buffer,
        port: data[1].port,
        resultCode: data[1].size
    });
};

/**
 * Reads data from the given socket.
 * @param socketId {Number} The socketId.
 * @param bufferSize {Number} The receive buffer size. [optional]
 * @param callback {function(ReadInfo)} Delivers data that was available to be
 *         read without blocking.
 */
chrome.socket.recvFrom = function(socketId, bufferSize, callback) {
    if (!chrome.socket._id.map[socketId])
        throw new Error('Socket not found');
    chrome.socket._id.callback[socketId] = callback;
    // TODO: Handle bufferSize.
    chrome.socket._recvFrom(socketId);
};

/**
 * Writes data on the given socket.
 * @param socketId {Number} The socketId.
 * @param data {ArrayBuffer} The data to write.
 * @param address {String} The address of the remote machine.
 * @param port {Number} The port of the remote machine.
 * @param callback {function(WriteInfo)} Called when the first of any of the
 *         following happens: the before completion (in which case onEvent()
 *         will eventually be called with a writeComplete event, or an error
 *         occurred.
 */
chrome.socket.sendTo = function(socketId, data, address, port, callback) {
    if (!chrome.socket._id.map[socketId])
        throw new Error('Socket not found');
    var buffer = new Buffer(data);
    chrome.socket._id.map[socketId].send(buffer, 0, buffer.length, port,
            address, function (err, bytes) {
        if (err)
            console.log(err);
        callback({bytesWritten: bytes});
    });
};