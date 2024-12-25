import { TemplateResult, html, render } from "lit-html";
import { Plan } from "../plan/plan";
import { Task } from "../chart/chart";

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

const template = (selectedTaskPanel: SelectedTaskPanel): TemplateResult => {
  const taskIndex = selectedTaskPanel.taskIndex;
  if (taskIndex === -1) {
    return html`No task selected.`;
  }
  const task = selectedTaskPanel.plan.chart.Vertices[taskIndex];
  return html`
    <table>
      <tr>
        <td>Name</td>
        <td>
          <input
            type="text"
            id="task-name"
            .value="${task.name}"
            @change=${(e: Event) =>
              selectedTaskPanel.dispatchEvent(
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
      ${Object.entries(selectedTaskPanel.plan.resourceDefinitions).map(
        ([resourceKey, defn]) =>
          html` <tr>
            <td>
              <label for="${resourceKey}">${resourceKey}</label>
            </td>
            <td>
              <select
                id="${resourceKey}"
                @change=${async (e: Event) =>
                  selectedTaskPanel.dispatchEvent(
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
                      .selected=${task.resources[resourceKey] === resourceValue}
                    >
                      ${resourceValue}
                    </option>`
                )}
              </select>
            </td>
          </tr>`
      )}
      ${Object.keys(selectedTaskPanel.plan.metricDefinitions).map(
        (key: string) =>
          html` <tr>
            <td><label for="${key}">${key}</label></td>
            <td>
              <input
                id="${key}"
                type="number"
                .value="${task.metrics[key]}"
                @change=${async (e: Event) =>
                  selectedTaskPanel.dispatchEvent(
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
};

export class SelectedTaskPanel extends HTMLElement {
  plan: Plan = new Plan();
  taskIndex: number = -1;

  connectedCallback(): void {
    this.render();
  }

  updateSelectedTaskPanel(plan: Plan, taskIndex: number) {
    this.plan = plan;
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
    render(template(this), this);
  }
}

customElements.define("selected-task-panel", SelectedTaskPanel);
