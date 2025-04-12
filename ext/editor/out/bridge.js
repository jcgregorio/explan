"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// This script is run within the webview itself
(function () {
    // @ts-ignore
    const vscode = acquireVsCodeApi();
    // Signal to VS Code that the webview is initialized.
    vscode.postMessage({ type: 'ready' });
}());
//# sourceMappingURL=bridge.js.map