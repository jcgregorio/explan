import { Result, ok, error } from "../result.ts";
import { DirectedEdge, edgesBySrcAndDstToMap } from "../dag/dag.ts";
import { Plan } from "../plan/plan.ts";
import { Chart, Task } from "../chart/chart.ts";
import { Op, SubOp, SubOpResult } from "./ops.ts";
import { SetMetricValueOp, SetMetricValueSubOp } from "./metrics.ts";

/** A value of -1 for j means the Finish Milestone. */
export function DirectedEdgeForPlan(
  i: number,
  j: number,
  plan: Plan
): Result<DirectedEdge> {
  const chart = plan.chart;
  if (j === -1) {
    j = chart.Vertices.length - 1;
  }
  if (i < 0 || i >= chart.Vertices.length) {
    return error(
      `i index out of range: ${i} not in [0, ${chart.Vertices.length - 1}]`
    );
  }
  if (j < 0 || j >= chart.Vertices.length) {
    return error(
      `j index out of range: ${j} not in [0, ${chart.Vertices.length - 1}]`
    );
  }
  if (i === j) {
    return error(`A Task can not depend on itself: ${i} === ${j}`);
  }
  return ok(new DirectedEdge(i, j));
}

export class AddEdgeSubOp implements SubOp {
  i: number = 0;
  j: number = 0;

  constructor(i: number, j: number) {
    this.i = i;
    this.j = j;
  }

  applyTo(plan: Plan): Result<SubOpResult> {
    if (this.i === -1) {
      this.i = plan.chart.Vertices.length - 1;
    }
    if (this.j === -1) {
      this.j = plan.chart.Vertices.length - 1;
    }

    const e = DirectedEdgeForPlan(this.i, this.j, plan);
    if (!e.ok) {
      return e;
    }

    // Only add the edge if it doesn't exists already.
    if (!plan.chart.Edges.find((value: DirectedEdge) => value.equal(e.value))) {
      plan.chart.Edges.push(e.value);
    }

    return ok({
      plan: plan,
      inverse: this.inverse(),
    });
  }

  inverse(): SubOp {
    return new RemoveEdgeSupOp(this.i, this.j);
  }
}

export class RemoveEdgeSupOp implements SubOp {
  i: number = 0;
  j: number = 0;

  constructor(i: number, j: number) {
    this.i = i;
    this.j = j;
  }

  applyTo(plan: Plan): Result<SubOpResult> {
    if (this.i === -1) {
      this.i = plan.chart.Vertices.length - 1;
    }
    if (this.j === -1) {
      this.j = plan.chart.Vertices.length - 1;
    }

    const e = DirectedEdgeForPlan(this.i, this.j, plan);
    if (!e.ok) {
      return e;
    }
    plan.chart.Edges = plan.chart.Edges.filter(
      (v: DirectedEdge): boolean => !v.equal(e.value)
    );

    return ok({
      plan: plan,
      inverse: this.inverse(),
    });
  }

  inverse(): SubOp {
    return new AddEdgeSubOp(this.i, this.j);
  }
}

function indexInRangeForVertices(index: number, chart: Chart): Result<null> {
  if (index < 0 || index > chart.Vertices.length - 2) {
    return error(`${index} is not in range [0, ${chart.Vertices.length - 2}]`);
  }
  return ok(null);
}

function indexInRangeForVerticesExclusive(
  index: number,
  chart: Chart
): Result<null> {
  if (index < 1 || index > chart.Vertices.length - 2) {
    return error(`${index} is not in range [1, ${chart.Vertices.length - 2}]`);
  }
  return ok(null);
}

export class AddTaskAfterSubOp implements SubOp {
  index: number = 0;
  fullTaskToBeRestored: FullTaskToBeRestored | null;

  constructor(
    index: number,
    fullTaskToBeRestored: FullTaskToBeRestored | null = null
  ) {
    this.index = index;
    this.fullTaskToBeRestored = fullTaskToBeRestored;
  }

  applyTo(plan: Plan): Result<SubOpResult> {
    const chart = plan.chart;
    const ret = indexInRangeForVertices(this.index, chart);
    if (!ret.ok) {
      return ret;
    }
    let task = plan.newTask();
    if (this.fullTaskToBeRestored !== null) {
      task = this.fullTaskToBeRestored.task;
    }
    plan.chart.Vertices.splice(this.index + 1, 0, task);

    // Update Edges.
    for (let i = 0; i < chart.Edges.length; i++) {
      const edge = chart.Edges[i];
      if (edge.i >= this.index + 1) {
        edge.i++;
      }
      if (edge.j >= this.index + 1) {
        edge.j++;
      }
    }

    if (this.fullTaskToBeRestored !== null) {
      chart.Edges.push(...this.fullTaskToBeRestored.edges);
    }

    return ok({ plan: plan, inverse: this.inverse() });
  }

