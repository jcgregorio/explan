"use strict";
/**
 * This file Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Origin: https://github.com/microsoft/vscode-extension-samples/blob/main/custom-editor-sample/src/dispose.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Disposable = void 0;
exports.disposeAll = disposeAll;
function disposeAll(disposables) {
    while (disposables.length) {
        const item = disposables.pop();
        if (item) {
            item.dispose();
        }
    }
}
class Disposable {
    _isDisposed = false;
    _disposables = [];
    dispose() {
        if (this._isDisposed) {
            return;
        }
        this._isDisposed = true;
        disposeAll(this._disposables);
    }
    _register(value) {
        if (this._isDisposed) {
            value.dispose();
        }
        else {
            this._disposables.push(value);
        }
        return value;
    }
    get isDisposed() {
        return this._isDisposed;
    }
}
exports.Disposable = Disposable;
//# sourceMappingURL=dispose.js.map