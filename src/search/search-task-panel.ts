import { ExplanMain } from "../explanMain/explanMain.ts";
import { SearchType, TaskSearchControl } from "./task-search-controls.ts";

/** Uses a task-search-control to search through all Tasks. */
export class SearchTaskPanel extends HTMLElement {
  explanMain: ExplanMain | null = null;
  taskSearchControl: TaskSearchControl | null = null;

  connectedCallback(): void {
    this.explanMain = document.querySelector("explan-main");
    if (!this.explanMain) {
      return;
    }
    this.taskSearchControl = this.querySelector("task-search-control");
    this.addEventListener("task-change", (e) => {
      this.explanMain!.setSelection(e.detail.taskIndex, e.detail.focus, true);
      this.classList.add("hidden");
    });
    this.addEventListener("task-focus", (e) =>
      this.setKeyboardFocusToInput("full-info"),
    );
  }

  setKeyboardFocusToInput(searchType: SearchType) {
    this.classList.remove("hidden");
    this.taskSearchControl!.tasks = this.explanMain!.plan.chart.Vertices;
    this.taskSearchControl!.includedIndexes =
      this.explanMain!.plan.chart.Vertices.map(
        (_, index: number) => index,
      ).slice(1, -1);
    this.taskSearchControl!.setKeyboardFocusToInput(searchType);
  }
}

customElements.define("search-task-panel", SearchTaskPanel);
