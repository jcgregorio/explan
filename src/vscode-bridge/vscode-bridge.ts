// @ts-expect-error Need to add types.
const vscode = acquireVsCodeApi();

console.log('Bridge run.');
document.addEventListener('finished-init', () => {
  console.log('About to send ready event.');
});

window.setInterval(() => {
  console.log('Interval');
}, 200);

// Signal to VS Code that the webview is initialized.
vscode.postMessage({ type: 'ready' });
//# sourceMappingURL=bridge.js.map
