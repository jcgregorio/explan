import { TemplateResult, html, render } from "lit-html";
import { Plan } from "../plan/plan";
import { live } from "lit-html/directives/live.js";
import { icon } from "../icons/icons";
import { execute } from "../action/execute";
import { ExplanMain } from "../explanMain/explanMain";

export interface TaskNameChangeDetails {
  name: string;
  taskIndex: number;
}

export interface TaskResourceValueChangeDetails {
  name: string;
  value: string;
  taskIndex: number;
}

export interface TaskMetricValueChangeDetails {
  name: string;
  value: number;
  taskIndex: number;
}

declare global {
  interface GlobalEventHandlersEventMap {
    "task-name-change": CustomEvent<TaskNameChangeDetails>;
    "task-resource-value-change": CustomEvent<TaskResourceValueChangeDetails>;
    "task-metric-value-change": CustomEvent<TaskMetricValueChangeDetails>;
  }
}

export class SelectedTaskPanel extends HTMLElement {
  explanMain: ExplanMain | null = null;
  plan: Plan = new Plan();
  taskIndex: number = -1;
  planDefinitionChangedCallback: () => void;

  constructor() {
    super();
    this.planDefinitionChangedCallback = () => {
      this.render();
    };
  }

  connectedCallback(): void {
    this.render();
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

  updateSelectedTaskPanel(explainMain: ExplanMain, taskIndex: number) {
    this.explanMain = explainMain;
    this.plan = explainMain.plan;
    this.taskIndex = taskIndex;
    this.render();
    /*
    TODO - Do the following when selecting a new task.
      window.setTimeout(() => {
        const input =
          selectedTaskPanel.querySelector<HTMLInputElement>("#task-name")!;
        input.focus();
        input.select();
      }, 0);
      */
  }

  render() {
    render(this.template(), this);
  }

  template(): TemplateResult {
    const taskIndex = this.taskIndex;
    if (taskIndex === -1) {
      return html`
        <button
          class="icon-button"
          @click=${async () => await execute("NewTaskAction", this.explanMain!)}
          title="Add Task"
        >
          ${icon("add-icon")}
        </button>
        <div>No task selected.</div>
      `;
    }
    if (this.explanMain === null) {
      return html``;
    }
    const task = this.plan.chart.Vertices[taskIndex];
    return html`
      <button
        class="icon-button"
        @click=${async () => await execute("NewTaskAction", this.explanMain!)}
        title="Add Task"
      >
        ${icon("add-icon")}
      </button>
      <button
        class="icon-button"
        @click=${async () => await execute("DupTaskAction", this.explanMain!)}
        title="Duplicate Task"
      >
        ${icon("dup")}
      </button>
      <button
        class="icon-button"
        @click=${async () => await execute("SplitTaskAction", this.explanMain!)}
        title="Split Task"
      >
        ${icon("split")}
      </button>
      <button
        class="icon-button"
        @click=${async () => execute("DeleteTaskAction", this.explanMain!)}
        title="Delete Task"
      >
        ${icon("delete-icon")}
      </button>
      <table>
        <tr>
          <td class="underline-first-char">Name</td>
          <td>
            <input
              type="text"
              id="task-name"
              accesskey="n"
              .value="${live(task.name)}"
              @change=${(e: Event) =>
                this.dispatchEvent(
                  new CustomEvent<TaskNameChangeDetails>("task-name-change", {
                    bubbles: true,
                    detail: {
                      taskIndex: taskIndex,
                      name: (e.target as HTMLInputElement).value,
                    },
                  })
                )}
            />
          </td>
        </tr>
        ${Object.entries(this.plan.resourceDefinitions).map(
          ([resourceKey, defn]) =>
            html` <tr>
              <td>
                <label for="${resourceKey}">${resourceKey}</label>
              </td>
              <td>
                <select
                  id="${resourceKey}"
                  @change=${async (e: Event) =>
                    this.dispatchEvent(
                      new CustomEvent("task-resource-value-change", {
                        bubbles: true,
                        detail: {
                          taskIndex: taskIndex,
                          value: (e.target as HTMLInputElement).value,
                          name: resourceKey,
                        },
                      })
                    )}
                >
                  ${defn.values.map(
                    (resourceValue: string) =>
                      html`<option
                        name=${resourceValue}
                        .selected=${task.resources[resourceKey] ===
                        resourceValue}
                      >
                        ${resourceValue}
                      </option>`
                  )}
                </select>
              </td>
            </tr>`
        )}
        ${Object.keys(this.plan.metricDefinitions).map(
          (key: string) =>
            html` <tr>
              <td><label for="${key}">${key}</label></td>
              <td>
                <input
                  id="${key}"
                  .value=${live(task.metrics[key])}
                  type="number"
                  @change=${async (e: Event) =>
                    this.dispatchEvent(
                      new CustomEvent("task-metric-value-change", {
                        bubbles: true,
                        detail: {
                          taskIndex: taskIndex,
                          value: +(e.target as HTMLInputElement).value,
                          name: key,
                        },
                      })
                    )}
                />
              </td>
            </tr>`
        )}
      </table>
    `;
  }
}

customElements.define("selected-task-panel", SelectedTaskPanel);
