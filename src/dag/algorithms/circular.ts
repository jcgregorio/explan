import { DirectedGraph } from "../dag";
import { depthFirstSearchFromIndex } from "./dfs";

/** Returns the indices of all the successors of the task at the given index.
 *  Note that includes the given index itself.
 */
export const allSuccessors = (
  taskIndex: number,
  directedGraph: DirectedGraph
): number[] => {
  if (taskIndex > directedGraph.Vertices.length - 1 || taskIndex <= 0) {
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
  return [...allChildren.values()];
};

/** Returns the indices of all the tasks in the graph, expect the first and the
 *  last. */
export const allTasks = (directedGraph: DirectedGraph): number[] => {
  const ret = [];
  for (let index = 1; index < directedGraph.Vertices.length - 1; index++) {
    ret.push(index);
  }
  return ret;
};
