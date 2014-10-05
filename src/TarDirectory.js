/**
 * Copyright (c) 2014, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */
/**
 * TarDirectory class.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 * @param buffer {ArrayBuffer} object that is handled as a file in the instance.
 * @param offset {Number} offset to start in bytes (optional).
 * @param size {Number} size in bytes (optional).
 * @constructor
 */
function TarDirectory (buffer, offset, size) {
    if (buffer.constructor.name != 'ArrayBuffer')
       throw Error('the first argument should be an instance of ArrayBuffer');
    Directory.call(this);
    if (!offset)
        offset = 0;
    if (!size)
        size = buffer.byteLength - offset;
    this._buffer = new Uint8Array(buffer, offset, size);
    this._parse();
}
try {
    exports.TarDirectory = TarDirectory;
} catch (e) {}

/** Inherits Directory */
TarDirectory.prototype = Directory.prototype;
TarDirectory.prototype.constructor = TarDirectory;

/**
 * Prases a tar data.
 */
TarDirectory.prototype._parse = function () {
    var offset = 0;
    while (offset < this._buffer.byteLength) {
        if (this._isEndOfEntries(offset))
            return;
        offset += this._parseAnEntry(offset);
    }
};

/**
 * Checks if the current position is end of entries.
 * @param offset {Number} offset in buffer.
 * @return {boolean} true if it reaches to the end of entries.
 */
TarDirectory.prototype._isEndOfEntries = function (offset) {
    if (offset + 1024 > this._buffer.byteLength)
        throw Error('can not find a tar end mark');
    for (var i = 0; i < 1024; ++i) {
        if (this._buffer[offset + i])
            return false;
    }
    return true;
};

/**
 * Prases an entry.
 * @param offset {Number} offset in buffer.
 * @return {number} processed data size.
 */
TarDirectory.prototype._parseAnEntry = function (offset) {
    // [POSIX 1003.1-1990]
    //    0 -  99: name
    //  100 - 107: mode
    //  108 - 115: uid
    //  116 - 123: gid
    //  124 - 135: size
    //  136 - 147: mtime
    //  148 - 155: chksum
    //  156 - 156: typeflag
    //  157 - 256: linkname
    //  257 - 262: magic
    //  263 - 264: version
    //  265 - 296: uname
    //  297 - 328: gname
    //  329 - 336: devmjor
    //  337 - 344: devminor
    //  345 - 500: prefix
    var zero = '0'.charCodeAt(0);
    if (offset + 512 > this._buffer.byteLength)
        throw Error('wrong tar header');
    var magic = this._getString(offset + 257, 5);
    var ustar = this._buffer[offset + 262] == 0 &&
                this._buffer[offset + 263] == zero &&
                this._buffer[offset + 264] == zero;
    var gnutar = this._buffer[offset + 262] == 0x20 &&
                 this._buffer[offset + 263] == 0x20 &&
                 this._buffer[offset + 264] == 0;
    // TODO: support pax (POSIX.1-2001) tar format.
    if (magic != 'ustar')
        throw Error('unknown magic in tar header');
    if (!ustar && !gnutar) {
        console.error('magic is not ustar or gnutar');
        console.log(this._buffer.subarray(offset + 257, offset + 257 + 8));
    }

    var name = this._getString(offset, 100);
    if (name[0] == '.' && name[1] == '/')
        name = name.substr(2);
    if (name[0] == '/')
        name = name.substr(1);
    var size = this._getNumber(offset + 124, 12);
    var blockSize = (size + 511) & ~0x1ff;
    var type = this._buffer[offset + 156];
    var regtype = '0'.charCodeAt(0);
    var dirtype = '5'.charCodeAt(0);
    if (type == regtype || type == 0) {
        this._registerFile(name, size, offset + 512);
    } else if (type == dirtype) {
        this._registerDirectory(name);
    } else {
        console.error('skip unknown file type ' + String.fromCharCode(type));
    }
    return 512 + blockSize;
};

TarDirectory.prototype._registerFile = function (name, size, offset) {
    var file = new ArrayBufferFile(
            this._buffer.buffer, this._buffer.byteOffset + offset, size);
    this._append(name, false, file);
};

TarDirectory.prototype._registerDirectory = function (name) {
    if (name.length == 0)
        return;
    if (name[name.length - 1] == '/')
        name = name.substr(0, name.length - 1);
    var directory = new Directory();
    this._append(name, true, directory);
};

TarDirectory.prototype._append = function(name, directory, object) {
    var dir = this;
    for (;;) {
        var index = name.indexOf('/');
        if (index < 0)
            break;
        var dirname = name.substr(0, index);
        var newDir = dir.find(dirname);
        if (!newDir) {
            console.error('directory entry is missing: ' + dirname);
            dir.append(new Directory.Entry(dirname, true, new Directory()));
            newDir = dir.find(dirname);
        }
        dir = newDir.directory();
        name = name.substr(index + 1);
    }
    dir.append(new Directory.Entry(name, directory, object));
};

/**
 * Parses an string parameter.
 * @param offset {Number} offset in buffer.
 * @param size {Number} entry container size.
 * @return {string}
 */
TarDirectory.prototype._getString = function (offset, size) {
    var result = '';
    for (var i = 0; i < size; ++i) {
        if (this._buffer[offset + i] == 0)
            break;
        result = result.concat(String.fromCharCode(this._buffer[offset + i]));
    }
    return result;
};

/**
 * Parses an integer parameter.
 * @param offset {Number} offset in buffer.
 * @param size {Number} entry container size.
 * @return {Number}
 */
TarDirectory.prototype._getNumber = function (offset, size) {
    var n = 0;
    var zero = '0'.charCodeAt(0);
    var nine = '9'.charCodeAt(0);
    for (var i = 0; i < size; ++i) {
        var c = this._buffer[offset + i];
        var error = false;
        if (i == (size - 1))
            error = c != 0;
        else
            error = c < zero || nine < c;
        if (error)
            throw Error('unexpected character for a number parameter');
        if (i == (size - 1))
            break;
        n = n * 10 + c - zero;
    }
    return n;
};

