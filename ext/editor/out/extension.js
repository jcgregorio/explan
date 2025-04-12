"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExplanEditorProvider = void 0;
exports.activate = activate;
const vscode = __importStar(require("vscode"));
const dispose_1 = require("./dispose");
/**
 * Define the document (the data model) used for paw draw files.
 */
class ExplanDocument extends dispose_1.Disposable {
    static async create(uri, backupId, delegate) {
        // If we have a backup, read that. Otherwise read the resource from the workspace
        const dataFile = typeof backupId === 'string' ? vscode.Uri.parse(backupId) : uri;
        const fileData = await ExplanDocument.readFile(dataFile);
        return new ExplanDocument(uri, fileData, delegate);
    }
    static async readFile(uri) {
        if (uri.scheme === 'untitled') {
            return new Uint8Array();
        }
        return new Uint8Array(await vscode.workspace.fs.readFile(uri));
    }
    _uri;
    _documentData;
    _edits = [];
    _savedEdits = [];
    _delegate;
    constructor(uri, initialContent, delegate) {
        super();
        this._uri = uri;
        this._documentData = initialContent;
        this._delegate = delegate;
    }
    get uri() { return this._uri; }
    get documentData() { return this._documentData; }
    _onDidDispose = this._register(new vscode.EventEmitter());
    /**
     * Fired when the document is disposed of.
     */
    onDidDispose = this._onDidDispose.event;
    _onDidChangeDocument = this._register(new vscode.EventEmitter());
    /**
     * Fired to notify webviews that the document has changed.
     */
    onDidChangeContent = this._onDidChangeDocument.event;
    _onDidChange = this._register(new vscode.EventEmitter());
    /**
     * Fired to tell VS Code that an edit has occurred in the document.
     *
     * This updates the document's dirty indicator.
     */
    onDidChange = this._onDidChange.event;
    /**
     * Called by VS Code when there are no more references to the document.
     *
     * This happens when all editors for it have been closed.
     */
    dispose() {
        this._onDidDispose.fire();
        super.dispose();
    }
    /**
     * Called when the user edits the document in a webview.
     *
     * This fires an event to notify VS Code that the document has been edited.
     */
    makeEdit(edit) {
        this._edits.push(edit);
        this._onDidChange.fire({
            label: 'Stroke',
            undo: async () => {
                this._edits.pop();
                this._onDidChangeDocument.fire({
                    edits: this._edits,
                });
            },
            redo: async () => {
                this._edits.push(edit);
                this._onDidChangeDocument.fire({
                    edits: this._edits,
                });
            }
        });
    }
    /**
     * Called by VS Code when the user saves the document.
     */
    async save(cancellation) {
        await this.saveAs(this.uri, cancellation);
        this._savedEdits = Array.from(this._edits);
    }
    /**
     * Called by VS Code when the user saves the document to a new location.
     */
    async saveAs(targetResource, cancellation) {
        const fileData = await this._delegate.getFileData();
        if (cancellation.isCancellationRequested) {
            return;
        }
        await vscode.workspace.fs.writeFile(targetResource, fileData);
    }
    /**
     * Called by VS Code when the user calls `revert` on a document.
     */
    async revert(_cancellation) {
        const diskContent = await ExplanDocument.readFile(this.uri);
        this._documentData = diskContent;
        this._edits = this._savedEdits;
        this._onDidChangeDocument.fire({
            content: diskContent,
            edits: this._edits,
        });
    }
    /**
     * Called by VS Code to backup the edited document.
     *
     * These backups are used to implement hot exit.
     */
    async backup(destination, cancellation) {
        await this.saveAs(destination, cancellation);
        return {
            id: destination.toString(),
            delete: async () => {
                try {
                    await vscode.workspace.fs.delete(destination);
                }
                catch {
                    // noop
                }
            }
        };
    }
}
/**
 * Provider for paw draw editors.
 *
 * Paw draw editors are used for `.pawDraw` files, which are just `.png` files with a different file extension.
 *
 * This provider demonstrates:
 *
 * - How to implement a custom editor for binary files.
 * - Setting up the initial webview for a custom editor.
 * - Loading scripts and styles in a custom editor.
 * - Communication between VS Code and the custom editor.
 * - Using CustomDocuments to store information that is shared between multiple custom editors.
 * - Implementing save, undo, redo, and revert.
 * - Backing up a custom editor.
 */
