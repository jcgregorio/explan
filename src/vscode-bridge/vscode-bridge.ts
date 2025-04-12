import { ExplanMain } from '../explanMain/explanMain';

// @ts-expect-error Need to add types.
const vscode = acquireVsCodeApi();

console.log('Bridge run.');
document.addEventListener('finished-init', () => {
  const explanMain = document.querySelector<ExplanMain>('explan-main')!;

  window.addEventListener('message', async (e) => {
    const { type, body, requestId } = e.data;
    switch (type) {
      case 'init': {
        if (body.untitled) {
          return;
        } else {
          // Load the initial image into the canvas.
          const decoder = new TextDecoder();
          explanMain?.fromJSON(decoder.decode(body.value).toString());
          return;
        }
      }
      case 'getFileData': {
        // Get the image data for the canvas and post it back to the extension.
        vscode.postMessage({
          type: 'response',
          requestId,
          body: new TextEncoder().encode(explanMain.toJSON()),
        });
        return;
      }
    }
  });

  console.log('About to send ready event.');
  vscode.postMessage({ type: 'ready' });
});
