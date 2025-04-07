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
const util_1 = require("./util");
/**
 * Provider for Explan editors.
 *
 * Explan editors are used for `.explan.json` files, which are just json files.
 *
 */
class ExplanEditorProvider {
    context;
    static register(context) {
        const provider = new ExplanEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(ExplanEditorProvider.viewType, provider);
        return providerRegistration;
    }
    static viewType = 'explan.editor';
    constructor(context) {
        this.context = context;
    }
    /**
     * Called when our custom editor is opened.
     *
     *
     */
    async resolveCustomTextEditor(document, webviewPanel, _token) {
        // Setup initial content for the webview
        webviewPanel.webview.options = {
            enableScripts: true,
        };
        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);
        function updateWebview() {
            webviewPanel.webview.postMessage({
                type: 'update',
                text: document.getText(),
            });
        }
        // Hook up event handlers so that we can synchronize the webview with the text document.
        //
        // The text document acts as our model, so we have to sync change in the document to our
        // editor and sync changes in the editor back to the document.
        // 
        // Remember that a single text document can also be shared between multiple custom
        // editors (this happens for example when you split a custom editor)
        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                updateWebview();
            }
        });
        // Make sure we get rid of the listener when our editor is closed.
        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });
        // Receive message from the webview.
        webviewPanel.webview.onDidReceiveMessage(e => {
            switch (e.type) {
                case 'add':
                    this.addNewScratch(document);
                    return;
                case 'delete':
                    this.deleteScratch(document, e.id);
                    return;
            }
        });
        updateWebview();
    }
    /**
     * Get the static html used for the editor webviews.
     */
    getHtmlForWebview(webview) {
        // Local path to script and css for the webview
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'media', 'page.js'));
        // Use a nonce to whitelist which scripts can be run
        const nonce = (0, util_1.getNonce)();
        return `
<!DOCTYPE html>
<html lang="en">
<head>


	<meta charset="UTF-8">

	
	
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Explan</title>

    <style>
      body {
        --font: Roboto, Arial, 'Bitstream Vera Sans', sans-serif;
        --mono-font: Roboto Mono, monospace;

        background: var(--background);
        color: var(--on-background);
        margin: 0;
      }

      * {
        font-size: 14px;
        font-family: var(--font);
        box-sizing: border-box;
      }

      code,
      pre {
        font-family: var(--mono-font);
      }

      body.resizing {
        user-select: none;
      }

      select,
      option {
        border-radius: 4px;
        margin: 4px 2px;
        padding: 4px 4px;
        background-color: var(--surface);
        color: var(--on-surface);
        fill: var(--on-surface);
        line-height: 20px;
        vertical-align: middle;
      }

      select {
        border: solid 1px var(--on-surface);
        border-radius: 4px;
      }

      option:hover {
        background-color: var(--surface-1dp);
      }

      option:focus {
        background-color: var(--primary);
        color: var(--on-primary);
        transition: background-color 0.1s cubic-bezier(0.4, 0, 0.2, 1);
      }

      option:checked {
        background-color: var(--primary);
        color: var(--on-primary);
        fill: var(--on-primary);
      }

      select {
        overflow-y: auto;
      }

      .input-like,
      input {
        border: solid 1px var(--on-surface);
        color: var(--on-surface);
        background: var(--surface);
        display: inline-block;
        border-radius: 4px;
        margin: 4px 2px;
        padding: 4px 4px;
      }

      .button-like,
      button {
        align-items: center;
        background: transparent;
        border-radius: 4px;
        border: solid 1px var(--on-surface);
        box-shadow: none;
        color: var(--on-surface);
        display: inline-flex;
        fill: var(--on-surface);
        font-size: 14px;
        height: 24px;
        justify-content: center;
        margin: 4px 2px;
        min-width: auto;
        padding: 0 4px;
        text-align: center;
        text-transform: none;

        svg {
          width: 20px;
          height: 20px;
        }
      }

      .button-like:hover,
      button.hover,
      button:hover,
      .button-like:focus,
      button.focus,
      button:focus {
        opacity: 0.85;
        outline: none;
        background-color: var(--surface-1dp);
      }

      .button-like:disabled,
      button:disabled {
        opacity: 0.85;
        background: var(--on-disabled);
        color: var(--disabled);
        fill: var(--disabled);
      }

      .button-like-action,
      .button-like.action,
      button.action {
        color: var(--on-primary);
        fill: var(--on-primary);
        border: none;
        background-color: var(--primary);
      }

      .button-like.action:hover,
      button.action.hover,
      button.action:hover {
        opacity: 0.85;
      }

      .button-like.action:disabled,
      button.action.disabled,
      button.action:disabled {
        opacity: 0.85;
        background: var(--on-disabled);
        color: var(--disabled);
        fill: var(--disabled);
      }

      chart-parent {
        grid-area: chart;
        overflow-y: scroll;
        scrollbar-color: var(--transparent-overlay) rgb(0, 0, 0, 0);
      }

      timeline-parent {
        grid-area: timeline;
        overflow-y: scroll;
        scrollbar-color: rgb(0, 0, 0, 0) rgb(0, 0, 0, 0);
      }

      #overlay {
        position: absolute;
        top: 0;
        left: 0;
      }

      vertical-divider {
        grid-area: vertical-divider;
        display: flex;
        flex-direction: column;
        cursor: col-resize;
        justify-content: center;

        divider-thumb {
          display: inline-block;
          background:
            linear-gradient(315deg, transparent 75%, #414141 0)-10px 0,
            linear-gradient(45deg, transparent 75%, #d1d1d1 0)-10px 0,
            linear-gradient(135deg, #b1b1b1 50%, transparent 0) 0 0,
            linear-gradient(45deg, #515050 50%, #2d2d2d 0) 0 0 #313030;
          background-size: 4px 4px;
          height: 40px;
        }
      }

      panels-parent {
        grid-area: panels;

        ul li {
          cursor: pointer;
        }
      }

      header {
        grid-area: header;
      }

      footer {
        grid-area: footer;
      }

      explan-main {
        display: grid;
        grid-gap: 0;
        grid-template-columns: 70% 10px auto;
        grid-template-rows: auto auto 1fr auto;
        grid-template-areas:
          'header   header           header'
          'timeline vertical-divider panels'
          'chart    vertical-divider panels'
          'footer   footer           footer';

        width: 100vw;
        height: 100vh;
        margin: 0;
        padding: 0;
        position: absolute;
      }

      error-popup {
        padding: 16px;
        border: solid 1px;
        border-radius: 8px;
        display: flex;
        position: absolute;
        bottom: 16px;
        left: 16px;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        animation-name: popup;
        animation-duration: 0.5s;
      }

      @keyframes popup {
        from {
          bottom: 0;
        }

        to {
          bottom: 16px;
        }
      }

      chart-parent,
      timeline-parent,
      radar-parent,
      chart-parent {
        display: flex;
        position: relative;
      }

      search-task-panel {
        border-bottom: solid 1px var(--on-surface-muted);
        display: block;
      }

      selected-task-panel,
      dependencies-panel,
      simulation-panel {
        display: block;
        padding: 8px;
      }

      panels-parent {
        display: block;

        tab-buttons {
          display: block;
          padding-left: 12px;

          button {
            opacity: 0.7;
          }

          button.selected {
            opacity: 1;
          }
        }

        tab-panel {
          display: block;
          background-color: var(--surface);
          margin-top: 0;
          padding: 12px;
          border-radius: 12px;
          margin: 8px 16px 8px 8px;

          h3 {
            margin-top: 0;
          }
        }
      }

      nav {
        display: flex;
        padding: 8px;
        justify-content: space-between;

        button.icon-button {
          background: var(--background);
          border: none;
        }
      }

      .hidden {
        display: none;
      }

      button[disabled] {
        color: var(--disabled);
        fill: var(--disabled);
      }

      task-search-control {
        ul {
          list-style-type: none;
          padding-inline-start: 4px;

          li {
            font-family: 'Courier New', Courier, monospace;

            b {
              color: var(--primary);
            }
          }

          li[data-focus] {
            color: var(--primary);
          }

          li:hover {
            text-decoration: underline;
          }
        }

        ul {
          display: none;
        }

        &:focus-within ul {
          display: block;
        }
      }

      dependencies-panel {
        display: block;

        th {
          text-align: left;
        }

        button.delete {
          border-radius: 2px;
          border: solid 1px var(--surface);
          background: var(--surface);
          color: var(--on-surface);

          &:hover {
            border: solid 1px var(--on-surface-muted);
          }

          &:active {
            background: var(--surface-1dp);
          }
        }
      }

      simulation-panel {
        .added {
          color: var(--added);
        }

        .removed {
          color: var(--removed);
        }

        table.paths td {
          cursor: pointer;
        }
      }

      edit-metrics-panel,
      edit-resources-panel {
        td,
        th {
          padding: 8px;
          text-align: left;
        }
      }

      .icon-button {
        background-color: var(--surface);
        border-radius: 2px;
        border: solid 1px var(--surface);
        background: var(--surface);
        color: var(--on-surface);
        fill: var(--on-surface-muted);

        &:hover {
          border: dashed 1px var(--on-surface-muted);
        }

        &:active {
          background: var(--surface-1dp);
        }
      }

      dialog {
        background: var(--surface);
        color: var(--on-surface);

        .dialog-footer {
          display: flex;
          flex-direction: row;
          justify-content: right;
          padding: 16px 0 0 0;
        }
      }

      .underline-first-char:first-letter {
        text-decoration: underline;
      }

      body {
        --primary: #2067c3;
        --on-primary: #ffffff;
        --primary-variant: rgba(59, 114, 177, 0.2);
        --on-primary-variant: #000000;
        --secondary: #d84315;
        --on-secondary: #000000;
        --background: #fafafa;
        --on-background: #000000;
        --surface: #ffffff;
        --on-surface: #000000;
        --on-surface-muted: hsl(0, 0%, 24%);
        --surface-1dp: #eee;
        --surface-2dp: #bdbdbd;
        --disabled: #f5f5f5;
        --on-disabled: #616161;
        --error: #b71c1c;
        --on-error: #ffffff;
        --transparent-overlay: rgba(0, 0, 0, 0.25);
        --group-color: rgba(90, 206, 6, 0.15);

        --added: rgba(24, 132, 47);
        --removed: rgba(175, 15, 29);
      }

      body.darkmode {
        --primary: rgb(32, 114, 195);
        --on-primary: #000000;
        --primary-variant: rgba(59, 114, 177, 0.2);
        --on-primary-variant: #ffffff;
        --secondary: #80cbc4;
        --on-secondary: #000000;
        --background: #000000;
        --on-background: #ffffff;
        --surface: #0f0f0f;
        --surface-1dp: #424242;
        --surface-2dp: #616161;
        --disabled: #757575;
        --on-disabled: #e0e0e0;
        --on-surface: #ffffff;
        --on-surface-muted: hsl(0, 0%, 74%);
        --error: #ec407a;
        --on-error: #000000;
        --transparent-overlay: rgba(255, 255, 255, 0.1);
        --group-color: rgba(89, 206, 6, 0.1);

        --added: rgb(36, 180, 67);
        --removed: rgb(227, 22, 39);
      }
    </style>
  </head>

  <body class="darkmode">
    <!-- These are hidden because they are never displayed, but used as templates
    for actual icons via the <use> tag. See /icons/icons.ts.

    Icons copied from https://github.com/marella/material-design-icons/blob/main/svg/filled/.
    View all icons here: https://fonts.google.com/icons
    -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      style="display: none"
    >
      <path
        id="delete-icon"
        d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"
      />
      <path
        id="edit-icon"
        d="m14.06 9.02.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83a.996.996 0 0 0 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"
      />
      <path
        id="keyboard-up-icon"
        d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"
      />
      <path
        id="keyboard-down-icon"
        d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"
      />
      <g id="keyboard-double-up-icon">
        <path d="M6 17.59 7.41 19 12 14.42 16.59 19 18 17.59l-6-6z" />
        <path d="m6 11 1.41 1.41L12 7.83l4.59 4.58L18 11l-6-6z" />
      </g>
      <g id="keyboard-double-down-icon">
        <path d="M18 6.41 16.59 5 12 9.58 7.41 5 6 6.41l6 6z" />
        <path d="m18 13-1.41-1.41L12 16.17l-4.59-4.58L6 13l6 6z" />
      </g>
      <path id="add-icon" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
      <path id="check" d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      <path
        id="dup"
        d="M18 4v5H6V4h12m0-2H6c-1.1 0-2 .9-2 2v5c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 13v5H6v-5h12m0-2H6c-1.1 0-2 .9-2 2v5c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-5c0-1.1-.9-2-2-2z"
      />
      <g id="split">
        <path
          d="M 0.046875 7.65625 L 0.046875 9.65625 L 9.4003906 9.65625 L 9.4003906 14.65625 L 0.046875 14.65625 L 0.046875 16.65625 L 9.4003906 16.65625 C 10.50039 16.65625 11.400391 15.756249 11.400391 14.65625 L 11.400391 9.65625 C 11.400391 8.5562511 10.50039 7.65625 9.4003906 7.65625 L 0.046875 7.65625 z "
        />
        <path
          d="M 15.429688 7.6289062 C 14.329689 7.6289062 13.429688 8.5289073 13.429688 9.6289062 L 13.429688 14.628906 C 13.429688 15.728905 14.329689 16.628906 15.429688 16.628906 L 24.046875 16.628906 L 24.046875 14.628906 L 15.429688 14.628906 L 15.429688 9.6289062 L 24.046875 9.6289062 L 24.046875 7.6289062 L 15.429688 7.6289062 z "
        />
      </g>
      <!-- dup -->
    </svg>
    <explan-main>
      <header>
        <nav>
          <span>
            <label> Group by <groupby-control></groupby-control> </label>
            <label>
              <input type="checkbox" id="radar-toggle" checked />
              Show radar.
            </label>
            <label>
              <input type="checkbox" id="critical-paths-toggle" />
              Only show critical paths
            </label>
            <a id="download" download="plan.json" href="">Download</a>
            <label> Upload <input type="file" id="file-upload" /></label>
          </span>
          <button
            id="dark-mode-toggle"
            class="icon-button"
            title="Toggle between light mode and dark mode."
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                id="invert-colors"
                d="M12 4.81V19c-3.31 0-6-2.63-6-5.87 0-1.56.62-3.03 1.75-4.14L12 4.81M6.35 7.56C4.9 8.99 4 10.96 4 13.13 4 17.48 7.58 21 12 21s8-3.52 8-7.87c0-2.17-.9-4.14-2.35-5.57L12 2 6.35 7.56z"
              />
            </svg>
          </button>
        </nav>
        <radar-parent>
          <canvas id="radar" width="1000" height="1000"></canvas>
        </radar-parent>
      </header>
      <timeline-parent>
        <canvas id="timeline" width="1000" height="1000"></canvas>
      </timeline-parent>
      <chart-parent>
        <canvas id="zoomed" width="1000" height="1000"></canvas>
        <canvas id="overlay" width="1000" height="1000"></canvas>
      </chart-parent>
      <vertical-divider>
        <divider-thumb></divider-thumb>
      </vertical-divider>
      <panels-parent>
        <tab-buttons>
          <button data-target="task-tab" class="selected">Task</button>
          <button data-target="project-tab">Project</button>
          <button data-target="simulate-tab">Simulation</button>
        </tab-buttons>
        <tab-panel id="task-tab">
          <search-task-panel class="hidden">
            <task-search-control></task-search-control>
          </search-task-panel>
          <selected-task-panel> </selected-task-panel>
          <task-completion-panel> </task-completion-panel>
          <dependencies-panel> </dependencies-panel>
        </tab-panel>
        <tab-panel id="project-tab" class="hidden">
          <plan-config-panel> </plan-config-panel>
          <edit-resources-panel> </edit-resources-panel>
          <edit-metrics-panel> </edit-metrics-panel>
        </tab-panel>
        <tab-panel id="simulate-tab" class="hidden">
          <button id="simulate">Simulate</button>
          <simulation-panel> </simulation-panel>
        </tab-panel>
      </panels-parent>
      <footer>Footer</footer>
      <keyboard-map-dialog> </keyboard-map-dialog>
      <add-dependency-dialog>
        <dialog>
          <h2>Predecessor/Successor</h2>
          <task-search-control></task-search-control>
        </dialog>
      </add-dependency-dialog>
      <edit-resource-definition> </edit-resource-definition>
      <edit-metric-definition> </edit-metric-definition>
      <developer-panel> </developer-panel>
      <error-popup class="hidden"> </error-popup>
    </explan-main>
	<script type="module" nonce="${nonce}" src="${scriptUri}"></script>

  </body>
</html>`;
    }
    /**
     * Add a new scratch to the current document.
     */
    addNewScratch(document) {
        const json = this.getDocumentAsJson(document);
        return this.updateTextDocument(document, json);
    }
    /**
     * Delete an existing scratch from a document.
     */
    deleteScratch(document, id) {
        const json = this.getDocumentAsJson(document);
        return this.updateTextDocument(document, json);
    }
    /**
     * Try to get a current document as json text.
     */
    getDocumentAsJson(document) {
        const text = document.getText();
        if (text.trim().length === 0) {
            return {};
        }
        try {
            return JSON.parse(text);
        }
        catch {
            throw new Error('Could not get document as json. Content is not valid json');
        }
    }
    /**
     * Write out the json to a given document.
     */
    updateTextDocument(document, json) {
        const edit = new vscode.WorkspaceEdit();
        // Just replace the entire document every time for this example extension.
        // A more complete extension should compute minimal edits instead.
        edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), JSON.stringify(json, null, 2));
        return vscode.workspace.applyEdit(edit);
    }
}
exports.ExplanEditorProvider = ExplanEditorProvider;
function activate(context) {
    // Register our custom editor providers
    context.subscriptions.push(ExplanEditorProvider.register(context));
}
//# sourceMappingURL=extension.js.map