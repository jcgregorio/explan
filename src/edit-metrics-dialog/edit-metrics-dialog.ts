import { TemplateResult, html, render } from "lit-html";
import { ExplanMain } from "../explanMain/explanMain";
import { icon } from "../icons/icons";
import { displayValue } from "../metrics/range";
import { executeOp } from "../action/execute";
import { AddMetricOp, DeleteMetricOp } from "../ops/metrics";
import { MetricDefinition } from "../metrics/metrics";
import { EditMetricDefinition } from "../edit-metric-definition/edit-metric-definition";

export class EditMetricsDialog extends HTMLElement {
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
    return html` <dialog>
      <table>
        <tr>
          <th>Name</th>
          <th>Min</th>
          <th>Max</th>
          <th>Default</th>
          <th></th>
          <th></th>
        </tr>

        ${Object.entries(this.explanMain!.plan.metricDefinitions).map(
          ([metricName, metricDefn]) => {
            return html`
              <tr>
                <td>${metricName}</td>
                <td>${displayValue(metricDefn.range.min)}</td>
                <td>${displayValue(metricDefn.range.max)}</td>
                <td>${metricDefn.default}</td>
                <td>
                  ${this.delButtonIfNotStatic(metricName, metricDefn.isStatic)}
                </td>
                <td>
                  ${this.editButtonIfNotStatic(metricName, metricDefn.isStatic)}
                </td>
              </tr>
            `;
          }
        )}
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td>
            <button
              class="icon-button"
              title="Add a new Resource."
              @click=${() => {
                this.newMetric();
              }}
            >
              ${icon("add-icon")}
            </button>
          </td>
        </tr>
      </table>
      <div class="dialog-footer">
        <button @click=${() => this.cancel()}>Close</button>
      </div>
    </dialog>`;
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
      title="Delete this metric."
      @click=${() => this.deleteMetric(name)}
    >
      ${icon("delete-icon")}
    </button>`;
  }

  private async deleteMetric(name: string) {
    const ret = await executeOp(
      DeleteMetricOp(name),
      "planDefinitionChanged",
      true,
      this.explanMain!
    );
    if (!ret.ok) {
      console.log(ret.error);
    }
    this.render();
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
      @click=${() => this.editMetric(name)}
    >
      ${icon("edit-icon")}
    </button>`;
  }

  private editMetric(name: string) {
    this.cancel();
    this.explanMain!.querySelector<EditMetricDefinition>(
      "edit-metric-definition"
    )!.showModal(this.explanMain!, name);
  }

  private async newMetric() {
    const name = window.prompt("Metric name:", "");
    if (name === null) {
      return;
    }
    const ret = await executeOp(
      AddMetricOp(name, new MetricDefinition(0)),
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
}

customElements.define("edit-metrics-dialog", EditMetricsDialog);
