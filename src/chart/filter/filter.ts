import { DirectedEdge, Edges, Vertices } from "../../dag/dag";
import { ok, Result } from "../../result";
import { Chart, Task, Tasks } from "../chart";

export interface ChartLike {
  Vertices: Tasks;
  Edges: Edges;
}

export type FilterFunc = (task: Task, index: number) => boolean;

export const filter = (
  chart: ChartLike,
  filterFunc: FilterFunc | null
): Result<ChartLike> => {
  if (filterFunc === null) {
    return ok(chart);
  }
  const tasks: Tasks = [];
  const edges: Edges = [];

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

  return ok({
    Edges: edges,
    Vertices: tasks,
  });
};
