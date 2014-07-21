/**
 * Copyright (c) 2014, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */
/**
 * ScreenModel class.
 * TODO:
 *  - page handling
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 * @param lines {number} Screen width in line.
 * @param rows {number} Screen height in rows.
 * @param text {object} TextModel object that contains contents.
 * @param position {number} The first character position in |line|.
 * @constructor
 */
function ScreenModel (lines, rows, text, position) {
    this._text = text;
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
    var line = text.atLine(0);
    for (var i = 0; i < lines; ++i) {
        this._lines[i] = new ScreenModel.Line(
                rows, line, position, this._wrapRules);
        line = this._lines[i].getNextLine();
        position = this._lines[i].getNextLinePosition();
    }
    this._rows = rows;
    this._cursor = { line: 0, row: 0};
    this.onMove = null;
    this.onUpdateLine = null;
}
try {
    exports.ScreenModel = ScreenModel;
} catch (e) {}

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
 * Insert a character to the current potision.
 * @param character {string} A Unicode character in UTF-16.
 */
ScreenModel.prototype.insert = function (character) {
    var code = character.charCodeAt(0);
    if (code == 0x0d || code == 0x0a) {
        this._lines[this._cursor.line].getCharacterAt(this._cursor.row);
        this._text.breakLine();
    } else {
        this._lines[this._cursor.line].insertCharacterAt(
                this._cursor.row, character);
    }
    this.updateLayout();
    this.moveForward();
};

/**
 *  Remove a character from the current position.
 */
ScreenModel.prototype.remove = function () {
    var line = this._lines[this._cursor.line];
    if (line.removeAt(this._cursor.row))
        this.updateLayout();
}

/**
 * Update screen layout.
 */
ScreenModel.prototype.updateLayout = function () {
    // TODO: Reduce unnesessary updates on unmodified lines.
    var cursorLine = this._lines[this._cursor.line];
    var cursorLineList = cursorLine.getCurrentLine();
    var cursorLinePosition =
            cursorLine.getCurrentLinePosition() + this._cursor.row;

    var lines = this._lines.length;
    var line = this._lines[0].getCurrentLine();
    var position = this._lines[0].getCurrentLinePosition();
    for (var i = 0; i < lines; ++i) {
        this._lines[i].reset(this._rows, line, position, this._wrapRules);
        line = this._lines[i].getNextLine();
        position = this._lines[i].getNextLinePosition();
        if (this.onUpdateLine)
            this.onUpdateLine(i);

        // Check cursor position.
        if (this._lines[i].getCurrentLine() != cursorLineList)
            continue;
        if (this._lines[i].getCurrentLinePosition() > cursorLinePosition)
            continue;
        if (this._lines[i].getNextLine == cursorLineList &&
                this._lines[i].getNextLinePosition() >= cursorLinePosition)
            continue;
        this._cursor.line = i;
        this._cursor.row =
                cursorLinePosition - this._lines[i].getCurrentLinePosition();
    }
    this.setCursor(this._cursor.line, this._cursor.row);
};

/**
 * Get the line object that the next page should start.
 * @return {object} TextModel.List object that contains contents.
 */
ScreenModel.prototype.getNextLine = function () {
    var last = this._lines.length - 1;
    return this._lines[last].getNextLine();
};

/**
 * Get the position in the next line object that the next page should start.
 * @return {number} The position that the next page starts in the next line.
 */
ScreenModel.prototype.getNextLinePosition = function () {
    var last = this._lines.length - 1;
    return this._lines[last].getNextLinePosition();
};

/**
 * Get cursor line.
 * @return {number} The current line position.
 */
ScreenModel.prototype.getCursorLine = function () {
    return this._cursor.line;
};

/**
 * Get cursor row.
 * @return {number} The current row position.
 */
ScreenModel.prototype.getCursorRow = function () {
    return this._cursor.row;
};

/**
 * Set cursor.
 * @param line {number} The current line position.
 * @param row {number} The current row position.
 */
ScreenModel.prototype.setCursor = function (line, row) {
    this._cursor.line = line;
    this._cursor.row = row;
    if (this.onMove)
        this.onMove(line, row);
};

/**
 * Move cursor position forward.
 * @return {boolean} true if success.
 */
ScreenModel.prototype.moveForward = function () {
    var row = this._cursor.row;
    var line = this._cursor.line;
    var dangling = row == this._rows;
    var fullfilled = row == this._rows - 1;
    var nextLine = this._lines[line].getNextLine();
    var wrapping = this._lines[line].getCharacterAt(row + 1) == '' &&
            nextLine == this._lines[line].getCurrentLine();
    var lf = this._lines[line].getCharacterAt(row + 1) == '' &&
            nextLine != null && nextLine != this._lines[line].getCurrentLine();
    if (dangling || fullfilled || wrapping || lf) {
        // Go to the next line home if possible.
        if (nextLine == null)
            return false;
        // TODO: Page handling.
        this.setCursor(this._cursor.line + 1, 0);
        return true;
    }
    this.setCursor(this._cursor.line, this._cursor.row + 1);
    return true;
};

