import { TemplateResult, html, render } from "lit-html";
import { ExplanMain } from "../explanMain/explanMain";
import { live } from "lit-html/directives/live.js";
import { MetricRange, displayValue } from "../metrics/range";
import { RenameMetricOp, UpdateMetricOp } from "../ops/metrics";
import { MetricDefinition } from "../metrics/metrics";
import { Result } from "../result";
import { Op } from "../ops/ops";
import { executeOp } from "../action/execute";

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
                ?checked=${defn.range.min === -Number.MAX_VALUE}
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
            />
          </td>
          <td>
            <label>
              <input
                type="checkbox"
                ?checked=${defn.range.max === Number.MAX_VALUE}
              />
              Limit</label
            >
          </td>
        </tr>
        <tr>
          <th>Default</th>
          <td><input .value=${live(defn.default)} /></td>
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

  private async minChange(e: Event) {
    const ele = e.target as HTMLInputElement;
    const newValue = +ele.value;
    const defn = this.explanMain?.plan.metricDefinitions[this.metricName];
    const definitionCopy = MetricDefinition.FromJSON(defn?.toJSON());
    definitionCopy.range = new MetricRange(newValue, defn?.range.max);
    const ret = await this.executeOp(
      UpdateMetricOp(this.metricName, definitionCopy)
    );
    this.render();
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
