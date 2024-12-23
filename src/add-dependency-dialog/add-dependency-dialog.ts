import { TaskSearchControl } from "../search/task-search-controls";
import { Chart } from "../chart/chart";
import { DepType } from "../dependencies/dependencies-control";
import {
  allNonPredecessors,
  allNonSuccessors,
} from "../dag/algorithms/circular";

export class AddDependencyDialog extends HTMLElement {
  private titleElement: HTMLElement | null = null;
  private taskSearchControl: TaskSearchControl | null = null;
  private dialog: HTMLDialogElement | null = null;
  private resolve: (value: number | undefined) => void = () => {};

  connectedCallback(): void {
    this.titleElement = this.querySelector("h2")!;
    this.taskSearchControl = this.querySelector("task-search-control")!;
    this.dialog = this.querySelector("dialog")!;
    this.dialog.addEventListener("cancel", () => this.resolve(undefined));
    this.taskSearchControl.addEventListener("task-change", (e) => {
      this.dialog!.close();
      this.resolve(e.detail);
    });
  }

  /** Populates the dialog and shows it as a Modal dialog and returns a Promise
   *  that resolves on success to a taskIndex, or undefined if the user
   *  cancelled out of the flow.
   */
  public selectDependency(
    chart: Chart,
    taskIndex: number,
    depType: DepType
  ): Promise<number | undefined> {
    this.titleElement!.textContent = depType;

    let includedIndexes = [];
    if (depType === "pred") {
      includedIndexes = allNonSuccessors(taskIndex, chart);
    } else {
      includedIndexes = allNonPredecessors(taskIndex, chart);
    }
    this.taskSearchControl!.tasks = chart.Vertices;
    this.taskSearchControl!.includedIndexes = includedIndexes;
    const ret = new Promise<number | undefined>((resolve, _reject) => {
      this.resolve = resolve;
      this.dialog!.showModal();
    });
    return ret;
  }
}

customElements.define("add-dependency-dialog", AddDependencyDialog);
