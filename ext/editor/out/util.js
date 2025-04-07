"use strict";
/**
 * This file Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Origin: https://github.com/microsoft/vscode-extension-samples/blob/main/custom-editor-sample/src/utils.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNonce = getNonce;
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=util.js.map