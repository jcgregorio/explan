import { TemplateResult, html, render } from "lit-html";
import { AddResourceOp, DeleteResourceOp } from "../ops/resources";
import { executeOp } from "../action/execute";
import { ExplanMain } from "../explanMain/explanMain";
import { EditResourceDefinition } from "../edit-resource-definition/edit-resource-definition";
import { icon } from "../icons/icons";
import { PlanStatus, unstarted } from "../plan_status/plan_status";

// Longest representation we'll show for all the options of a Resource.
const MAX_SHORT_STRING = 80;

export class EditPlanStartDialog extends HTMLElement {
  private status: PlanStatus = unstarted;
  private dialog: HTMLDialogElement | null = null;
  private resolve: (value: PlanStatus | undefined) => void = () => {};

  constructor() {
    super();
  }

  connectedCallback(): void {
    this.render();
    this.dialog = this.querySelector<HTMLDialogElement>("dialog")!;
    this.dialog.addEventListener("cancel", () => this.resolve(undefined));
  }

  start(status: PlanStatus): Promise<PlanStatus | undefined> {
    const ret = new Promise<PlanStatus | undefined>((resolve, _reject) => {
      this.resolve = resolve;
      this.dialog!.showModal();
    });
    return ret;
  }

  private render() {
    render(this.template(), this);
  }

  private close() {
    this.querySelector<HTMLDialogElement>("dialog")!.close();
    this.resolve(this.status);
  }

  private cancel() {
    this.querySelector<HTMLDialogElement>("dialog")!.close();
    this.resolve(undefined);
  }

  private dateControlValue(): string {
    const d = new Date(this.status.start);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDay()}`;
  }

  private startChanged(e: InputEvent) {
    if ((e.target as HTMLInputElement).checked) {
      this.status.stage = "started";
    } else {
      this.status.stage = "unstarted";
    }
    this.render();
  }

  private dateChanged(e: InputEvent) {
    const date = (e.target as HTMLInputElement).valueAsDate;
    if (date === null) {
      this.status.start = 0;
    } else {
      date.setHours(date.getHours() + 12);
      this.status.start = date.getTime();
    }
    this.render();
  }

  private template(): TemplateResult {
    return html`
      <dialog>
        <h3>Plan Status</h3>
        <span>
          <input
            type="checkbox"
            .checked=${this.status.stage === "started"}
            @input=${(e: InputEvent) => this.startChanged(e)}
          />
          Started
        </span>
        <div class="${this.status.stage === "started" ? "" : "hidden"}">
          <input
            type="date"
            value=${this.dateControlValue()}
            @input=${(e: InputEvent) => this.dateChanged(e)}
          />
        </div>
        <div class="dialog-footer">
          <button @click=${() => this.close()}>Cancel</button>
          <button @click=${() => this.close()}>OK</button>
        </div>
      </dialog>
    `;
  }
}

customElements.define("edit-plan-start", EditPlanStartDialog);
