import { TemplateResult, html, render } from "lit-html";
import { ExplanMain } from "../explanMain/explanMain";
import { generateRandomPlan } from "../generate/generate";

export class DeveloperPanelDialog extends HTMLElement {
  private explanMain: ExplanMain | null = null;

  private render() {
    render(this.template(), this);
  }

  private template(): TemplateResult {
    return html`
      <dialog>
        <button @click=${() => this.generateRandomPlan()}>Generate</button>
        <button @click=${() => this.explanMain!.toggleTopTimeline()}>
          Toggle Top Timeline
        </button>
        <div class="dialog-footer">
          <button @click=${() => this.cancel()}>Close</button>
        </div>
      </dialog>
    `;
  }

  generateRandomPlan() {
    this.explanMain!.plan = generateRandomPlan();
    this.explanMain!.planDefinitionHasBeenChanged();
  }

  cancel() {
    this.querySelector("dialog")!.close();
  }

  showDialog(explanMain: ExplanMain) {
    this.explanMain = explanMain;
    this.render();
    this.querySelector("dialog")!.showModal();
  }
}

customElements.define("developer-panel", DeveloperPanelDialog);
