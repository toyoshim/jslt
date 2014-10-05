/**
 * Copyright (c) 2014, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */
/**
 * Directory class.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 * @constructor
 */
function Directory () {
    this._entries = [];
    this._map = {};
}
try {
    exports.Directory = Directory;
} catch (e) {}

/**
 * Gets all entries.
 * @return {Array<Directory.Entret>}.
 */
Directory.prototype.getEntries = function () {
    return this._entries;
};

/**
 * Finds an entry by name.
 * @param name {string} a name for an entry to find.
 * @return {Directory.Entry}.
 */
Directory.prototype.find = function (name) {
    return this._map[name];
};

/**
 * Append an entry to the directory.
 * @param entry {Directory.Entry} an entry to add.
 */
Directory.prototype.append = function (entry) {
    this._entries.push(entry);
    this._map[entry.name()] = entry;
};

/**
 * Directory.Entry class.
 * @param name {string} an entry name.
 * @param directory {boolean} a flag for differentiating directory or file.
 * @param instance {Object} an instance of File or Directory.
 * @constructor
 */
Directory.Entry = function (name, directory, instance) {
    this._name = name;
    this._directory = directory;
    this._instance = instance;
};

Directory.Entry.prototype.name = function () {
    return this._name;
};

Directory.Entry.prototype.isFile = function () {
    return !this._directory;
};

Directory.Entry.prototype.isDirectory = function () {
    return this._directory;
};

Directory.Entry.prototype.file = function () {
    return this.isFile() ? this._instance : null;
};

Directory.Entry.prototype.directory = function () {
    return this.isDirectory() ? this._instance : null;
};

