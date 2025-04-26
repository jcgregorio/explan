import { TemplateResult, html, render } from 'lit-html';
import { ExplanMain } from '../explanMain/explanMain';
import { generateRandomPlan } from '../generate/generate';
import { getStacks } from '../action/execute';
import { Action } from '../action/action';

export class DeveloperPanelDialog extends HTMLElement {
  private explanMain: ExplanMain | null = null;

  private render() {
    render(this.template(), this);
  }

  private template(): TemplateResult {
    const [undoStack, redoStack] = getStacks();
    return html`
      <dialog>
        <button @click=${() => this.generateRandomPlan()}>Generate</button>
        <button @click=${() => this.explanMain!.toggleTopTimeline()}>
          Toggle Top Timeline
        </button>
        <section>
          <h3>Undo</h3>
          <ul>
            ${undoStack.map(
              (action: Action) => html`<li>${action.description}</li>`
            )}
          </ul>
          <h3>Redo</h3>
          <ul>
            ${redoStack.map(
              (action: Action) => html`<li>${action.description}</li>`
            )}
          </ul>
        </section>
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
    this.querySelector('dialog')!.close();
  }

  showDialog(explanMain: ExplanMain) {
    this.explanMain = explanMain;
    this.render();
    this.querySelector('dialog')!.showModal();
  }
}

customElements.define('developer-panel', DeveloperPanelDialog);
