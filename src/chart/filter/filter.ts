import { DirectedEdge, Edges } from "../../dag/dag";
import { ok, Result } from "../../result";
import { Span } from "../../slack/slack";
import { Chart, Task, Tasks, validateChart } from "../chart";

export interface ChartLike {
  Vertices: Tasks;
  Edges: Edges;
}

export interface FilterResult {
  chartLike: ChartLike;
  displayOrder: number[];
  highlightedTasks: number[];
  spans: Span[];
}

export type FilterFunc = (task: Task, index: number) => boolean;

export const filter = (
  chart: Chart,
  filterFunc: FilterFunc | null,
  highlightedTasks: number[],
  spans: Span[]
): Result<FilterResult> => {
  const vret = validateChart(chart);
  if (!vret.ok) {
    return vret;
  }
  const topologicalOrder = vret.value;
  if (filterFunc === null) {
    return ok({
      chartLike: chart,
      displayOrder: vret.value,
      highlightedTasks: highlightedTasks,
      spans,
    });
  }
  const tasks: Tasks = [];
  const edges: Edges = [];
  const displayOrder: number[] = [];
  const filteredSpans: Span[] = [];

  const fromOriginalToNewIndex: Map<number, number> = new Map();

  // First filter the tasks.
  chart.Vertices.forEach((task: Task, originalIndex: number) => {
    if (filterFunc(task, originalIndex)) {
      tasks.push(task);
      filteredSpans.push(spans[originalIndex]);
      const newIndex = tasks.length - 1;
      fromOriginalToNewIndex.set(originalIndex, newIndex);
    }
  });

  // Now filter the edges while also rewriting them.
  chart.Edges.forEach((directedEdge: DirectedEdge) => {
    if (
      !fromOriginalToNewIndex.has(directedEdge.i) ||
      !fromOriginalToNewIndex.has(directedEdge.j)
    ) {
      return;
    }
    edges.push(
      new DirectedEdge(
        fromOriginalToNewIndex.get(directedEdge.i),
        fromOriginalToNewIndex.get(directedEdge.j)
      )
    );
  });

  topologicalOrder.forEach((originalTaskIndex: number) => {
    const task: Task = chart.Vertices[originalTaskIndex];
    if (!filterFunc(task, originalTaskIndex)) {
      return;
    }
    displayOrder.push(fromOriginalToNewIndex.get(originalTaskIndex)!);
  });

  const updatedHighlightedTasks = highlightedTasks.map(
    (originalTaskIndex: number): number =>
      fromOriginalToNewIndex.get(originalTaskIndex)!
  );

  return ok({
    chartLike: {
      Edges: edges,
      Vertices: tasks,
    },
    displayOrder: displayOrder,
    highlightedTasks: updatedHighlightedTasks,
    spans: filteredSpans,
  });
};
