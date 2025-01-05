import { TemplateResult, html, render } from "lit-html";
import { Plan } from "../plan/plan";
import { ResourceDefinition } from "../resources/resources";
import { AddResourceOp, DeleteResourceOp } from "../ops/resources";
import { executeOp } from "../action/execute";
import { ExplanMain } from "../explanMain/explanMain";
import { EditResourceDefinition } from "../edit-resource-definition/edit-resource-definition";
import { icon } from "../icons/icons";

export class EditResourcesDialog extends HTMLElement {
  explanMain: ExplanMain | null = null;
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

  showModal(explanMain: ExplanMain) {
    this.explanMain = explanMain;
    this.render();
    this.querySelector<HTMLDialogElement>("dialog")!.showModal();
  }

  private render() {
    render(this.template(), this);
  }

  private valuesToShortString(values: string[]): string {
    return (
      values
        .map((v: string) => `"${v}"`)
        .join(", ")
        .slice(0, 20) + "..."
    );
  }

  private delButtonIfNotStatic(
    name: string,
    isStatic: boolean
  ): TemplateResult {
    if (isStatic) {
      return html``;
    }
    return html`<button
      class="icon-button"
      title="Delete this resource."
      @click=${() => this.deleteResource(name)}
    >
      ${icon("delete-icon")}
    </button>`;
  }

  private editButtonIfNotStatic(
    name: string,
    isStatic: boolean
  ): TemplateResult {
    if (isStatic) {
      return html``;
    }
    return html`<button
      class="icon-button"
      title="Edit the resource definition."
      @click=${() => this.editResource(name)}
    >
      ${icon("edit-icon")}
    </button>`;
  }

  private async deleteResource(name: string) {
    const ret = await executeOp(
      DeleteResourceOp(name),
      "planDefinitionChanged",
      true,
      this.explanMain!
    );
    if (!ret.ok) {
      console.log(ret.error);
    }
    this.render();
  }

  private close() {
    this.querySelector<HTMLDialogElement>("dialog")!.close();
  }

  private editResource(name: string) {
    this.close();
    this.explanMain!.querySelector<EditResourceDefinition>(
      "edit-resource-definition"
    )!.showModal(
      this.explanMain!,
      name,
      this.explanMain!.plan.resourceDefinitions[name]
    );
  }

  private async newResource() {
    const name = window.prompt("Resource name:", "");
    if (name === null) {
      return;
    }
    const ret = await executeOp(
      AddResourceOp(name),
      "planDefinitionChanged",
      true,
      this.explanMain!
    );
    if (!ret.ok) {
      window.alert(ret.error);
      console.log(ret.error);
    }
    this.render();
  }

  private template(): TemplateResult {
    return html`
      <dialog>
        <h3>Resources</h3>
        <table>
          <tr>
            <th>Name</th>
            <th>Values</th>
            <th>Delete</th>
            <th>Edit</th>
          </tr>
          ${Object.entries(this.explanMain!.plan.resourceDefinitions).map(
            ([name, defn]) => {
              return html`<tr>
                <td>${name}</td>
                <td>${this.valuesToShortString(defn.values)}</td>
                <td>${this.delButtonIfNotStatic(name, defn.isStatic)}</td>
                <td>${this.editButtonIfNotStatic(name, defn.isStatic)}</td>
              </tr>`;
            }
          )}
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td>
              <button
                class="icon-button"
                title="Add a new Resource."
                @click=${() => {
                  this.newResource();
                }}
              >
                ${icon("add-icon")}
              </button>
            </td>
          </tr>
        </table>
        <div class="dialog-footer">
          <button @click=${() => this.close()}>Close</button>
        </div>
      </dialog>
    `;
  }
}

customElements.define("edit-resources-dialog", EditResourcesDialog);