  inverse(): SubOp {
    return new DeleteTaskSubOp(this.index + 1);
  }
}

export class DupTaskSubOp implements SubOp {
  index: number = 0;

  constructor(index: number) {
    this.index = index;
  }

  applyTo(plan: Plan): Result<SubOpResult> {
    const chart = plan.chart;
    const ret = indexInRangeForVerticesExclusive(this.index, chart);
    if (!ret.ok) {
      return ret;
    }

    const copy = plan.chart.Vertices[this.index].dup();
    // Insert the duplicate immediately after the Task it is copied from.
    plan.chart.Vertices.splice(this.index, 0, copy);

    // Update Edges.
    for (let i = 0; i < chart.Edges.length; i++) {
      const edge = chart.Edges[i];
      if (edge.i > this.index) {
        edge.i++;
      }
      if (edge.j > this.index) {
        edge.j++;
      }
    }
    return ok({ plan: plan, inverse: this.inverse() });
  }

  inverse(): SubOp {
    return new DeleteTaskSubOp(this.index + 1);
  }
}

type Substitution = Map<DirectedEdge, DirectedEdge>;

export class MoveAllOutgoingEdgesFromToSubOp implements SubOp {
  fromTaskIndex: number = 0;
  toTaskIndex: number = 0;
  actualMoves: Substitution;

  constructor(
    fromTaskIndex: number,
    toTaskIndex: number,
    actualMoves: Substitution = new Map()
  ) {
    this.fromTaskIndex = fromTaskIndex;
    this.toTaskIndex = toTaskIndex;
    this.actualMoves = actualMoves;
  }

  applyTo(plan: Plan): Result<SubOpResult> {
    const chart = plan.chart;
    let ret = indexInRangeForVerticesExclusive(this.fromTaskIndex, chart);
    if (!ret.ok) {
      return ret;
    }
    ret = indexInRangeForVerticesExclusive(this.toTaskIndex, chart);
    if (!ret.ok) {
      return ret;
    }

    if (this.actualMoves.values.length === 0) {
      const actualMoves: Substitution = new Map();
      // Update all Edges that start at 'fromTaskIndex' and change the start to 'toTaskIndex'.
      for (let i = 0; i < chart.Edges.length; i++) {
        const edge = chart.Edges[i];
        // Skip the corner case there fromTaskIndex points to TaskIndex.
        if (edge.i === this.fromTaskIndex && edge.j === this.toTaskIndex) {
          continue;
        }

        if (edge.i === this.fromTaskIndex) {
          actualMoves.set(
            new DirectedEdge(this.toTaskIndex, edge.j),
            new DirectedEdge(edge.i, edge.j)
          );
          edge.i = this.toTaskIndex;
        }
      }
      return ok({
        plan: plan,
        inverse: this.inverse(
          this.toTaskIndex,
          this.fromTaskIndex,
          actualMoves
        ),
      });
    } else {
      for (let i = 0; i < chart.Edges.length; i++) {
        const newEdge = this.actualMoves.get(plan.chart.Edges[i]);
        if (newEdge !== undefined) {
          plan.chart.Edges[i] = newEdge;
        }
      }

      return ok({
        plan: plan,
        inverse: new MoveAllOutgoingEdgesFromToSubOp(
          this.toTaskIndex,
          this.fromTaskIndex
        ),
      });
    }
  }

  inverse(
    toTaskIndex: number,
    fromTaskIndex: number,
    actualMoves: Substitution
  ): SubOp {
    return new MoveAllOutgoingEdgesFromToSubOp(
      toTaskIndex,
      fromTaskIndex,
      actualMoves
    );
  }
}

export class CopyAllEdgesFromToSubOp implements SubOp {
  fromIndex: number = 0;
  toIndex: number = 0;

  constructor(fromIndex: number, toIndex: number) {
    this.fromIndex = fromIndex;
    this.toIndex = toIndex;
  }

