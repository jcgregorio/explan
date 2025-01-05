import { TemplateResult, html, render } from "lit-html";
import { ResourceDefinition } from "../resources/resources";
import { ExplanMain } from "../explanMain/explanMain";
import { icon } from "../icons/icons";
import { executeOp } from "../action/execute";
import { RenameResourceOp } from "../ops/resources";

export class EditResourceDefinition extends HTMLElement {
  explanMain: ExplanMain | null = null;
  resourceDefinition: ResourceDefinition = new ResourceDefinition();
  name: string = "";
  planDefinitionChangedCallback: () => void;

  constructor() {
    super();
    this.planDefinitionChangedCallback = () => {
      this.render();
    };
  }

  connectedCallback(): void {
    document.addEventListener(
      "plan-definition-changed",
      this.planDefinitionChangedCallback
    );
  }

  disconnectedCallback(): void {
    document.removeEventListener(
      "plan-definition-changed",
      this.planDefinitionChangedCallback
    );
  }

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

  private async changeResourceName(newName: string, oldName: string) {
    const ret = await executeOp(
      RenameResourceOp(oldName, newName),
      "planDefinitionChanged",
      true,
      this.explanMain!
    );
    if (!ret.ok) {
      console.log(ret.error);
    }
  }

  private async newResourceValue() {}
  private async moveUp(value: string, valueIndex: number) {}
  private async moveDown(value: string, valueIndex: number) {}
  private async moveToTop(value: string, valueIndex: number) {}
  private async moveToBottom(value: string, valueIndex: number) {}
  private async deleteResourceValue(value: string, valueIndex: number) {}

  // SVG icons copied from https://github.com/marella/material-design-icons/blob/main/svg/filled/.
  private template(): TemplateResult {
    return html`
      <dialog>
        <label>
          Name:
          <input
            type="text"
            .value=${this.name}
            data-old-name=${this.name}
            @change=${(e: Event) => {
              const ele = e.target as HTMLInputElement;
              this.changeResourceName(ele.value, ele.dataset.oldName || "");
            }}
          />
        </label>
        <table>
          ${this.resourceDefinition.values.map(
            (value: string, valueIndex: number) => {
              return html`<tr>
                <td><input .value=${value} type="text" /></td>
                <td>
                  <button
                    class="icon-button"
                    @click=${() => this.moveUp(value, valueIndex)}
                  >
                    ${icon("keyboard-up-icon")}
                  </button>
                </td>
                <td>
                  <button
                    class="icon-button"
                    @click=${() => this.moveDown(value, valueIndex)}
                  >
                    ${icon("keyboard-down-icon")}
                  </button>
                </td>
                <td>
                  <button
                    class="icon-button"
                    @click=${() => this.moveToTop(value, valueIndex)}
                  >
                    ${icon("keyboard-double-up-icon")}
                  </button>
                </td>
                <td>
                  <button
                    class="icon-button"
                    @click=${() => this.moveToBottom(value, valueIndex)}
                  >
                    ${icon("keyboard-double-down-icon")}
                  </button>
                </td>
                <td>
                  <button
                    class="icon-button"
                    @click=${() => this.deleteResourceValue(value, valueIndex)}
                  >
                    ${icon("delete-icon")}
                  </button>
                </td>
              </tr>`;
            }
          )}
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
