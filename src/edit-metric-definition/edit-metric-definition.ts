import { TemplateResult, html, render } from "lit-html";
import { ExplanMain } from "../explanMain/explanMain";
import { live } from "lit-html/directives/live.js";
import { MetricRange, displayValue } from "../metrics/range";
import { RenameMetricOp, UpdateMetricOp } from "../ops/metrics";
import { MetricDefinition } from "../metrics/metrics";
import { Result } from "../result";
import { Op } from "../ops/ops";
import { executeOp } from "../action/execute";
import { reportError } from "../report-error/report-error";

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
    const defn = this.explanMain?.plan.metricDefinitions[this.metricName];
    if (!defn) {
      return html``;
    }
    return html`<dialog>
      <table>
        <tr>
          <th>Name</th>
          <td>
            <input
              .value=${live(this.metricName)}
              @change=${(e: Event) => this.nameChange(e)}
            />
          </td>
          <td></td>
        </tr>
        <tr>
          <th>Min</th>
          <td>
            <input
              .value=${live(displayValue(defn.range.min))}
              ?disabled=${defn.range.min === -Number.MAX_VALUE}
              @change=${(e: Event) => this.minChange(e)}
            />
          </td>
          <td>
            <label>
              <input
                type="checkbox"
                ?checked=${defn.range.min !== -Number.MAX_VALUE}
                @change=${(e: Event) => {
                  this.minLimitChange(e);
                }}
              />
              Limit</label
            >
          </td>
        </tr>
        <tr>
          <th>Max</th>
          <td>
            <input
              .value=${live(displayValue(defn.range.max))}
              ?disabled=${defn.range.max === Number.MAX_VALUE}
              @change=${(e: Event) => this.maxChange(e)}
            />
          </td>
          <td>
            <label>
              <input
                type="checkbox"
                ?checked=${defn.range.max !== Number.MAX_VALUE}
                @change=${(e: Event) => {
                  this.maxLimitChange(e);
                }}
              />
              Limit</label
            >
          </td>
        </tr>
        <tr>
          <th>Precision</th>
          <td><input .value=${live(defn.precision.precision)} /></td>
          <td></td>
        </tr>
        <tr>
          <th>Default</th>
          <td>
            <input
              .value=${live(defn.default)}
              @change=${(e: Event) => {
                this.defaultChange(e);
              }}
            />
          </td>
          <td></td>
        </tr>
      </table>
      <div class="dialog-footer">
        <button @click=${() => this.cancel()}>Close</button>
      </div>
    </dialog>`;
  }

  private async executeOp(op: Op): Promise<Result<null>> {
    const ret = await executeOp(
      op,
      "planDefinitionChanged",
      true,
      this.explanMain!
    );
    if (!ret.ok) {
      window.alert(ret.error);
    }
    return ret;
  }

  private async minLimitChange(e: Event) {
    const ele = e.target as HTMLInputElement;
    const defn = this.getDefinitionCopy();
    if (ele.checked) {
      const newMin = 0 < defn.range.max ? 0 : defn.range.max - 1;
      defn.range = new MetricRange(newMin, defn.range.max);
    } else {
      defn.range = new MetricRange(-Number.MAX_VALUE, defn.range.max);
    }
    this.updateMetricDefinition(defn);
  }

  private async maxLimitChange(e: Event) {
    const ele = e.target as HTMLInputElement;
    const defn = this.getDefinitionCopy();
    if (ele.checked) {
      const newMax = 100 > defn.range.min ? 100 : defn.range.min + 1;
      defn.range = new MetricRange(defn.range.min, newMax);
    } else {
      defn.range = new MetricRange(defn.range.min, Number.MAX_VALUE);
    }
    this.updateMetricDefinition(defn);
  }

  private async nameChange(e: Event) {
    const ele = e.target as HTMLInputElement;
    const oldName = this.metricName;
    const newName = ele.value;
    this.metricName = newName;
    const ret = await this.executeOp(RenameMetricOp(oldName, newName));
    if (!ret.ok) {
      this.metricName = oldName;
    }
    this.render();
  }

  private async defaultChange(e: Event) {
    const ele = e.target as HTMLInputElement;
    const defn = this.getDefinitionCopy();
    defn.default = +ele.value;
    this.updateMetricDefinition(defn);
  }

  private async minChange(e: Event) {
    const ele = e.target as HTMLInputElement;
    const newValue = +ele.value;
    const definitionCopy = this.getDefinitionCopy();
    definitionCopy.range = new MetricRange(newValue, definitionCopy!.range.max);
    this.updateMetricDefinition(definitionCopy);
  }

  private async maxChange(e: Event) {
    const ele = e.target as HTMLInputElement;
    const newValue = +ele.value;
    const definitionCopy = this.getDefinitionCopy();
    definitionCopy.range = new MetricRange(definitionCopy!.range.min, newValue);
    this.updateMetricDefinition(definitionCopy);
  }

  private async updateMetricDefinition(newDef: MetricDefinition) {
    newDef.rationalize();
    const ret = await this.executeOp(UpdateMetricOp(this.metricName, newDef));
    if (!ret.ok) {
      reportError(ret.error);
    }
    this.render();
  }

  private getDefinitionCopy(): MetricDefinition {
    const defn = this.explanMain?.plan.metricDefinitions[this.metricName];
    return MetricDefinition.FromJSON(defn?.toJSON());
  }

  private cancel() {
    this.querySelector<HTMLDialogElement>("dialog")!.close();
  }

  public showModal(explanMain: ExplanMain, metricName: string) {
    this.explanMain = explanMain;
    this.metricName = metricName;
    this.render();
    this.querySelector<HTMLDialogElement>("dialog")!.showModal();
  }
}

customElements.define("edit-metric-definition", EditMetricDefinition);
