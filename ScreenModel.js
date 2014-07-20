/**
 * Copyright (c) 2014, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */
/**
 * ScreenModel class.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 * @param lines {number} Screen width in line.
 * @param rows {number} Screen height in rows.
 * @param line {object} TextModel.List object that contains contents.
 * @param position {number} The first character position in |line|.
 * @constructor
 */
function ScreenModel (lines, rows, line, position) {
    this._lines = new Array(lines);
    this._wrapRules = {
        dangling: '、。',
        lineEnd: '([｛〔〈《「『【〘〖〝‘“｟«',
        lineStart: ',)]｝、〕〉》」』】〙〗〟’”｠»' +
                'ゝゞーァィゥェォッャュョヮヵヶ' +
                'ぁぃぅぇぉっゃゅょゎゕゖㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇷ゚ㇺㇻㇼㇽㇾㇿ' +
                '々〻' +
                '‐゠–〜～' +
                '?!‼⁇⁈⁉' +
                '・:;/' +
                '。.',
        group: ''  // TODO
    };
    for (var i = 0; i < lines; ++i) {
        this._lines[i] = new ScreenModel.Line(rows, line, position);
        this._lines[i].adoptWrapRules(this._wrapRules);
        line = this._lines[i].getNextLine();
        position = this._lines[i].getNextLinePosition();
    }
    this._rows = rows;
    this._cursor = { line: 0, row: 0};
}
exports.ScreenModel = ScreenModel;

/**
 * Get the character at the position..
 * @return {string} The character at the position.
 */
ScreenModel.prototype.getCharacterAt = function (line, row) {
    // (this._rows == row) can be valid for Kinsoku.
    if (this._lines.length <= line || this._rows < row)
        throw new RangeError('getCharacterAt');
    return this._lines[line].getCharacterAt(row);
};

/**
 * Get the line object that the next page should start.
 * @return {object} TextModel.List object that contains contents.
 */
ScreenModel.prototype.getNextLine = function () {
    return this._lines[this._rows - 1].getNextLine();
};

/**
 * Get the position in the next line object that the next page should start.
 * @return {number} The position that the next page starts in the next line.
 */
ScreenModel.prototype.getNextLinePosition = function () {
    return this._lines[this._rows - 1].getNextLinePosition();
};

/**
 * ScreenModel.Line class.
 * @param rows {number} Line height in rows.
 * @param line {object} TextModel.TextList object that contains contents.
 * @param position {number} The first character position in |line|.
 * @constructor
 */
ScreenModel.Line = function (rows, line, position) {
    this._line = line;
    this._position = position;
    this._rows = rows;
    if (line == null) {
        this._nextLine = line;
        this._nextPosition = 0;
        return;
    }
    var length = line.getLength() - position;
    if (length > rows) {
        this._nextLine = line;
        this._nextPosition = position + rows;
    } else {
        this._nextLine = line.next;
        this._nextPosition = 0;
    }
};

ScreenModel.Line.prototype.adoptWrapRules = function (rules) {
    var line = this._line;
    if (line == null || this._nextLine != line)
        return;
    var position = this._position;
    var length = line.getLength() - position;
    var next = line.at(this._nextPosition);
    var nextNext = next.getNext();
    // Dangline rule check.
    if ((nextNext == null || rules.lineStart.indexOf(nextNext.character) < 0) &&
            rules.dangling.indexOf(next.character) >= 0) {
        ++this._rows;
        if (length == this._rows) {
            this._nextLine = line.next;
            this._nextPosition = 0;
        } else {
            ++this._nextPosition;
        }
        return;
    }
    for (var rows = this._rows; rows > 0; --rows) {
        // Line start rule check.
        if (rules.lineStart.indexOf(line.at(position + rows).character) >= 0)
            continue;
        // Line end rule check.
        if (rules.lineEnd.indexOf(line.at(position + rows - 1).character) >= 0)
            continue;
        this._rows = rows;
        break;
    }
    this._nextPosition = position + this._rows;
};

/**
 * Get the line object that the next line should start.
 * @return {object} TextModel.List object that contains contents.
 */
ScreenModel.Line.prototype.getNextLine = function () {
    return this._nextLine;
};

/**
 * Get the position in the next line object that the next line should start.
 * @return {number} The position that the next line starts in the next line.
 */
ScreenModel.Line.prototype.getNextLinePosition = function () {
    return this._nextPosition;
};

/**
 * Get the character at the position in a line.
 * @return {string} The character at the position.
 */
ScreenModel.Line.prototype.getCharacterAt = function (row) {
    var position = this._position + row;
    if (this._line == null || this._rows <= row ||
            this._line.getLength() <= position)
        return '';
    return this._line.at(position).character;
};
