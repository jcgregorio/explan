import { TemplateResult, html, render } from "lit-html";
import { ExplanMain } from "../explanMain/explanMain";

declare global {
  interface GlobalEventHandlersEventMap {
    "group-by-resource-changed": CustomEvent<string>;
  }
}

export class GroupByControl extends HTMLElement {
  explanMain: ExplanMain | null = null;

  /** All of the types of resources in the plan. */
  groupByOptions: string[] = [];

  selectedGroupBy: string = "";

  planDefinitionChangedCallback: () => void;

  constructor() {
    super();
    this.planDefinitionChangedCallback = () => {
      if (this.explanMain !== null) {
        this.populateGroupBy();
        this.render();
      }
    };
  }

  populateGroupBy() {
    const plan = this.explanMain?.plan;
    if (plan === undefined) {
      return;
    }
    this.groupByOptions = ["", ...Object.keys(plan.resourceDefinitions)];
    if (!this.groupByOptions.includes(this.selectedGroupBy)) {
      this.selectedGroupBy = "";
    }
  }

  connectedCallback(): void {
    document.addEventListener(
      "plan-definition-changed",
      this.planDefinitionChangedCallback,
    );
  }

  disconnectedCallback(): void {
    document.removeEventListener(
      "plan-definition-changed",
      this.planDefinitionChangedCallback,
    );
  }

  private render() {
    render(this.template(), this);
  }

  setConfig(explanMain: ExplanMain) {
    this.explanMain = explanMain;
    this.render();
  }

  // Returns the empty string if no grouping is to be done.
  getSelectedGroup(): string {
    return this.selectedGroupBy;
  }

  groupByChanged(e: InputEvent) {
    this.selectedGroupBy = (e.target as HTMLSelectElement).value;
    this.dispatchEvent(
      new CustomEvent("group-by-resource-changed", {
        bubbles: true,
        detail: this.selectedGroupBy,
      }),
    );
  }

  private template(): TemplateResult {
    return html`
      <select @input=${(e: InputEvent) => this.groupByChanged(e)}>
        ${this.groupByOptions.map((groupBy: string) => {
          const label = groupBy ? groupBy : "(none)";
          return html`<option ?selected=${groupBy === this.selectedGroupBy}>
            ${label}
          </option>`;
        })}
      </select>
    `;
  }
}

customElements.define("groupby-control", GroupByControl);
