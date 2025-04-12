
// This script is run within the webview itself
(function () {
	// @ts-ignore
	const vscode = acquireVsCodeApi();
    
	// Signal to VS Code that the webview is initialized.
	vscode.postMessage({ type: 'ready' });
}());
