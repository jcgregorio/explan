import { TemplateResult, html, render } from 'lit-html';
import { ExplanMain } from '../explanMain/explanMain';
import { dateDisplay } from '../date-control-utils/date-control-utils';
import { executeOp } from '../action/execute';
import { SetPlanStartStateOp, SetPlanUnitsOp } from '../ops/plan';
import { UNIT_TYPES, toUnit } from '../units/unit';

export class PlanConfigPanel extends HTMLElement {
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
    return html`
      <h3>Plan Status</h3>
      <div>
        <div>${this.unstartedContent()} ${this.startedContent()}</div>
        <label>
          Units
          <select
            size=${UNIT_TYPES.length}
            @input=${(e: InputEvent) => this.unitChanged(e)}
          >
            ${UNIT_TYPES.map((unitType) => {
              return html`<option value=${unitType}>${unitType}</option>`;
            })}
          </select>
        </label>
      </div>
    `;
  }

  private async unitChanged(e: InputEvent) {
    const unitAsString = (e.target as HTMLInputElement).value;
    const ret = await executeOp(
      SetPlanUnitsOp(toUnit(unitAsString)),
      'planDefinitionChanged',
      true,
      this.explanMain!
    );
    if (!ret.ok) {
      console.log(ret.error);
    }
    this.render();
  }

  private unstartedContent(): TemplateResult {
    if (this.explanMain!.plan.status.stage === 'unstarted') {
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
    if (this.explanMain!.plan.status.stage === 'started') {
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
      SetPlanStartStateOp({ stage: 'started', start: start }),
      'planDefinitionChanged',
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
      SetPlanStartStateOp({ stage: 'started', start: start }),
      'planDefinitionChanged',
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
      SetPlanStartStateOp({ stage: 'unstarted', start: 0 }),
      'planDefinitionChanged',
      true,
      this.explanMain!
    );
    if (!ret.ok) {
      console.log(ret.error);
    }
    this.render();
  }
}

customElements.define('plan-config-panel', PlanConfigPanel);
