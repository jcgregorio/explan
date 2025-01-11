import { TemplateResult, html, render } from "lit-html";
import { ExplanMain } from "../explanMain/explanMain";

export class EditMetricDefinition extends HTMLElement {
  explanMain: ExplanMain | null = null;
  metricName: string = "";
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

  private template(): TemplateResult {
    return html`<dialog>TBD</dialog>`;
  }

  public showModal(explanMain: ExplanMain, metricName: string) {
    this.explanMain = explanMain;
    this.metricName = metricName;
    this.render();
    this.querySelector<HTMLDialogElement>("dialog")!.showModal();
  }
}

customElements.define("edit-metric-definition", EditMetricDefinition);