class ExplanEditorProvider {
    _context;
    static newPawDrawFileId = 1;
    static register(context) {
        vscode.commands.registerCommand(ExplanEditorProvider.viewType + '.new', () => {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage("Creating new Paw Draw files currently requires opening a workspace");
                return;
            }
            const uri = vscode.Uri.joinPath(workspaceFolders[0].uri, `new-${ExplanEditorProvider.newPawDrawFileId++}.explan.json`)
                .with({ scheme: 'untitled' });
            vscode.commands.executeCommand('vscode.openWith', uri, ExplanEditorProvider.viewType);
        });
        return vscode.window.registerCustomEditorProvider(ExplanEditorProvider.viewType, new ExplanEditorProvider(context), {
            // For this demo extension, we enable `retainContextWhenHidden` which keeps the
            // webview alive even when it is not visible. You should avoid using this setting
            // unless is absolutely required as it does have memory overhead.
            webviewOptions: {
                retainContextWhenHidden: true,
            },
            supportsMultipleEditorsPerDocument: false,
        });
    }
    static viewType = 'explan.editor';
    /**
     * Tracks all known webviews
     */
    webviews = new WebviewCollection();
    constructor(_context) {
        this._context = _context;
    }
    //#region CustomEditorProvider
    async openCustomDocument(uri, openContext, _token) {
        const document = await ExplanDocument.create(uri, openContext.backupId, {
            getFileData: async () => {
                const webviewsForDocument = Array.from(this.webviews.get(document.uri));
                if (!webviewsForDocument.length) {
                    throw new Error('Could not find webview to save for');
                }
                const panel = webviewsForDocument[0];
                const response = await this.postMessageWithResponse(panel, 'getFileData', {});
                const encoder = new TextEncoder();
                //	return new Uint8Array(response);
                return encoder.encode("{}");
            }
        });
        const listeners = [];
        listeners.push(document.onDidChange(e => {
            // Tell VS Code that the document has been edited by the use.
            this._onDidChangeCustomDocument.fire({
                document,
                ...e,
            });
        }));
        listeners.push(document.onDidChangeContent(e => {
            // Update all webviews when the document changes
            for (const webviewPanel of this.webviews.get(document.uri)) {
                this.postMessage(webviewPanel, 'update', {
                    edits: e.edits,
                    content: e.content,
                });
            }
        }));
        document.onDidDispose(() => (0, dispose_1.disposeAll)(listeners));
        return document;
    }
    async resolveCustomEditor(document, webviewPanel, _token) {
        // Add the webview to our internal set of active webviews
        this.webviews.add(document.uri, webviewPanel);
        // Setup initial content for the webview
        webviewPanel.webview.options = {
            enableScripts: true,
        };
        webviewPanel.webview.html = await this.getHtmlForWebview(webviewPanel.webview);
        webviewPanel.webview.onDidReceiveMessage(e => this.onMessage(document, e));
        // Wait for the webview to be properly ready before we init
        webviewPanel.webview.onDidReceiveMessage(e => {
            if (e.type === 'ready') {
                if (document.uri.scheme === 'untitled') {
                    this.postMessage(webviewPanel, 'init', {
                        untitled: true,
                        editable: true,
                    });
                }
                else {
                    const editable = vscode.workspace.fs.isWritableFileSystem(document.uri.scheme);
                    this.postMessage(webviewPanel, 'init', {
                        value: document.documentData,
                        editable,
                    });
                }
            }
        });
    }
    _onDidChangeCustomDocument = new vscode.EventEmitter();
    onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;
    saveCustomDocument(document, cancellation) {
        return document.save(cancellation);
    }
    saveCustomDocumentAs(document, destination, cancellation) {
        return document.saveAs(destination, cancellation);
    }
    revertCustomDocument(document, cancellation) {
        return document.revert(cancellation);
    }
    backupCustomDocument(document, context, cancellation) {
        return document.backup(context.destination, cancellation);
    }
    //#endregion
    /**
     * Get the static html used for the editor webviews.
     */
    async getHtmlForWebview(webview) {
        const body = await vscode.workspace.fs.readFile(vscode.Uri.joinPath(this._context.extensionUri, 'src', 'media', 'merged.html'));
        return body.toString();
    }
    _requestId = 1;
    _callbacks = new Map();
    postMessageWithResponse(panel, type, body) {
        const requestId = this._requestId++;
        const p = new Promise(resolve => this._callbacks.set(requestId, resolve));
        panel.webview.postMessage({ type, requestId, body });
        return p;
    }
    postMessage(panel, type, body) {
        panel.webview.postMessage({ type, body });
    }
    onMessage(document, message) {
        switch (message.type) {
            case 'stroke':
                document.makeEdit(message);
                return;
            case 'response':
                {
                    const callback = this._callbacks.get(message.requestId);
                    callback?.(message.body);
                    return;
                }
        }
    }
}
exports.ExplanEditorProvider = ExplanEditorProvider;
/**
 * Tracks all webviews.
 */
class WebviewCollection {
    _webviews = new Set();
    /**
     * Get all known webviews for a given uri.
     */
    *get(uri) {
        const key = uri.toString();
        for (const entry of this._webviews) {
            if (entry.resource === key) {
                yield entry.webviewPanel;
            }
        }
    }
    /**
     * Add a new webview to the collection.
     */
    add(uri, webviewPanel) {
        const entry = { resource: uri.toString(), webviewPanel };
        this._webviews.add(entry);
        webviewPanel.onDidDispose(() => {
            this._webviews.delete(entry);
        });
    }
}
function activate(context) {
    context.subscriptions.push(ExplanEditorProvider.register(context));
}
//# sourceMappingURL=extension.js.map