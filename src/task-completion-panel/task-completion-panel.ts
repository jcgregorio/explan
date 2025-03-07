import { TemplateResult, html, render } from "lit-html";
import { Plan } from "../plan/plan.ts";
import {
  TaskCompletion,
  fromJSON,
  toJSON,
} from "../task_completion/task_completion.ts";
import { Span } from "../slack/slack.ts";

export class TaskCompletionPanel extends HTMLElement {
  plan: Plan | null = null;
  span: Span | null = null;
  taskIndex: number = 0;
  taskCompletion: TaskCompletion | null = null;

  update(plan: Plan, taskIndex: number, span: Span) {
    this.plan = plan;
    this.taskIndex = taskIndex;
    this.span = span;
    const ret = this.plan.getTaskCompletion(this.taskIndex);
    if (ret.ok) {
      this.taskCompletion = ret.value;
    }
    this.render();
  }

  private updateOnInput() {
    const ret = this.plan!.getTaskCompletion(this.taskIndex);
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
            Percent Complete
            <input
              type="number"
              .value=${this.taskCompletion.percentComplete}
              @input=${(e: InputEvent) => this.percentChange(e)}
            />
          </label>

          <label>
            <input type="checkbox" @change=${() => this.finish()} />
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

  private start() {
    const ret = this.plan!.setTaskCompletion(this.taskIndex, {
      stage: "started",
      start: this.span!.start,
      percentComplete: 10,
    });
    if (!ret.ok) {
      console.log(ret.error);
    }
    this.updateOnInput();
  }

  private unstart() {
    const ret = this.plan!.setTaskCompletion(this.taskIndex, {
      stage: "unstarted",
    });
    if (!ret.ok) {
      console.log(ret.error);
    }
    this.updateOnInput();
  }

  private finish() {
    if (this.taskCompletion!.stage === "started") {
      const ret = this.plan!.setTaskCompletion(this.taskIndex, {
        stage: "finished",
        // TODO Make sure finish > start.
        // TODO Make finish default to "today"?
        span: new Span(this.taskCompletion!.start, this.span!.finish),
      });
      if (!ret.ok) {
        console.log(ret.error);
      }
      this.updateOnInput();
    }
  }
  private percentChange(e: InputEvent) {
    const dup = fromJSON(toJSON(this.taskCompletion!));
    if (dup.stage === "started") {
      dup.percentComplete = (e.target as HTMLInputElement).valueAsNumber;
      const ret = this.plan!.setTaskCompletion(this.taskIndex, dup);
      if (!ret.ok) {
        console.log(ret.error);
      }
      this.updateOnInput();
    }
  }
  private startDateChanged(e: CustomEvent<number>) {}
  private finishDateChanged(e: CustomEvent<number>) {}
}

customElements.define("task-completion-panel", TaskCompletionPanel);
