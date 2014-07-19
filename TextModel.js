/**
 * Copyright (c) 2014, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */
/**
 * TextModel class.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 */
function TextModel () {
    this._lines = new TextModel.List();
}
exports.TextModel = TextModel;

/**
 * Get a line length.
 * @return {number} length.
 */
TextModel.prototype.getLineLength = function () {
    return this._lines.getLength();
};

/**
 * Get a row length at the current line.
 * @return {number} length.
 */
TextModel.prototype.getRowLength = function () {
    return this._lines.at().getLength();
};

/**
 * Get a current line position.
 * @return {number} position.
 */
TextModel.prototype.getLinePosition = function () {
    return this._lines.getPosition();
};

/**
 * Get a current row position at the current line.
 * @return {number} position.
 */
TextModel.prototype.getRowPosition = function () {
    return this._lines.at().getPosition();
};

/**
 * Get a List object that represent a line at position |n|. Throws {RangeError}
 * when |n| is out of range.
 * Move the current line position to |n|, too. If |n| is omitted, returns a List
 * object at the current line position.
 * @param n {number} line position.
 * @return {Object} TextModel.List at position.
 */
TextModel.prototype.atLine = function (n) {
    return this._lines.at(n);
};

/**
 * Get a Cell object at position |n| in the current line. Throws {RangeError}
 * when |n| is out of range.
 * Move the current row position to |n|, too. If |n| is omitted, returns a Cell
 * object at the current raw position in the current line.
 * @param n {number} row position.
 * @return {Object} TextModel.Cell at position.
 */
TextModel.prototype.atRow = function (n) {
    return this._lines.at().at(n);
};

/**
 * Get one Unicode character at line |n| and row |m|. Throws {RangeError} when
 * |n| or |m| is out of range.
 * Move the current position to line |n| and row |m|, too. If |n| or |m| is
 * omitted, returns a Cell object at the current line or row position.
 * @param n {number} line position.
 * @param m {number} row position.
 * @return {string} one Unicode character at position.
 */
TextModel.prototype.at = function (n, m) {
    return this._lines.at(n).at(m).character;
};

TextModel.prototype.insert = function (character) {
    if (0 == this.getLineLength())
        this._lines.insert(new TextModel.List());
    this.atLine().insert(new TextModel.Cell(character));
};

/**
 * Insert a line break, and set the current position to the next line.
 */
TextModel.prototype.breakLine = function () {
    if (0 == this.getLineLength())
        this._lines.insert(new TextModel.List());
    this._lines.insert(new TextModel.List());
};

/**
 * Cell class that contains one Unicode character, and can be stored in a List.
 * @param character {string} Single unicode character in UTF-16.
 * @param previous {Object} TextModel.Cell object that chains previous cell.
 * @param next {Object} TextModel.Cell object that chains next cell.
 * @constructor
 */
TextModel.Cell = function (character, previous, next) {
    this.character = character;
    this.previous = previous;
    this.next = next;
};

/**
 * Insert a next item, and chain them.
 * @param item {Object} TextModel.Cell object to insert.
 */
TextModel.Cell.prototype.insertNext = function (item) {
    var oldItem = this.next;
    this.next = item;
    item.previous = this;
    item.next = oldItem;
    if (oldItem)
        oldItem.previous = item;
};

/**
 * Insert a previous item, and chain them.
 * @param item {Object} TextModel.Cell object to insert.
 */
TextModel.Cell.prototype.insertPrevious = function (item) {
    var oldItem = this.previous;
    this.previous = item;
    item.next = this;
    item.previous = oldItem;
    if (oldItem)
        oldItem.next = item;
};

/**
 * List class to represent a line and a row.
 * @constructor
 */
TextModel.List = function () {
    this._current = null;
    this._first = null;
    this._position = -1;
    this._length = 0;
};
// Inherit TextModelCell.
TextModel.List.prototype = new TextModel.Cell();
TextModel.List.prototype.constructor = TextModel.List;

/**
 * Get a list length.
 * @return {number} length.
 */
TextModel.List.prototype.getLength = function () {
    return this._length;
};

/**
 * Get a current position.
 * @return {number} position.
 */
TextModel.List.prototype.getPosition = function () {
    return this._position;
};

/**
 * Get an item at position |n|. Throws {RangeError} when |n| is out of range.
 * Move the current position to |n|, too. If |n| is omitted, returns an object
 * at the current position.
 * @param n {number} position.
 * @return {Object} TextModel.Cell at position.
 */
TextModel.List.prototype.at = function (n) {
    if (n === undefined)
        n = this._position;
    if (n < 0 || n >= this._length)
        throw new RangeError('at');
    var i = 0;
    var item = this._first;
    if (n >= this._position) {
        i = this._position;
        item = this._current;
    }
    for (; i < n; ++i)
        item = item.next;
    this._position = n;
    this._current = item;
    return item;
};

/**
 * Insert |item| to the current position.
 * @param item {Object} TextModel.Cell to insert.
 */
TextModel.List.prototype.insert = function (item) {
    if (this._length == 0)
        this._first = item;
    else
        this._current.insertNext(item);
    this._position++;
    this._current = item;
    this._length++;
};