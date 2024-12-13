import { html, render } from "lit-html";
import { KeyMap } from "../keymap/keymap.ts";
import { ActionRegistry } from "../action/registry";

class KeyboardMapDialog extends HTMLElement {
  connectedCallback(): void {
    const keymapEntries = [...KeyMap.entries()];
    keymapEntries.sort();
    render(
      html`
        <dialog>
          <table>
            ${keymapEntries.map(
              ([key, actionName]) =>
                html`<tr>
                  <td>${key}</td>
                  <td>${ActionRegistry[actionName].description}</td>
                </tr>`
            )}
          </table>
        </dialog>
      `,
      this
    );
  }

  showModal() {
    this.querySelector<HTMLDialogElement>("dialog")!.showModal();
  }
}

customElements.define("keyboard-map-dialog", KeyboardMapDialog);
