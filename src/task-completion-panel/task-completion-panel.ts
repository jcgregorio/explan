import { TemplateResult, html, render } from "lit-html";
import { Plan } from "../plan/plan.ts";
import { TaskCompletion } from "../task_completion/task_completion.ts";

export class TaskCompletionPanel extends HTMLElement {
  plan: Plan | null = null;
  taskCompletion: TaskCompletion = { stage: "unstarted" };

  update(plan: Plan, taskCompletion: TaskCompletion) {
    this.plan = plan;
    this.taskCompletion = taskCompletion;
    this.render();
  }

  private render() {
    render(this.template(), this);
  }

  private template(): TemplateResult {
    if (this.plan === null) {
      return html``;
    }
    switch (this.taskCompletion.stage) {
      case "unstarted":
        html`<div>
          <label>
            <input type="checkbox" @change=${() => this.start()} />
            Started
          </label>
        </div>`;
        break;

      case "started":
        html`<div>
          <label>
            <input type="checkbox" checked @change=${() => this.unstart()} />
            Started
          </label>

          <date-picker
            .value=${{
              unit: this.plan.durationUnits,
              dateOffset: this.taskCompletion.start,
            }}
            @date-picker-input=${(e: CustomEvent<number>) =>
              this.startDateChanged(e)}
          ></date-picker>

          <label>
            <input
              type="number"
              .value=${this.taskCompletion.percentComplete}
              @input=${(e: InputEvent) => this.percentChange(e)}
            />
          </label>

          <label>
            <input type="checkbox" checked @change=${() => this.finish()} />
            Finished
          </label>
        </div>`;
        break;

      case "finished":
        html`<div>
          <label>
            <input type="checkbox" checked @change=${() => this.unstart()} />
            Started
          </label>
          <date-picker
            .value=${{
              unit: this.plan.durationUnits,
              dateOffset: this.taskCompletion.span.start,
            }}
            @date-picker-input=${(e: CustomEvent<number>) =>
              this.startDateChanged(e)}
          ></date-picker>

          <label>
            <input type="checkbox" checked @change=${() => this.finish()} />
            Finished
          </label>
          <date-picker
            .value=${{
              unit: this.plan.durationUnits,
              dateOffset: this.taskCompletion.span.finish,
            }}
            @date-picker-input=${(e: CustomEvent<number>) =>
              this.finishDateChanged(e)}
          ></date-picker>
        </div>`;
        break;

      default:
        break;
    }
    return html``;
  }

  private start() {}
  private unstart() {}
  private finish() {}
  private percentChange(e: InputEvent) {}
  private startDateChanged(e: CustomEvent<number>) {}
  private finishDateChanged(e: CustomEvent<number>) {}
}

customElements.define("task-completion-panel", TaskCompletionPanel);
