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
  private moveUp(value: string) {}
  private moveDown(value: string) {}
  private moveToTop(value: string) {}
  private moveToBottom(value: string) {}
  private deleteResourceValue(value: string) {}

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
                <button class="icon-button" @click=${() => this.moveUp(value)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <use href="#keyboard-up-icon" />
                  </svg>
                </button>
              </td>
              <td>
                <button
                  class="icon-button"
                  @click=${() => this.moveDown(value)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <use href="#keyboard-down-icon" />
                  </svg>
                </button>
              </td>
              <td>
                <button
                  class="icon-button"
                  @click=${() => this.moveToTop(value)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <use href="#keyboard-double-up-icon" />
                  </svg>
                </button>
              </td>
              <td>
                <button
                  class="icon-button"
                  @click=${() => this.moveToBottom(value)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <use href="#keyboard-double-down-icon" />
                  </svg>
                </button>
              </td>
              <td>
                <button
                  class="icon-button"
                  @click=${() => this.deleteResourceValue(value)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <use href="#delete-icon" />
                  </svg>
                </button>
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
