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
  emphasizedTasks: number[];
  spans: Span[];
  labels: string[];
}

export type FilterFunc = (task: Task, index: number) => boolean;

export const filter = (
  chart: Chart,
  filterFunc: FilterFunc | null,
  emphasizedTasks: number[],
  spans: Span[],
  labels: string[]
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
      emphasizedTasks: emphasizedTasks,
      spans,
      labels,
    });
  }
  const tasks: Tasks = [];
  const edges: Edges = [];
  const displayOrder: number[] = [];
  const filteredSpans: Span[] = [];
  const filteredLabels: string[] = [];

  const fromOriginalToNewIndex: Map<number, number> = new Map();

  // First filter the tasks.
  chart.Vertices.forEach((task: Task, originalIndex: number) => {
    if (filterFunc(task, originalIndex)) {
      tasks.push(task);
      filteredSpans.push(spans[originalIndex]);
      filteredLabels.push(labels[originalIndex]);
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

  // Now filter and reindex the topological/display order.
  topologicalOrder.forEach((originalTaskIndex: number) => {
    const task: Task = chart.Vertices[originalTaskIndex];
    if (!filterFunc(task, originalTaskIndex)) {
      return;
    }
    displayOrder.push(fromOriginalToNewIndex.get(originalTaskIndex)!);
  });

  // Re-index highlighted tasks.
  const updatedEmphasizedTasks = emphasizedTasks.map(
    (originalTaskIndex: number): number =>
      fromOriginalToNewIndex.get(originalTaskIndex)!
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
  });
};
