import { Result, ok, error } from "../result.ts";
import {
  VertexIndices,
  Edges,
  DirectedGraph,
  edgesBySrcToMap,
  edgesByDstToMap,
  DirectedEdge,
} from "../dag/dag";

import { topologicalSort } from "../dag/algorithms/toposort.ts";
import { DurationModel } from "../duration/duration.ts";
import { JacobianDuration, Uncertainty } from "../duration/jacobian.ts";
import { MetricValues } from "../metrics/metrics.ts";

export type TaskState = "unstarted" | "started" | "complete";

export const DEFAULT_TASK_NAME = "Task Name";

// Do we create sub-classes and then serialize separately? Or do we have a
// config about which type of DurationSampler is being used?
//
// We can use traditional optimistic/pessimistic value. Or Jacobian's
// uncertaintly multipliers [1.1, 1.5, 2, 5] and their inverses to generate an
// optimistic pessimistic.

/** Task is a Vertex with details about the Task to complete. */
export class Task {
  constructor(
    name: string = "",
    durationModel: DurationModel = new JacobianDuration(Uncertainty.moderate)
  ) {
    this.name = name || DEFAULT_TASK_NAME;
    this.durationModel =
      durationModel || new JacobianDuration(Uncertainty.moderate);

    this.metrics = new Map();
  }

  // Resource keys and values. The parent plan contains all the resource
  // definitions.

  // Should resources also have a ResourcesContainer?
  resources: { [key: string]: string } = {};

  metrics: MetricValues;

  name: string;

  durationModel: DurationModel;

  state: TaskState = "unstarted";

  // Recorded as the number of days from the Start Milestone.
  actualStart: number = 0;

  actualFinish: number = 0;

  public get duration(): number {
    return this.metrics.get("Duration")!;
  }

  public get percent(): number {
    return this.metrics.get("Percent")!;
  }

  public dup(): Task {
    const ret = new Task();
    ret.resources = Object.assign({}, this.resources);
    ret.metrics = new Map(this.metrics);
    ret.name = this.name;
    ret.durationModel = this.durationModel.dup();
    ret.state = this.state;
    ret.actualFinish = this.actualFinish;
    ret.actualStart = this.actualStart;
    return ret;
  }
}

export type Tasks = Task[];

/** A Chart is a DirectedGraph, but with Tasks for Vertices. */
export class Chart {
  Vertices: Tasks;
  Edges: Edges;

  constructor() {
    const start = new Task("Start");
    start.metrics.set("Duration", 0);
    const finish = new Task("Finish");
    finish.metrics.set("Duration", 0);
    this.Vertices = [start, finish];
    this.Edges = [new DirectedEdge(0, 1)];
  }
}

export type TopologicalOrder = VertexIndices;

export type ValidateResult = Result<TopologicalOrder>;

/** Validates a DirectedGraph is a valid Chart. */
export function validateChart(g: DirectedGraph): ValidateResult {
  if (g.Vertices.length < 2) {
    return error(
      "Chart must contain at least two node, the start and finish tasks."
    );
  }

  const edgesByDst = edgesByDstToMap(g.Edges);
  const edgesBySrc = edgesBySrcToMap(g.Edges);

  // The first Vertex, T_0 aka the Start Milestone, must have 0 incoming edges.
  if (edgesByDst.get(0) !== undefined) {
    return error("The start node (0) has an incoming edge.");
  }

  // And only T_0 should have 0 incoming edges.
  for (let i = 1; i < g.Vertices.length; i++) {
    if (edgesByDst.get(i) === undefined) {
      return error(
        `Found node that isn't (0) that has no incoming edges: ${i}`
      );
    }
  }

  // The last Vertex, T_finish, the Finish Milestone, must have 0 outgoing edges.
  if (edgesBySrc.get(g.Vertices.length - 1) !== undefined) {
    return error(
      "The last node, which should be the Finish Milestone, has an outgoing edge."
    );
  }

  // And only T_finish should have 0 outgoing edges.
  for (let i = 0; i < g.Vertices.length - 1; i++) {
    if (edgesBySrc.get(i) === undefined) {
      return error(
        `Found node that isn't T_finish that has no outgoing edges: ${i}`
      );
    }
  }

  const numVertices = g.Vertices.length;
  // And all edges make sense, i.e. they all point to vertexes that exist.
  for (let i = 0; i < g.Edges.length; i++) {
    const element = g.Edges[i];
    if (
      element.i < 0 ||
      element.i >= numVertices ||
      element.j < 0 ||
      element.j >= numVertices
    ) {
      return error(`Edge ${element} points to a non-existent Vertex.`);
    }
  }

  // Now we confirm that we have a Directed Acyclic Graph, i.e. the graph has no
  // cycles by creating a topological sort starting at T_0
  // https://en.wikipedia.org/wiki/Topological_sorting#Depth-first_search
  const tsRet = topologicalSort(g);
  if (tsRet.hasCycles) {
    return error(`Chart has cycle: ${[...tsRet.cycle].join(", ")}`);
  }

  return ok(tsRet.order);
}

export function ChartValidate(c: Chart): ValidateResult {
  const ret = validateChart(c);
  if (!ret.ok) {
    return ret;
  }
  if (c.Vertices[0].duration !== 0) {
    return error(
      `Start Milestone must have duration of 0, instead got ${c.Vertices[0].duration}`
    );
  }
  if (c.Vertices[c.Vertices.length - 1].duration !== 0) {
    return error(
      `Finish Milestone must have duration of 0, instead got ${
        c.Vertices[c.Vertices.length - 1].duration
      }`
    );
  }
  return ret;
}
