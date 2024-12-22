import { TemplateResult, html, render } from "lit-html";
import { Task } from "../chart/chart.ts";

export type DepType = "pred" | "succ";

const depDisplayName: Record<DepType, string> = {
  pred: "Predecessors",
  succ: "Successors",
};

interface DepenencyEvent {
  taskIndex: number;
  depType: DepType;
}

declare global {
  interface GlobalEventHandlersEventMap {
    "delete-dependeny": CustomEvent<DepenencyEvent>;
    "add-dependeny": CustomEvent<DepenencyEvent>;
  }
}

const kindTemplate = (
  dependenciesControl: DependenciesControl,
  depType: DepType,
  indexes: number[]
): TemplateResult => html`
  <tr>
    <th>${depDisplayName[depType]}</th>
    <th></th>
  </tr>
  ${indexes.map((taskIndex: number) => {
    const task = dependenciesControl.tasks[taskIndex];
    return html`<tr>
      <td>${task.name}</td>
      <td>
        <button
          class="delete"
          title="Delete the dependency on ${task.name}"
          @click=${() => dependenciesControl.deleteDep(taskIndex, depType)}
        >
          X
        </button>
      </td>
    </tr>`;
  })}
  <tr>
    <td></td>
    <td>
      <button
        @click=${dependenciesControl.addDep(depType)}
        title="Add dependency."
      >
        +
      </button>
    </td>
  </tr>
`;

const template = (
  dependenciesControl: DependenciesControl
): TemplateResult => html`
  <table>
    ${kindTemplate(
      dependenciesControl,
      "pred",
      dependenciesControl.predIndexes
    )}
    ${kindTemplate(
      dependenciesControl,
      "succ",
      dependenciesControl.succIndexes
    )}
  </table>
`;

export class DependenciesControl extends HTMLElement {
  tasks: Task[] = [];
  predIndexes: number[] = [];
  succIndexes: number[] = [];

  connectedCallback(): void {
    render(template(this), this);
  }

  public setTasksAndIndices(
    tasks: Task[],
    predIndexes: number[],
    succIndexes: number[]
  ) {
    this.tasks = tasks;
    this.predIndexes = predIndexes;
    this.succIndexes = succIndexes;
    render(template(this), this);
  }

  public deleteDep(taskIndex: number, depType: DepType) {
    this.dispatchEvent(
      new CustomEvent("delete-dependency", {
        bubbles: true,
        detail: {
          taskIndex: taskIndex,
          depType: depType,
        },
      })
    );
  }

  public addDep(depType: DepType) {
    this.dispatchEvent(
      new CustomEvent("add-dependency", {
        bubbles: true,
        detail: {
          taskIndex: -1,
          depType: depType,
        },
      })
    );
  }
}

customElements.define("dependencies-control", DependenciesControl);
