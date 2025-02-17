import { DirectedEdge, Edges } from "../../dag/dag";
import { ok, Result } from "../../result";
import { Span } from "../../slack/slack";
import { Chart, ChartValidate, Task, Tasks } from "../chart";

export interface ChartLike {
  Vertices: Tasks;
  Edges: Edges;
}

export interface FilterResult {
  chartLike: ChartLike;
  displayOrder: number[];
  emphasizedTasks: number[];
  spans: Span[];
  labels: string[];
  fromFilteredIndexToOriginalIndex: Map<number, number>;
  fromOriginalIndexToFilteredIndex: Map<number, number>;
  selectedTaskIndex: number;
}

/** Used for filtering tasks, returns True if the task is to be included in the
 * filtered results. */
export type FilterFunc = (task: Task, index: number) => boolean;

/** Filters the contents of the Chart based on the filterFunc.
 *
 * selectedTaskIndex will be returned as -1 if the selected task gets filtered
 * out.
 */
export const filter = (
  chart: Chart,
  filterFunc: FilterFunc | null,
  emphasizedTasks: number[],
  spans: Span[],
  labels: string[],
  selectedTaskIndex: number
): Result<FilterResult> => {
  const vret = ChartValidate(chart);
  if (!vret.ok) {
    return vret;
  }
  const topologicalOrder = vret.value;
  if (filterFunc === null) {
    const fromFilteredIndexToOriginalIndex: Map<number, number> = new Map();
    for (let index = 0; index < chart.Vertices.length; index++) {
      fromFilteredIndexToOriginalIndex.set(index, index);
    }
    return ok({
      chartLike: chart,
      displayOrder: vret.value,
      emphasizedTasks: emphasizedTasks,
      spans: spans,
      labels: labels,
      fromFilteredIndexToOriginalIndex: fromFilteredIndexToOriginalIndex,
      fromOriginalIndexToFilteredIndex: fromFilteredIndexToOriginalIndex,
      selectedTaskIndex,
    });
  }
  const tasks: Tasks = [];
  const edges: Edges = [];
  const displayOrder: number[] = [];
  const filteredSpans: Span[] = [];
  const filteredLabels: string[] = [];
  const fromFilteredIndexToOriginalIndex: Map<number, number> = new Map();
  const fromOriginalToFilteredIndex: Map<number, number> = new Map();

  // First filter the tasks.
  chart.Vertices.forEach((task: Task, originalIndex: number) => {
    if (filterFunc(task, originalIndex)) {
      tasks.push(task);
      filteredSpans.push(spans[originalIndex]);
      filteredLabels.push(labels[originalIndex]);
      const newIndex = tasks.length - 1;
      fromOriginalToFilteredIndex.set(originalIndex, newIndex);
      fromFilteredIndexToOriginalIndex.set(newIndex, originalIndex);
    }
  });

  // Now filter the edges while also rewriting them.
  chart.Edges.forEach((directedEdge: DirectedEdge) => {
    if (
      !fromOriginalToFilteredIndex.has(directedEdge.i) ||
      !fromOriginalToFilteredIndex.has(directedEdge.j)
    ) {
      return;
    }
    edges.push(
      new DirectedEdge(
        fromOriginalToFilteredIndex.get(directedEdge.i),
        fromOriginalToFilteredIndex.get(directedEdge.j)
      )
    );
  });

  // Now filter and reindex the topological/display order.
  topologicalOrder.forEach((originalTaskIndex: number) => {
    const task: Task = chart.Vertices[originalTaskIndex];
    if (!filterFunc(task, originalTaskIndex)) {
      return;
    }
    displayOrder.push(fromOriginalToFilteredIndex.get(originalTaskIndex)!);
  });

  // Re-index highlighted tasks.
  const updatedEmphasizedTasks = emphasizedTasks.map(
    (originalTaskIndex: number): number =>
      fromOriginalToFilteredIndex.get(originalTaskIndex)!
  );

  return ok({
    chartLike: {
      Edges: edges,
      Vertices: tasks,
    },
    displayOrder: displayOrder,
    emphasizedTasks: updatedEmphasizedTasks,
    spans: filteredSpans,
    labels: filteredLabels,
    fromFilteredIndexToOriginalIndex: fromFilteredIndexToOriginalIndex,
    fromOriginalIndexToFilteredIndex: fromOriginalToFilteredIndex,
    selectedTaskIndex: fromOriginalToFilteredIndex.get(selectedTaskIndex) || -1,
  });
};
