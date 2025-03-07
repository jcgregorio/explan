import { TemplateResult, html, render } from "lit-html";
import { Plan } from "../plan/plan.ts";
import { TaskCompletion } from "../task_completion/task_completion.ts";

export class TaskCompletionPanel extends HTMLElement {
  plan: Plan | null = null;
  taskIndex: number = 0;
  taskCompletion: TaskCompletion | null = null;

  update(plan: Plan, taskIndex: number) {
    this.plan = plan;
    this.taskIndex = taskIndex;
    const ret = this.plan.getTaskCompletion(this.taskIndex);
    if (ret.ok) {
      this.taskCompletion = ret.value;
    }
    this.render();
  }

  private render() {
    render(this.template(), this);
  }

  private template(): TemplateResult {
    if (this.taskCompletion === null) {
      return html``;
    }
    switch (this.taskCompletion.stage) {
      case "unstarted":
        return html`<div>
          <label>
            <input type="checkbox" @change=${() => this.start()} />
            Started
          </label>
        </div>`;
        break;

      case "started":
        return html`<div>
          <label>
            <input type="checkbox" checked @change=${() => this.unstart()} />
            Started
          </label>

          <date-picker
            .value=${{
              unit: this.plan!.durationUnits,
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
        return html`<div>
          <label>
            <input type="checkbox" checked @change=${() => this.unstart()} />
            Started
          </label>
          <date-picker
            .value=${{
              unit: this.plan!.durationUnits,
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
              unit: this.plan!.durationUnits,
              dateOffset: this.taskCompletion.span.finish,
            }}
            @date-picker-input=${(e: CustomEvent<number>) =>
              this.finishDateChanged(e)}
          ></date-picker>
        </div>`;
        break;

      default:
        // Confirm we've covered all switch statement possibilites.
        this.taskCompletion satisfies never;
        return html``;
        break;
    }
  }

  private start() {}
  private unstart() {}
  private finish() {}
  private percentChange(e: InputEvent) {}
  private startDateChanged(e: CustomEvent<number>) {}
  private finishDateChanged(e: CustomEvent<number>) {}
}

customElements.define("task-completion-panel", TaskCompletionPanel);