  applyTo(plan: Plan): Result<SubOpResult> {
    const ret = indexInRangeForVertices(this.fromIndex, plan.chart);
    if (!ret.ok) {
      return ret;
    }

    const newEdges: DirectedEdge[] = [];
    plan.chart.Edges.forEach((edge: DirectedEdge) => {
      if (edge.i === this.fromIndex) {
        newEdges.push(new DirectedEdge(this.toIndex, edge.j));
      }
      if (edge.j === this.fromIndex) {
        newEdges.push(new DirectedEdge(edge.i, this.toIndex));
      }
    });
    plan.chart.Edges.push(...newEdges);

    return ok({ plan: plan, inverse: new RemoveAllEdgesSubOp(newEdges) });
  }
}

export class RemoveAllEdgesSubOp implements SubOp {
  edges: DirectedEdge[];

  constructor(edges: DirectedEdge[]) {
    this.edges = edges;
  }

  applyTo(plan: Plan): Result<SubOpResult> {
    plan.chart.Edges = plan.chart.Edges.filter(
      (edge: DirectedEdge) =>
        -1 ===
        this.edges.findIndex((toBeRemoved: DirectedEdge) =>
          edge.equal(toBeRemoved)
        )
    );

    return ok({ plan: plan, inverse: new AddAllEdgesSubOp(this.edges) });
  }
}

export class AddAllEdgesSubOp implements SubOp {
  edges: DirectedEdge[];

  constructor(edges: DirectedEdge[]) {
    this.edges = edges;
  }

  applyTo(plan: Plan): Result<SubOpResult> {
    plan.chart.Edges.push(...this.edges);

    return ok({ plan: plan, inverse: new RemoveAllEdgesSubOp(this.edges) });
  }
}

interface FullTaskToBeRestored {
  edges: DirectedEdge[];
  task: Task;
}

export class DeleteTaskSubOp implements SubOp {
  index: number = 0;

  constructor(index: number) {
    this.index = index;
  }

  applyTo(plan: Plan): Result<SubOpResult> {
    const chart = plan.chart;
    const ret = indexInRangeForVertices(this.index, chart);
    if (!ret.ok) {
      return ret;
    }

    const edgesToBeRestored = chart.Edges.filter((de: DirectedEdge) => {
      if (de.i === this.index || de.j === this.index) {
        return true;
      }
      return false;
    });

    // First remove all edges to and from the task.
    chart.Edges = chart.Edges.filter((de: DirectedEdge) => {
      if (de.i === this.index || de.j === this.index) {
        return false;
      }
      return true;
    });

    // Update edges for tasks that will end up at a new index.
    for (let i = 0; i < chart.Edges.length; i++) {
      const edge = chart.Edges[i];
      if (edge.i > this.index) {
        edge.i--;
      }
      if (edge.j > this.index) {
        edge.j--;
      }
    }

    const taskToBeRestored = chart.Vertices.splice(this.index, 1);
    const fullTaskToBeRestored = {
      edges: edgesToBeRestored,
      task: taskToBeRestored[0],
    };
    return ok({ plan: plan, inverse: this.inverse(fullTaskToBeRestored) });
  }

  inverse(fullTaskToBeRestored: FullTaskToBeRestored): SubOp {
    return new AddTaskAfterSubOp(this.index - 1, fullTaskToBeRestored);
  }
}

export class RationalizeEdgesSubOp implements SubOp {
  constructor() {}

  applyTo(plan: Plan): Result<SubOpResult> {
    const srcAndDst = edgesBySrcAndDstToMap(plan.chart.Edges);
    const Start = 0;
    const Finish = plan.chart.Vertices.length - 1;

    // loop over all vertics from [Start, Finish) and look for their
    // destinations. If they have none then add in an edge to Finish. If they
    // have more than one then remove any links to Finish.
    for (let i = Start; i < Finish; i++) {
      const destinations = srcAndDst.bySrc.get(i);
      if (destinations === undefined) {
        const toBeAdded = new DirectedEdge(i, Finish);
        plan.chart.Edges.push(toBeAdded);
      } else {
        // Are there any uneeded Egdes to Finish? If so filter them out.
        if (
          destinations.length > 1 &&
          destinations.find((value: DirectedEdge) => value.j === Finish)
        ) {
          const toBeRemoved = new DirectedEdge(i, Finish);
          plan.chart.Edges = plan.chart.Edges.filter(
            (value: DirectedEdge) => !toBeRemoved.equal(value)
          );
        }
      }
    }

    // loop over all vertics from(Start, Finish] and look for their sources. If
    // they have none then add in an edge from Start. If they have more than one
    // then remove any links from Start.
    for (let i = Start + 1; i < Finish; i++) {
      const destinations = srcAndDst.byDst.get(i);
      if (destinations === undefined) {
        const toBeAdded = new DirectedEdge(Start, i);
        plan.chart.Edges.push(toBeAdded);
      } else {
        // Are there any un-needed Egdes from Start? If so filter them out.
        if (
          destinations.length > 1 &&
          destinations.find((value: DirectedEdge) => value.i === Start)
        ) {
          const toBeRemoved = new DirectedEdge(Start, i);
          plan.chart.Edges = plan.chart.Edges.filter(
            (value: DirectedEdge) => !toBeRemoved.equal(value)
          );
        }
      }
    }
    if (plan.chart.Edges.length === 0) {
      plan.chart.Edges.push(new DirectedEdge(Start, Finish));
    }

    return ok({ plan: plan, inverse: this.inverse() });
  }

