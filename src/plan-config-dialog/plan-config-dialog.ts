import { TemplateResult, html, render } from "lit-html";
import { ExplanMain } from "../explanMain/explanMain";
import { dateDisplay } from "../date-control-utils/date-control-utils";
import { executeOp } from "../action/execute";
import { SetPlanStartStateOp } from "../ops/plan";

export class PlanConfigDialog extends HTMLElement {
  explanMain: ExplanMain | null = null;
  planDefinitionChangedCallback: () => void;

  constructor() {
    super();
    this.planDefinitionChangedCallback = () => {
      if (this.explanMain !== null) {
        this.render();
      }
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

  private render() {
    render(this.template(), this);
  }

  showModal(explanMain: ExplanMain) {
    this.explanMain = explanMain;
    this.render();
    this.querySelector<HTMLDialogElement>("dialog")!.showModal();
  }

  private cancel() {
    this.querySelector<HTMLDialogElement>("dialog")!.close();
  }

  private template(): TemplateResult {
    return html`
      <dialog>
        ${this.unstartedContent()} ${this.startedContent()}
        <div class="dialog-footer">
          <button @click=${() => this.cancel()}>Close</button>
        </div>
      </dialog>
    `;
  }

  private unstartedContent(): TemplateResult {
    if (this.explanMain!.plan.status.stage === "unstarted") {
      return html`
        <label>
          <input type="checkbox" @input=${() => this.start()} /> Started
        </label>
      `;
    } else {
      return html``;
    }
  }

  private startedContent(): TemplateResult {
    if (this.explanMain!.plan.status.stage === "started") {
      return html`
        <label>
          <input type="checkbox" checked @input=${() => this.unstart()} />
          Started
        </label>
        <input
          type="date"
          .value=${dateDisplay(new Date(this.explanMain!.plan.status.start))}
          @input=${(e: InputEvent) => this.dateChanged(e)}
        />
      `;
    } else {
      return html``;
    }
  }

  private async dateChanged(e: InputEvent) {
    const start = (e.target as HTMLInputElement).valueAsDate!.getTime();
    const ret = await executeOp(
      SetPlanStartStateOp({ stage: "started", start: start }),
      "planDefinitionChanged",
      true,
      this.explanMain!
    );
    if (!ret.ok) {
      console.log(ret.error);
    }
    this.render();
  }

  private async start() {
    const start = Date.now();
    const ret = await executeOp(
      SetPlanStartStateOp({ stage: "started", start: start }),
      "planDefinitionChanged",
      true,
      this.explanMain!
    );
    if (!ret.ok) {
      console.log(ret.error);
    }
    this.render();
  }

  private async unstart() {
    const ret = await executeOp(
      SetPlanStartStateOp({ stage: "unstarted", start: 0 }),
      "planDefinitionChanged",
      true,
      this.explanMain!
    );
    if (!ret.ok) {
      console.log(ret.error);
    }
    this.render();
  }
}

customElements.define("plan-config-dialog", PlanConfigDialog);
