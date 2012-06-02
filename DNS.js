/**
 * Copyright (c) 2012, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */
/**
 * DNS client.
 * See also RFC 1034.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 * @param server {String} A DNS server name.
 * @constructor
 */
function DNS (server) {
    if (arguments.length == 0) {
        // Use Google Public DNS.
        if (Math.random() >= 0.5)
            server = "8.8.8.8";
        else
            server = "8.8.4.4";
    }
    this.server = server;  // @type {String}
    this._signature = 0;  // @type {Number}
    this._ready = false;  // @type {Boolean}
    this._error = false;  // @type {Boolean}
    this._retry = null;  // @type {function()}
    this._socket = chrome.socket || chrome.experimental.socket;
    var self = this;
    this._socket.create("udp", {}, function (socketInfo) {
        self._socketId = socketInfo.socketId;
        if (self._socketId <= 0) {
            self._ready = true;
            self._error = true;
            return;
        }
        self._socket.bind(self._socketId, "0.0.0.0", 0, function (result) {
            self._ready = true;
            self._error = result != 0;
            if (self._retry) {
                var retry = self._retry;
                self._retry = null;
                retry();
            }
        });
    });
}
exports.DNS = DNS;

/**
 * @type {number} Constant variables.
 * @const
 * @private
 */
DNS._FLAG_QR_QUERY = 0x0000;
DNS._FLAG_QR_RESPONSE = 0x8000;
DNS._FLAG_OPCODE_NORMAL = 0x0000;
DNS._FLAG_OPCODE_REVERSE = 0x0800;
DNS._FLAG_OPCODE_SERVER_STATUS = 0x1000;
DNS._FLAG_AA = 0x0400;
DNS._FLAG_TC = 0x0200;
DNS._FLAG_RD = 0x0100;
DNS._FLAG_RA = 0x0080;
DNS._FLAG_RECODE_OK = 0x0000;
DNS._FLAG_RECODE_NAME_ERROR = 0x0003;
DNS._FLAG_RECODE_MASK = 0x000f;
DNS._TYPE_A = 0x01;
DNS._TYPE_NS = 0x02;
DNS._TYPE_CNAME = 0x05;
DNS._TYPE_PTR = 0x12;
DNS._TYPE_HINFO = 0x13;
DNS._TYPE_MX = 0x15;
DNS._TYPE_AXFR = 0x252;
DNS._TYPE_ANY = 0x255;
DNS._CLASS_INTERNET = 1;

DNS._SIZE_HEADER = 12;
DNS._OFFSET_SIGNATURE = 0;
DNS._OFFSET_FLAG = 2;
DNS._OFFSET_QUESTION_COUNT = 4;
DNS._OFFSET_ANSWER_COUNT = 6;
DNS._OFFSET_AUTHORITY_COUNT = 8;
DNS._OFFSET_ADDITIONAL_COUNT = 10;
DNS._OFFSET_QUESTION = 12;

/**
 * Deletes socket objects.
 */
DNS.prototype.destroy = function () {
    this._socket.destroy(this._socketId);
};

/**
 * Resolves hostname.
 * @param hostname {String} The hostname to be resolved.
 * @param callback {function(ResolveInfo)} Called when the hostname is resolved.
 *     ResolveInfo.query {String} The query hostname.
 *     ResolveInfo.success {Boolean} True if the query is resolved.
 *     ResolveInfo.records {Array.<RecordInfo>} Resolved records.
 *         RecordInfo.domain {String} The domain name of this record.
 *         RecordInfo.type {Number} The record type.
 *         RecordInfo.class {Number} The record class.
 *         RecordInfo.ttl {Number} The TTL of this record.
 *         RecordInfo.data {String} The record data.
 */
DNS.prototype.resolve = function (hostname, callback) {
    if (this._ready)
        this._resolve(hostname, callback);
    else {
        this._retry = function () {
            this._resolve(hostname, callback);
        };
    }
};

/**
 * Resolves hostname then returns IP addresses in Array.
 * @param hostname {String} The hostname to be resolved.
 * @param callback {function(Array.<String>)} Called on resolved.
 */
DNS.prototype.resolveA = function (hostname, callback) {
    if (this._ready)
        this._resolveA(hostname, callback);
    else {
        this._retry = function () {
            this._resolveA(hostname, callback);
        };
    }
};

/**
 * Decodes domain name of DNS response.
 * @param data {DataView} DNS response.
 * @param offset {Number} Offset to start decoding.
 * @return {Object} Decode information
 *     Object.domain {string} The domain name.
 *     Object.offset {Number} The next offset of the domain name.
 * @private
 */
DNS.prototype._getDomain = function (data, offset) {
    var domain = [];
    for (;;) {
        var length = data.getUint8(offset++);
        if (length > 63) {
            var pointer = (length & 0x3f) << 8;
            pointer += data.getUint8(offset++);
            domain.push(this._getDomain(data, pointer).domain);
            break;
        }
        if (length == 0)
            break;
        if (domain.length != 0)
            domain.push('.');
        for (i = 0; i < length; ++i)
            domain.push(String.fromCharCode(
                data.getUint8(offset++)));
    }
    return {
        domain: domain.join(''),
        offset: offset
    };
};

/**
 * Resolves hostname.
 * @param hostname {String} The hostname to be resolved.
 * @param callback {function(ResolveInfo)} Called when the hostname is resolved.
 * @private
 * @see DNS.prototype.resolve.
 */
