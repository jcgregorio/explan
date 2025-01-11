import { TemplateResult, html, render } from "lit-html";
import { ExplanMain } from "../explanMain/explanMain";

export class EditMetricsDialog extends HTMLElement {
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
    return html` <dialog>
      <div class="dialog-footer">
        <button @click=${() => this.cancel()}>Close</button>
      </div>
    </dialog>`;
  }
}

customElements.define("edit-metrics-dialog", EditMetricsDialog);
