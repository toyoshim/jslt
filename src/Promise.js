/**
 * Copyright (c) 2014, Takashi Toyoshima <toyoshim@gmail.com>
 * All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE file.
 */
/**
 * Pseudo Promise, JsltPromise class.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 * @param resolver {callback} resolver function.
 * @constructor
 */
function JsltPromise (resolver) {
    var resolve = function (result) {
        this._resolved = true;
        this._success = true;
        if (this._successCallback)
            this._successCallback(result);
        else
            this._result = result;
    }.bind(this);
    var reject = function (result) {
        this._resolved = true;
        this._success = false;
        if (this._errorCallback)
            this._errorCallback(result);
        else
            this._result = result;
    }.bind(this);
    this._resolved = false;
    this._success = false;
    this._result = null;
    this._successCallback = null;
    this._errorCallback = null;
    resolver(resolve, reject);
};
try {
    exports.Promise = JsltPromise;
} catch (e) {}
try {
    if (!window['Promise'])
        Promise = JsltPromise;
} catch (e) {}

/**
 * Waits until a task is finished, and calls one of specified callbacks.
 * |success| is called on success, otherwise |error| is called.
 * @param success {callback} Success callback.
 * @param error {callback} Error callback.
 */
JsltPromise.prototype.then = function (success, error) {
    if (this._resolved) {
        if (this._success)
            success(this._result);
        else
            error(this._result);
    } else {
        this._successCallback = success;
        this._errorCallback = error;
    }
};

/**
 * Returns a class that waits all specified promises.
 * @param promises {Array<JsltPromise>} an Array of JsltPromise objects.
 */
JsltPromise.all = function (promises) {
    return new Promise._all(promises);
};

/**
 * JsltPromise._all class that is used to emulate Promise.all.
 * @param promises {Array<JsltPromise>} an Array of JsltPromise objects.
 * @constructor
 */
JsltPromise._all = function (promises) {
    JsltPromise.call(this, function (resolve, reject) {
        this._all_promises = promises;
        this._all_resolved = 0;
        this._all_success = 0;
        this._all_results = [];
        this._all_resolve = resolve;
        this._all_reject = reject;
        for (var i = 0; i < promises.length; ++i) {
            if (promises[i]._resolved) {
                // A specified JsltPromise is already resolved.
                this._all_resolved++;
                if (promises[i]._success)
                    this._all_success++;
                continue;
            }
            // Set callback to be notified when a JsltPromise is resolved.
            promises[i]._all_parent = this;
            promises[i].then(function(result) {
                this._all_parent._all_resolved++;
                this._all_parent._all_success++;
                this._result = result;
                this._all_parent._all_handleCallbacks();
            }, function(result) {
                this._all_parent._all_resolved++;
                this._result = result;
                this._all_parent._all_handleCallbacks();
            });
        }
        // Check if all specified JsltPromise are already resolved just in case.
        this._all_handleCallbacks();
    }.bind(this));
};

/* Inherits JsltPromise */
JsltPromise._all.prototype = JsltPromise.prototype;
JsltPromise._all.prototype.constructor = JsltPromise._all;

/**
 * Checks if all JsltPromise are resolved to notify.
 */
JsltPromise._all.prototype._all_handleCallbacks = function () {
    if (this._all_resolved != this._all_promises.length)
        return;
    for (var i = 0; i < this._all_promises.length; ++i)
        this._all_results[i] = this._all_promises[i]._result;
    if (this._all_resolved == this._all_success)
        this._all_resolve(this._all_results);
    else
        this._all_reject('one of Promises return an error.');
};