DNS.prototype._resolve = function (hostname, callback) {
    var result = {
        query: hostname,
        success: false,
        records: []
    };
    if (this._error) {
        callback(result);
        return;
    }
    var queryNameSize = hostname.length + 2;
    var querySize = queryNameSize + 4;
    var messageSize = DNS._SIZE_HEADER + querySize;
    var message = new Uint8Array(messageSize);

    // Set signature.
    var signature = this._signature++;
    message[DNS._OFFSET_SIGNATURE + 0] = signature >> 8;
    message[DNS._OFFSET_SIGNATURE + 1] = signature & 0xff;

    // Set flag.
    var flag = DNS._FLAG_QR_QUERY | DNS._FLAG_OPCODE_NORMAL | DNS._FLAG_RD;
    message[DNS._OFFSET_FLAG + 0] = flag >> 8;
    message[DNS._OFFSET_FLAG + 1] = flag & 0xff;

    // Set counts.
    message[DNS._OFFSET_QUESTION_COUNT + 0] = 0;
    message[DNS._OFFSET_QUESTION_COUNT + 1] = 1;
    message[DNS._OFFSET_ANSWER_COUNT + 0] = 0;
    message[DNS._OFFSET_ANSWER_COUNT + 1] = 0;
    message[DNS._OFFSET_AUTHORITY_COUNT + 0] = 0;
    message[DNS._OFFSET_AUTHORITY_COUNT + 1] = 0;
    message[DNS._OFFSET_ADDITIONAL_COUNT + 0] = 0;
    message[DNS._OFFSET_ADDITIONAL_COUNT + 1] = 0;

    // Set query.
    var offset = DNS._OFFSET_QUESTION;
    var domain = hostname.split('.');
    // TODO: Strict check.
    for (var i = 0; i < domain.length; ++i) {
        message[offset++] = domain[i].length;
        for (var j = 0; j < domain[i].length; j++)
            message[offset++] = domain[i].charCodeAt(j);
    }
    message[offset++] = 0;

    // Set type and class.
    message[offset++] = 0;
    message[offset++] = DNS._TYPE_A;
    message[offset++] = 0;
    message[offset] = DNS._CLASS_INTERNET;

    var self = this;
    this._socket.sendTo(this._socketId, message.buffer, this.server, 53,
            function (writeInfo) {
        if (writeInfo.bytesWritten != message.byteLength) {
            callback(result);
            return;
        }
        self._socket.recvFrom(self._socketId, undefined, function (readInfo) {
            var data = new DataView(readInfo.data);
            var sig = data.getUint16(DNS._OFFSET_SIGNATURE);
            if (sig != signature) {
                console.log('DNS: invalid signature response');
                callback(result);
                return;
            }
            var flag = data.getUint16(DNS._OFFSET_FLAG);
            var recode = flag & DNS._FLAG_RECODE_MASK;
            if (recode != 0) {
                console.log('DNS: response recode error ' + recode);
                callback(result);
                return;
            }

            result.success = true;
            var offset = DNS._OFFSET_QUESTION;

            var questionCount = data.getUint16(DNS._OFFSET_QUESTION_COUNT);
            var answerCount = data.getUint16(DNS._OFFSET_ANSWER_COUNT);

            for (var question = 0; question < questionCount; ++question) {
                var domain = self._getDomain(data, offset);
                offset = domain.offset;
                offset += 4;
                result.query = domain.domain;
            }
            for (var rr = 0; rr < answerCount; ++rr) {
                domain = self._getDomain(data, offset);
                offset = domain.offset;
                var recordType = data.getUint16(offset);
                var recordClass = data.getUint16(offset + 2);
                var ttl = data.getUint32(offset + 4);
                var resourceLength = data.getUint16(offset + 8);
                offset += 10;
                var resourceData;
                if (recordType == DNS._TYPE_CNAME) {
                    var cname = self._getDomain(data, offset);
                    resourceData = cname.domain;
                } else if (recordType == DNS._TYPE_A) {
                    resourceData = [data.getUint8(offset + 0),
                            data.getUint8(offset + 1),
                            data.getUint8(offset + 2),
                            data.getUint8(offset + 3)].join('.');
                } else if (recordType == DNS._TYPE_NS) {
                    var ns = self._getDomain(data, offset);
                    resourceData = ns.domain;
                } else {
                    console.log('skip unknown answer type: ' + recordType);
                    resourceData = '';
                }
                offset += resourceLength;
                var record = {
                    domain: domain.domain,
                    type: recordType,
                    class: recordClass,
                    ttl: ttl,
                    data: resourceData
                };
                if (resourceData)
                    result.records.push(record);
            }
            callback(result);
        });
    });
};

/**
 * Resolves hostname then returns IP addresses in Array.
 * @param hostname {String} The hostname to be resolved.
 * @param callback {function(Array.<String>)} Called on resolved.
 * @private
 * @see DNS.prototype.resolveA.
 */
DNS.prototype._resolveA = function (hostname, callback) {
    this._resolve(hostname, function(result) {
        if (!result.success) {
            callback([]);
            return
        }
        var a = [];
        for (var i = 0; i < result.records.length; ++i) {
            if (result.records[i].type != DNS._TYPE_A)
                continue;
            a.push(result.records[i].data);
        }
        callback(a);
    });
};