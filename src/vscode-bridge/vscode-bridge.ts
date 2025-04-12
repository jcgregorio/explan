import { ExplanMain } from '../explanMain/explanMain';

// @ts-expect-error Need to add types.
const vscode = acquireVsCodeApi();

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
          try {
            explanMain?.fromJSON(decoder.decode(body.value).toString());
          } catch (error) {
            console.log('File was not valid JSON, plan unchanged.', error);
          }

          return;
        }
      }
      case 'getFileData': {
        // Get the data for the plan and post it back to the extension. Always
        // send as Uint8Array because in the future we will also be able to save
        // as a PNG.
        vscode.postMessage({
          type: 'response',
          requestId,
          body: new TextEncoder().encode(explanMain.toJSON()),
        });
        return;
      }
    }
  });

  vscode.postMessage({ type: 'ready' });
});