  inverse(): SubOp {
    return new RationalizeEdgesSubOp();
  }
}

export class SetTaskNameSubOp implements SubOp {
  taskIndex: number;
  name: string;

  constructor(taskIndex: number, name: string) {
    this.taskIndex = taskIndex;
    this.name = name;
  }

  applyTo(plan: Plan): Result<SubOpResult> {
    const ret = indexInRangeForVertices(this.taskIndex, plan.chart);
    if (!ret.ok) {
      return ret;
    }
    const oldName = plan.chart.Vertices[this.taskIndex].name;
    plan.chart.Vertices[this.taskIndex].name = this.name;
    return ok({
      plan: plan,
      inverse: this.inverse(oldName),
    });
  }

  inverse(oldName: string): SubOp {
    return new SetTaskNameSubOp(this.taskIndex, oldName);
  }
}

export function InsertNewEmptyMilestoneAfterOp(taskIndex: number): Op {
  return new Op([
    new RationalizeEdgesSubOp(),
    new AddTaskAfterSubOp(taskIndex),
    new AddEdgeSubOp(0, taskIndex + 1),
    new AddEdgeSubOp(taskIndex + 1, -1),
    new RationalizeEdgesSubOp(),
  ]);
}

export function SetTaskNameOp(taskIndex: number, name: string): Op {
  return new Op([new SetTaskNameSubOp(taskIndex, name)]);
}

export function SplitTaskOp(taskIndex: number): Op {
  const subOps: SubOp[] = [
    new DupTaskSubOp(taskIndex),
    new AddEdgeSubOp(taskIndex, taskIndex + 1),
    new MoveAllOutgoingEdgesFromToSubOp(taskIndex, taskIndex + 1),
  ];

  return new Op(subOps);
}

export function DupTaskOp(taskIndex: number): Op {
  const subOps: SubOp[] = [
    new DupTaskSubOp(taskIndex),
    new CopyAllEdgesFromToSubOp(taskIndex, taskIndex + 1),
  ];

  return new Op(subOps);
}

export function DeleteTaskOp(taskIndex: number): Op {
  return new Op([
    new RationalizeEdgesSubOp(),
    new DeleteTaskSubOp(taskIndex),
    new RationalizeEdgesSubOp(),
  ]);
}

export function AddEdgeOp(fromTaskIndex: number, toTaskIndex: number): Op {
  return new Op([
    new RationalizeEdgesSubOp(),
    new AddEdgeSubOp(fromTaskIndex, toTaskIndex),
    new RationalizeEdgesSubOp(),
  ]);
}

export function RationalizeEdgesOp(): Op {
  return new Op([new RationalizeEdgesSubOp()]);
}

export function RemoveEdgeOp(i: number, j: number): Op {
  return new Op([
    new RationalizeEdgesSubOp(),
    new RemoveEdgeSupOp(i, j),
    new RationalizeEdgesSubOp(),
  ]);
}

export function InsertNewEmptyTaskAfterOp(taskIndex: number): Op {
  return new Op([
    new RationalizeEdgesSubOp(),
    new AddTaskAfterSubOp(taskIndex),
    new SetMetricValueSubOp("Duration", 10, taskIndex + 1),
    new AddEdgeSubOp(0, taskIndex + 1),
    new AddEdgeSubOp(taskIndex + 1, -1),
    new RationalizeEdgesSubOp(),
  ]);
}
