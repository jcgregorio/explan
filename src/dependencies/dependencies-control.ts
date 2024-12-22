import { html, render } from "lit-html";
import { Task } from "../chart/chart.ts";

export type DepType = "pred" | "succ";

interface DeleteDepenencyEvent {
  taskIndex: number;
  depType: DepType;
}

declare global {
  interface GlobalEventHandlersEventMap {
    "delete-dependeny": CustomEvent<DeleteDepenencyEvent>;
    "add-dependeny": CustomEvent<DepType>;
  }
}

const template = (dependenciesControl: DependenciesControl) => html`
  <table>
    ${dependenciesControl.indices.map((taskIndex: number) => {
      const task = dependenciesControl.tasks[taskIndex];
      return html`<tr>
        <td>${task.name}</td>
        <td>
          <button
            title="Delete the dependency on ${task.name}"
            @click=${() => dependenciesControl.deleteDep(taskIndex)}
          >
            X
          </button>
        </td>
      </tr>`;
    })}
  </table>
  <div>
    <button @click=${dependenciesControl.addDep()} title="Add dependency.">
      +
    </button>
  </div>
`;

export class DependenciesControl extends HTMLElement {
  tasks: Task[] = [];
  indices: number[] = [];

  connectedCallback(): void {
    render(template(this), this);
  }

  public setTasksAndIndices(tasks: Task[], indices: number[]) {
    this.tasks = tasks;
    this.indices = indices;
    render(template(this), this);
  }

  public deleteDep(taskIndex: number) {
    this.dispatchEvent(
      new CustomEvent("delete-dependency", {
        bubbles: true,
        detail: taskIndex,
      })
    );
  }

  public addDep() {
    this.dispatchEvent(
      new CustomEvent("add-dependency", {
        bubbles: true,
        detail: this.dataset["kind"],
      })
    );
  }
}

customElements.define("dependencies-control", DependenciesControl);
