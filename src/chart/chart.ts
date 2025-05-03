import { Result, ok, error } from '../result.ts';
import {
  VertexIndices,
  Edges,
  DirectedGraph,
  edgesBySrcToMap,
  edgesByDstToMap,
  DirectedEdge,
  DirectedEdgeSerialized,
} from '../dag/dag';

import { topologicalSort } from '../dag/algorithms/toposort.ts';
import { MetricValues } from '../metrics/metrics.ts';
import { TaskDuration } from '../types/types.ts';

export const DEFAULT_TASK_NAME = 'Task Name';

export interface TaskSerialized {
  resources: { [key: string]: string };
  metrics: MetricValues;
  name: string;
  id: string;
}

// Do we create sub-classes and then serialize separately? Or do we have a
// config about which type of DurationSampler is being used?
//
// We can use traditional optimistic/pessimistic value. Or Jacobian's
// uncertaintly multipliers [1.1, 1.5, 2, 5] and their inverses to generate an
// optimistic pessimistic.

/** Task is a Vertex with details about the Task to complete. */
export class Task {
  // Resource keys and values. The parent plan contains all the resource
  // definitions.
  resources: { [key: string]: string };
  metrics: MetricValues;
  name: string;
  id: string;

  constructor(name: string = '') {
    this.name = name || DEFAULT_TASK_NAME;
    this.metrics = {};
    this.resources = {};
    this.id = crypto.randomUUID();
  }

  toJSON(): TaskSerialized {
    return {
      resources: this.resources,
      metrics: this.metrics,
      name: this.name,
      id: this.id,
    };
  }

  static fromJSON(taskSerialized: TaskSerialized): Task {
    const ret = new Task(taskSerialized.name);
    ret.id = taskSerialized.id;
    ret.resources = taskSerialized.resources;
    ret.metrics = taskSerialized.metrics;

    return ret;
  }

  public get duration(): number {
    return this.getMetric('Duration')!;
  }

  public set duration(value: number) {
    this.setMetric('Duration', value);
  }

  public getMetric(key: string): number | undefined {
    return this.metrics[key];
  }

  public setMetric(key: string, value: number) {
    this.metrics[key] = value;
  }

  public deleteMetric(key: string) {
    delete this.metrics[key];
  }

  public getResource(key: string): string | undefined {
    return this.resources[key];
  }

  public setResource(key: string, value: string) {
    this.resources[key] = value;
  }

  public deleteResource(key: string) {
    delete this.resources[key];
  }

  public dup(): Task {
    const ret = new Task();
    ret.resources = Object.assign({}, this.resources);
    ret.metrics = Object.assign({}, this.metrics);
    ret.name = this.name;
    return ret;
  }
}

export type Tasks = Task[];

export interface ChartSerialized {
  vertices: TaskSerialized[];
  edges: DirectedEdgeSerialized[];
}

/** A Chart is a DirectedGraph, but with Tasks for Vertices. */
export class Chart {
  Vertices: Tasks;
  Edges: Edges;

  constructor() {
    const start = new Task('Start');
    start.setMetric('Duration', 0);
    const finish = new Task('Finish');
    finish.setMetric('Duration', 0);
    this.Vertices = [start, finish];
    this.Edges = [new DirectedEdge(0, 1)];
  }

  toJSON(): ChartSerialized {
    return {
      vertices: this.Vertices.map((t: Task) => t.toJSON()),
      edges: this.Edges.map((e: DirectedEdge) => e.toJSON()),
    };
  }

  static fromJSON(chartSerialized: ChartSerialized): Chart {
    const ret = new Chart();
    ret.Vertices = chartSerialized.vertices.map((ts: TaskSerialized) =>
      Task.fromJSON(ts)
    );
    ret.Edges = chartSerialized.edges.map(
      (directedEdgeSerialized: DirectedEdgeSerialized) =>
        DirectedEdge.fromJSON(directedEdgeSerialized)
    );
    return ret;
  }
}

export type TopologicalOrder = VertexIndices;

export type ValidateResult = Result<TopologicalOrder>;

/** Validates the DirectedGraph component of a Chart is valid. */
export function validateDirectedGraph(g: DirectedGraph): ValidateResult {
  if (g.Vertices.length < 2) {
    return error(
      'Chart must contain at least two node, the start and finish tasks.'
    );
  }

  const edgesByDst = edgesByDstToMap(g.Edges);
  const edgesBySrc = edgesBySrcToMap(g.Edges);

  // The first Vertex, T_0 aka the Start Milestone, must have 0 incoming edges.
  if (edgesByDst.get(0) !== undefined) {
    return error('The start node (0) has an incoming edge.');
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
      'The last node, which should be the Finish Milestone, has an outgoing edge.'
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
    return error(`Chart has cycle: ${[...tsRet.cycle].join(', ')}`);
  }

  return ok(tsRet.order);
}

export function ChartValidate(
  c: Chart,
  taskDuration: TaskDuration | null = null
): ValidateResult {
  if (taskDuration === null) {
    taskDuration = (taskIndex: number) => c.Vertices[taskIndex].duration;
  }
  const ret = validateDirectedGraph(c);
  if (!ret.ok) {
    return ret;
  }
  if (taskDuration(0) !== 0) {
    return error(
      `Start Milestone must have duration of 0, instead got ${taskDuration(0)}`
    );
  }
  if (taskDuration(c.Vertices.length - 1) !== 0) {
    return error(
      `Finish Milestone must have duration of 0, instead got ${taskDuration(
        c.Vertices.length - 1
      )}`
    );
  }
  const allIDs = new Set();
  for (let taskIndex = 0; taskIndex < c.Vertices.length; taskIndex++) {
    const task = c.Vertices[taskIndex];
    if (allIDs.has(task.id)) {
      return error(new Error(`Two tasks contain the same ID: ${task.id}`));
    }
    allIDs.add(task.id);
  }
  return ret;
}
