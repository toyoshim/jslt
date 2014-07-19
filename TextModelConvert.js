/**
 * Copyright (c) 2014, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */
/**
 * TextModel conversion library.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 */
TextModelConvert = {};
exports.TextModelConvert= TextModelConvert;

/**
 * Create TextModel from JavaScript string in UTF-16.
 * @param text {string} input test in UTF-16.
 * @return {Object} Created TextModel object.
 */
TextModelConvert.createFromString = function (text) {
    var model = new TextModel();
    var length = text.length;
    for (var i = 0; i < length; ++i) {
        var code = text.charCodeAt(i);
        if (code == 0x0d) {
            model.breakLine();
            // Skip the next LF if line breaks are expressed as CRLF.
            if (i + 1 < length && text.charCodeAt(i + 1) == 0x0a)
                i++;
            continue;
        }
        if (code == 0x0a) {
            model.breakLine();
            continue;
        }
        if (Unicode.isHighSurrogates(code)) {
            // TODO: Strict check will help.
            model.insert(text.substr(i, 2));
            i++;
            continue;
        }
        model.insert(text[i]);
    }
    return model;
};

/**
 * Create a string from TextModel.
 * @param model {Object} input TextModel.
 * @return {string} A string that TextModel contains.
 */
TextModelConvert.createString = function (model) {
    var lineArray = [];
    var lines = model.getLineLength();
    for (var line = 0; line < lines; ++line) {
        var rowArray = [];
        var list = model.atLine(line);
        var rows = list.getLength();
        for (var row = 0; row < rows; ++row)
            rowArray.push(list.at(row).character);
        lineArray.push(rowArray.join(''));
    }
    return lineArray.join('\n');
};