import { ExplanMain } from '../explanMain/explanMain';
import { reportIfError } from '../report-error/report-error';

// @ts-expect-error Need to add types.
const vscode = acquireVsCodeApi();

interface getFileDataBody {
  contentType: string;
}

document.addEventListener('finished-init', () => {
  const explanMain = document.querySelector<ExplanMain>('explan-main')!;
  explanMain.embedded();

  window.addEventListener('message', async (e) => {
    const { type, body, requestId } = e.data;
    switch (type) {
      case 'init': {
        if (body.untitled) {
          return;
        } else {
          const ret = await explanMain.fromUint8Array(body.value as Uint8Array);
          reportIfError(ret);
          return;
        }
      }
      case 'getFileData': {
        const contentType = (body as getFileDataBody).contentType;
        const ret = await explanMain.toUnit8Array(contentType);
        if (!ret.ok) {
          reportError(e);
          return;
        }

        vscode.postMessage({
          type: 'response',
          requestId,
          body: ret.value,
        });
        return;
      }
      case 'undo': {
        await explanMain.undo();
        vscode.postMessage({
          type: 'response',
          requestId,
        });
        return;
      }
      case 'redo': {
        await explanMain.redo();
        vscode.postMessage({
          type: 'response',
          requestId,
        });
        return;
      }
    }
  });

  vscode.postMessage({ type: 'ready' });
});

document.addEventListener('edit-action', () => {
  vscode.postMessage({ type: 'edit' });
});
