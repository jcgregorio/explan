import { DirectedEdge, DirectedGraph, edgesByDstToMap } from "../dag";
import { depthFirstSearchFromIndex } from "./dfs";

/** Returns the indices of all the successors of the task at the given index.
 *  Note that includes the given index itself.
 */
export const allSuccessors = (
  taskIndex: number,
  directedGraph: DirectedGraph
): number[] => {
  if (taskIndex >= directedGraph.Vertices.length - 1 || taskIndex <= 0) {
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

export const allPredecessors = (
  taskIndex: number,
  directedGraph: DirectedGraph
): number[] => {
  if (taskIndex >= directedGraph.Vertices.length - 1 || taskIndex <= 0) {
    return [];
  }
  const predecessorsToCheck = [taskIndex];
  const ret: Set<number> = new Set();
  const byDest = edgesByDstToMap(directedGraph.Edges);
  while (predecessorsToCheck.length !== 0) {
    const node = predecessorsToCheck.pop()!;
    ret.add(node);
    const predecessors = byDest.get(node);
    if (predecessors) {
      predecessorsToCheck.push(...predecessors.map((e: DirectedEdge) => e.i));
    }
  }
  ret.delete(0);
  return [...ret.values()];
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

export const difference = (a: number[], b: number[]): number[] => {
  const bSet = new Set(b);
  return a.filter((i: number) => !bSet.has(i));
};

export const allNonPredecessors = (
  taskIndex: number,
  directedGraph: DirectedGraph
): number[] => {
  return difference(
    allTasks(directedGraph),
    allSuccessors(taskIndex, directedGraph)
  );
};

export const allNonSuccessors = (
  taskIndex: number,
  directedGraph: DirectedGraph
): number[] => {
  return difference(
    allTasks(directedGraph),
    allPredecessors(taskIndex, directedGraph)
  );
};