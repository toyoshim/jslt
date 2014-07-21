/**
 * Copyright (c) 2014, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */
/**
 * ScreenModel class.
 * TODO:
 *  - cursor calculation.
 *  - move back / fowrad
 *  - position move
 *  - tests on inserting arbitorary position
 *  - page break
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
        this._lines[i].adoptWrapRules(rows, this._wrapRules);
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
    var inserted = false;
    var length = this._lines.length;
    for (var i = this._cursor.line; i < length; ++i) {
        var line = this._lines[i];
        var nextLine = line.getNextLine();
        var nextPosition = line.getNextLinePosition();
        if (!inserted) {
            inserted = true;
            line.insertCharacterAt(this._cursor.row++, character);
        }
        line.adoptWrapRules(this._rows, this._wrapRules);
        if (this.onUpdateLine)
            this.onUpdateLine(i);
        if (nextLine == line.getNextLine() &&
                nextPosition == line.getNextLinePosition()) {
            break;
        }
        if (i + 1 == length) {
            // TODO: Page handling.
        }
        this._lines[i + 1].updateContents(
                this._rows, line.getNextLine(), line.getNextLinePosition());
    }
    // TODO: Update cursor correctly.
    this.setCursor(this._cursor.line, this._cursor.row);
};

/**
 *  Remove a character from the current position.
 */
ScreenModel.prototype.remove = function () {
    var removed = false;
    var length = this._lines.length;
    for (var i = this._cursor.line; i < length; ++i) {
        var line = this._lines[i];
        var nextLine = line.getNextLine();
        var nextPosition = line.getNextLinePosition();
        if (!removed) {
            removed = true;
            line.removeAt(this._cursor.row);
        }
        line.adoptWrapRules(this._rows, this._wrapRules);
        if (this.onUpdateLine)
            this.onUpdateLine(i);
        if (nextLine == line.getNextLine() &&
                nextPosition == line.getNextLinePosition())
            break;
        if (i + 1 == length) {
            // TODO: Page handling.
        }
        this._lines[i + 1].updateContents(
                this._rows, line.getNextLine(), line.getNextLinePosition());
    }
    // TODO: Update cursor correctly.
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
    //console.log('cursor (' + line + ', ' + row + ')');
};

/**
 * Create a string that represent screen image. This is mainly for testing.
 * @return {string} A string representing screen.
 */
ScreenModel.prototype.toString = function () {
    var lines = [];
    for (var i = 0; i < this._rows; ++i)
        lines.push(this._lines[i].toString());
    return lines.join('\n');
};

/**
 * ScreenModel.Line class.
 * @param rows {number} Line height in rows.
 * @param line {object} TextModel.TextList object that contains contents.
 * @param position {number} The first character position in |line|.
 * @constructor
 */
ScreenModel.Line = function (rows, line, position) {
    this.updateContents(rows, line, position);
};


/**
 * Update contents.
 */
ScreenModel.Line.prototype.updateContents = function (rows, line, position) {
    this._rows = rows;
    this._line = line;
    this._position = position;
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

/**
 * Adopt wrap rules.
 * @param rows {number} Default rows in line.
 * @param rules {Object} Wrap rules.
 */
ScreenModel.Line.prototype.adoptWrapRules = function (rows, rules) {
    this._rows = rows;
    var line = this._line;
    if (line == null || this._nextLine != line)
        return;

    var position = this._position;
    var length = line.getLength() - position;
    var next = line.at(position + this._rows);
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
    for (; rows > 0; --rows) {
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

/**
 * Insert a character at the position in a line.
 * @param row {number} Row position in a line.
 * @param character {string} A Unicode text in UTF-16 to insert.
 */
ScreenModel.Line.prototype.insertCharacterAt = function (row, character) {
    var position = this._position + row;
    if (this._line.getPosition() != -1)
        this._line.at(position - 1);
    this._line.insert(new TextModel.Cell(character));
    this.updateContents(this._rows, this._line, this._position);
};

/**
 * Remove a character at the position in a line.
 * @param row {number} Row position in a line.
 */
ScreenModel.Line.prototype.removeAt = function (row) {
    var position = this._position + row;
    this._line.at(position);
    this._line.remove();
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