/**
 * Move cursor position backward.
 * @return {boolean} true if success.
 */
ScreenModel.prototype.moveBackward = function () {
    if (this._cursor.row == 0) {
        if (this._cursor.line == 0)
            return false;
        var line = this._lines[this._cursor.line - 1];
        for (var row = 0; row <= this._rows; ++row) {
            if (line.getCharacterAt(row) == '')
                break;
        }
        if (row != 0 && line.getCurrentLine() == line.getNextLine())
            row--;
        this.setCursor(this._cursor.line - 1, row);
        return true;
    }
    this.setCursor(this._cursor.line, this._cursor.row - 1);
    return true;
};

/**
 * Create a string that represent screen image. This is mainly for testing.
 * @return {string} A string representing screen.
 */
ScreenModel.prototype.toString = function () {
    var lines = [];
    var length = this._lines.length;
    for (var i = 0; i < length; ++i)
        lines.push(this._lines[i].toString());
    return lines.join('\n');
};

/**
 * ScreenModel.Line class.
 * @param rows {number} Line length.
 * @param line {Object} TextModel.List object that contains contents.
 * @param position {number} The first character position in |line|.
 * @param rules {Object} Wrap rules.
 * @constructor
 */
ScreenModel.Line = function (rows, line, position, rules) {
    this.reset(rows, line, position, rules);
};


/**
 * Set contents.
 * @param rows {number} Line length.
 * @param line {Object} TextModel.List object that contains contents.
 * @param position {number} The first character position in |line|.
 * @param rules {Object} Wrap rules.
 */
ScreenModel.Line.prototype.reset = function (rows, line, position, rules) {
    this._rows = rows;
    this._line = line;
    this._position = position;
    if (line == null) {
        this._nextLine = line;
        this._nextPosition = 0;
        return;
    }
    var maxLength = line.getLength() - position;
    var length = Math.min(rows, maxLength);
    var next = (maxLength > length) ? line.at(position + length) : null;
    var nextNext =
            (maxLength > length + 1) ? line.at(position + length + 1) : null;
    // Dangline rule check.
    if ((nextNext == null || rules.lineStart.indexOf(nextNext.character) < 0) &&
            (next && rules.dangling.indexOf(next.character) >= 0)) {
        this._rows = length + 1;
    } else {
        for (; length > 0; --length) {
            // Line start rule check.
            if (length < maxLength && rules.lineStart.indexOf(
                    line.at(position + length).character) >= 0)
                continue;
            // Line end rule check.
            if (rules.lineEnd.indexOf(
                    line.at(position + length - 1).character) >= 0)
                continue;
            this._rows = length;
            break;
        }
    }

    if ((maxLength == this._rows && maxLength >= rows && line.next == null) ||
            maxLength > this._rows) {
        this._nextLine = line;
        this._nextPosition = position + this._rows;
    } else {
        this._nextLine = line.next;
        this._nextPosition = 0;
    }
};

/**
 * Get the line object that the current line should start.
 * @return {object} TextModel.List object that contains contents.
 */
ScreenModel.Line.prototype.getCurrentLine = function () {
    return this._line;
};

/**
 * Get the position in the current line object that the current line should
 * start.
 * @return {number} The position that the current line starts.
 */
ScreenModel.Line.prototype.getCurrentLinePosition = function () {
    return this._position;
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

/**
 * Insert a character at the position in a line.
 * @param row {number} Row position in a line.
 * @param character {string} A Unicode text in UTF-16 to insert.
 */
ScreenModel.Line.prototype.insertCharacterAt = function (row, character) {
    var position = this._position + row;
    this._line.at(position - 1);
    this._line.insert(new TextModel.Cell(character));
};

/**
 * Remove a character at the position in a line.
 * @param row {number} Row position in a line.
 * @return {boolean} True if succeeded.
 */
ScreenModel.Line.prototype.removeAt = function (row) {
    var position = this._position + row;
    if (position >= this._line.getLength())
        return false;
    this._line.at(position);
    this._line.remove();
    return true;
};

/**
 * Create a string that represent a line image. This is mainly for testing.
 * @return {string} A string representing ascreen line.
 */
ScreenModel.Line.prototype.toString = function () {
    if (this._line == null)
        return '';
    var cells = [];
    var length = this._line.getLength();
    for (var i = 0; i < length; ++i)
        cells.push(this.getCharacterAt(i));
    return cells.join('') + '  // ' + this.getNextLinePosition() + ' @ ' +
            this.getNextLine();
};
