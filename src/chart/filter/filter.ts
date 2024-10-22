import { DirectedEdge, Edges } from "../../dag/dag";
import { ok, Result } from "../../result";
import { Chart, Task, Tasks, validateChart } from "../chart";

export interface ChartLike {
  Vertices: Tasks;
  Edges: Edges;
}

export interface FilterResult {
  chartLike: ChartLike;
  displayOrder: number[];
}

export type FilterFunc = (task: Task, index: number) => boolean;

export const filter = (
  chart: Chart,
  filterFunc: FilterFunc | null
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
    });
  }
  const tasks: Tasks = [];
  const edges: Edges = [];
  const displayOrder: number[] = [];

  const fromOriginalToNewIndex: Map<number, number> = new Map();

  // First filter the tasks.
  chart.Vertices.forEach((task: Task, originalIndex: number) => {
    if (filterFunc(task, originalIndex)) {
      tasks.push(task);
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

  return ok({
    chartLike: {
      Edges: edges,
      Vertices: tasks,
    },
    displayOrder: displayOrder,
  });
};
