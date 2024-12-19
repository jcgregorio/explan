import { DirectedGraph } from "../dag";
import { depthFirstSearchFromIndex } from "./dfs";

export const allSuccessors = (
  taskIndex: number,
  directedGraph: DirectedGraph
): number[] => {
  if (taskIndex > directedGraph.Vertices.length - 1) {
    return [];
  }
  const allChildren: Set<number> = new Set();
  depthFirstSearchFromIndex(
    directedGraph,
    taskIndex,
    (_: any, index: number) => {
      allChildren.add(index);
      return true;
    }
  );
  allChildren.delete(directedGraph.Vertices.length - 1);
  allChildren.delete(taskIndex);
  return [...allChildren.values()];
};
