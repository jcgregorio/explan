import { TemplateResult, html, render } from "lit-html";
import { Plan } from "../plan/plan";
import {
  CriticalPathEntry,
  CriticalPathTaskEntry,
  SimulationResults,
  simulation,
} from "../simulation/simulation";
import { Chart } from "../chart/chart";

export interface SimulationSelectDetails {
  durations: number[] | null;
  criticalPath: number[];
}

declare global {
  interface GlobalEventHandlersEventMap {
    "simulation-select": CustomEvent<SimulationSelectDetails>;
  }
}

export class SimulationPanel extends HTMLElement {
  results: SimulationResults = {
    paths: new Map(),
    tasks: [],
  };
  chart: Chart | null = null;
  numSimulationLoops: number = 0;

  connectedCallback(): void {
    this.render();
  }

  simulate(chart: Chart, numSimulationLoops: number): number[] {
    this.results = simulation(chart, numSimulationLoops);
    this.chart = chart;
    this.numSimulationLoops = numSimulationLoops;

    this.render();
    return this.results.tasks.map(
      (taskEntry: CriticalPathTaskEntry) => taskEntry.taskIndex
    );
  }

  clear() {
    this.results = {
      paths: new Map(),
      tasks: [],
    };
    this.dispatchEvent(
      new CustomEvent<SimulationSelectDetails>("simulation-select", {
        bubbles: true,
        detail: {
          durations: null,
          criticalPath: [],
        },
      })
    );
    this.render();
  }

  pathClicked(key: string) {
    this.dispatchEvent(
      new CustomEvent<SimulationSelectDetails>("simulation-select", {
        bubbles: true,
        detail: {
          durations: this.results.paths.get(key)!.durations,
          criticalPath: this.results.paths.get(key)!.criticalPath,
        },
      })
    );
  }

  render() {
    render(this.template(), this);
  }

  template(): TemplateResult {
    if (this.results.paths.size === 0) {
      return html``;
    }
    const pathKeys = [...this.results.paths.keys()];
    const sortedPathKeys = pathKeys.sort((a: string, b: string) => {
      return (
        this.results.paths.get(b)!.count - this.results.paths.get(a)!.count
      );
    });
    return html`
      <button
        @click=${() => {
          this.clear();
        }}
      >
        Clear
      </button>

      <table>
        <tr>
          <th>Count</th>
          <th>Critical Path</th>
        </tr>
        ${sortedPathKeys.map(
          (key: string) =>
            html`<tr @click=${() => this.pathClicked(key)}>
              <td>${this.results.paths.get(key)!.count}</td>
              <td>${key}</td>
            </tr>`
        )}
      </table>
      <table>
        <tr>
          <th>Name</th>
          <th>Duration</th>
          <th>Frequency (%)</th>
        </tr>
        ${this.results.tasks.map(
          (taskEntry: CriticalPathTaskEntry) =>
            html`<tr>
              <td>${this.chart!.Vertices[taskEntry.taskIndex].name}</td>
              <td>${taskEntry.duration}</td>
              <td>
                ${Math.floor(
                  (100 * taskEntry.numTimesAppeared) / this.numSimulationLoops
                )}
              </td>
            </tr>`
        )}
      </table>
    `;
  }
}

customElements.define("simulation-panel", SimulationPanel);
