import { TemplateResult, html, render } from "lit-html";
import { ResourceDefinition } from "../resources/resources";
import { ExplanMain } from "../explanMain/explanMain";

export class EditResourceDefinition extends HTMLElement {
  explanMain: ExplanMain | null = null;
  resourceDefinition: ResourceDefinition = new ResourceDefinition();
  name: string = "";

  connectedCallback(): void {}

  showModal(
    explanMain: ExplanMain,
    name: string,
    resourceDefinition: ResourceDefinition
  ) {
    this.explanMain = explanMain;
    this.resourceDefinition = resourceDefinition;
    this.name = name;
    this.render();
    this.querySelector<HTMLDialogElement>("dialog")!.showModal();
  }

  private render() {
    render(this.template(), this);
  }

  private cancel() {
    this.querySelector<HTMLDialogElement>("dialog")!.close();
  }

  private changeResourceName(newName: string) {}
  private newResourceValue() {}

  // SVG icons copied from https://github.com/marella/material-design-icons/blob/main/svg/filled/.
  private template(): TemplateResult {
    return html`
      <dialog>
        <label>
          Name:
          <input
            type="text"
            .value=${this.name}
            @change=${(e: Event) =>
              this.changeResourceName((e.target as HTMLInputElement).value)}
          />
        </label>
        <table>
          ${this.resourceDefinition.values.map((value: string) => {
            return html`<tr>
              <td><input .value=${value} type="text" /></td>
              <td>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
                </svg>
              </td>
              <td>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"
                  />
                </svg>
              </td>
              <td>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 17.59 7.41 19 12 14.42 16.59 19 18 17.59l-6-6z" />
                  <path d="m6 11 1.41 1.41L12 7.83l4.59 4.58L18 11l-6-6z" />
                </svg>
              </td>
              <td>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 6.41 16.59 5 12 9.58 7.41 5 6 6.41l6 6z" />
                  <path d="m18 13-1.41-1.41L12 16.17l-4.59-4.58L6 13l6 6z" />
                </svg>
              </td>
              <td>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                  />
                </svg>
              </td>
            </tr>`;
          })}
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td>
              <button
                @click=${() => {
                  this.newResourceValue();
                }}
              >
                New
              </button>
            </td>
          </tr>
        </table>
        <div class="dialog-footer">
          <button @click=${() => this.cancel()}>Close</button>
        </div>
      </dialog>
    `;
  }
}

customElements.define("edit-resource-definition", EditResourceDefinition);
