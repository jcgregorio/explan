import { TemplateResult, html, render } from 'lit-html';
import { ExplanMain } from '../explanMain/explanMain';
import { icon } from '../icons/icons';
import { displayValue } from '../metrics/range';
import { executeOp } from '../action/execute';
import { AddMetricOp, DeleteMetricOp } from '../ops/metrics';
import { MetricDefinition } from '../metrics/metrics';
import { EditMetricDefinition } from '../edit-metric-definition/edit-metric-definition';
import { reportErrorMsg, reportIfError } from '../report-error/report-error';
import { PromptDialog } from '../prompt-dialog/prompt-dialog';

export class EditMetricsPanel extends HTMLElement {
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
      'plan-definition-changed',
      this.planDefinitionChangedCallback
    );
  }

  disconnectedCallback(): void {
    document.removeEventListener(
      'plan-definition-changed',
      this.planDefinitionChangedCallback
    );
  }

  private render() {
    render(this.template(), this);
  }

  setConfig(explanMain: ExplanMain) {
    this.explanMain = explanMain;
    this.render();
  }

  private template(): TemplateResult {
    const md = this.explanMain!.plan.metricDefinitions;
    const allKeysSorted = Object.keys(md).sort(
      (keyA: string, keyB: string): number => {
        const a = md[keyA];
        const b = md[keyB];
        if (a.isStatic === b.isStatic) {
          return keyA.localeCompare(keyB);
        }
        if (a.isStatic) {
          return -1;
        }
        return 1;
      }
    );
    return html` <h3>Metrics</h3>
      <table>
        <tr>
          <th>Name</th>
          <th>Min</th>
          <th>Max</th>
          <th>Default</th>
          <th></th>
          <th></th>
        </tr>

        ${allKeysSorted.map((metricName: string) => {
          const metricDefn =
            this.explanMain!.plan.metricDefinitions[metricName];
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
        })}
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
              ${icon('add-icon')}
            </button>
          </td>
        </tr>
      </table>`;
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
      ${icon('delete-icon')}
    </button>`;
  }

  private async deleteMetric(name: string) {
    const ret = await executeOp(
      DeleteMetricOp(name),
      'planDefinitionChanged',
      true,
      this.explanMain!
    );
    reportIfError(ret);
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
      ${icon('edit-icon')}
    </button>`;
  }

  private editMetric(name: string) {
    this.explanMain!.querySelector<EditMetricDefinition>(
      'edit-metric-definition'
    )!.showModal(this.explanMain!, name);
  }

  private async newMetric() {
    let name = await document
      .querySelector<PromptDialog>('prompt-dialog')!
      .prompt('Metric Name');
    if (name === null) {
      return;
    }
    name = name.trim();
    if (name === '') {
      reportErrorMsg(
        new Error(
          'Metric names cannot be empty and must contain more than whitespace characters.'
        )
      );
      return;
    }

    const ret = await executeOp(
      AddMetricOp(name, new MetricDefinition(0)),
      'planDefinitionChanged',
      true,
      this.explanMain!
    );
    reportIfError(ret);
    this.render();
  }
}

customElements.define('edit-metrics-panel', EditMetricsPanel);
