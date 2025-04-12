// @ts-expect-error Need to add types.
const vscode = acquireVsCodeApi();

console.log('Bridge run.');
document.addEventListener('finished-init', () => {
  console.log('About to send ready event.');
  vscode.postMessage({ type: 'ready' });
});
