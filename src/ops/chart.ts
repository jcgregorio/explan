import { Result, ok, error } from "../result";
import { DirectedEdge, edgesBySrcAndDstToMap } from "../dag/dag";
import { Plan } from "../plan/plan";
import { Chart, Task, TaskState } from "../chart/chart";
import { Op, SubOp, SubOpResult } from "./ops";
import { DurationModel } from "../duration/duration";

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

  apply(plan: Plan): Result<SubOpResult> {
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

  apply(plan: Plan): Result<SubOpResult> {
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

  constructor(index: number) {
    this.index = index;
  }

  apply(plan: Plan): Result<SubOpResult> {
    const chart = plan.chart;
    const ret = indexInRangeForVertices(this.index, chart);
    if (!ret.ok) {
      return ret;
    }
    plan.chart.Vertices.splice(this.index + 1, 0, plan.newTask());

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

  apply(plan: Plan): Result<SubOpResult> {
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

  apply(plan: Plan): Result<SubOpResult> {
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

  apply(plan: Plan): Result<SubOpResult> {
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

  apply(plan: Plan): Result<SubOpResult> {
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

  apply(plan: Plan): Result<SubOpResult> {
    plan.chart.Edges.push(...this.edges);

    return ok({ plan: plan, inverse: new RemoveAllEdgesSubOp(this.edges) });
  }
}

export class DeleteTaskSubOp implements SubOp {
  index: number = 0;

  constructor(index: number) {
    this.index = index;
  }

  apply(plan: Plan): Result<SubOpResult> {
    const chart = plan.chart;
    const ret = indexInRangeForVertices(this.index, chart);
    if (!ret.ok) {
      return ret;
    }
    chart.Vertices.splice(this.index, 1);

    // Update Edges.
    for (let i = 0; i < chart.Edges.length; i++) {
      const edge = chart.Edges[i];
      if (edge.i > this.index) {
        edge.i--;
      }
      if (edge.j > this.index) {
        edge.j--;
      }
    }

    return ok({ plan: plan, inverse: this.inverse() });
  }

  inverse(): SubOp {
    return new AddTaskAfterSubOp(this.index - 1);
  }
}

export class RationalizeEdgesSubOp implements SubOp {
  constructor() {}

  apply(plan: Plan): Result<SubOpResult> {
    const srcAndDst = edgesBySrcAndDstToMap(plan.chart.Edges);
    const Start = 0;
    const Finish = plan.chart.Vertices.length - 1;

    // loop over all vertics from [Start, Finish) and look for their
    // destinations. If they have none then add in an edge to Finish. If they
    // have more than one then remove any links to Finish.
    for (let i = Start; i < Finish; i++) {
      const destinations = srcAndDst.bySrc.get(i);
      if (destinations === undefined) {
        plan.chart.Edges.push(new DirectedEdge(i, Finish));
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
        plan.chart.Edges.push(new DirectedEdge(Start, i));
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

  apply(plan: Plan): Result<SubOpResult> {
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

export class SetTaskDurationModelSubOp implements SubOp {
  taskIndex: number;
  durationModel: DurationModel;

  constructor(taskIndex: number, durationModel: DurationModel) {
    this.taskIndex = taskIndex;
    this.durationModel = durationModel;
  }

  apply(plan: Plan): Result<SubOpResult> {
    const ret = indexInRangeForVertices(this.taskIndex, plan.chart);
    if (!ret.ok) {
      return ret;
    }
    const oldModel = plan.chart.Vertices[this.taskIndex].durationModel;
    plan.chart.Vertices[this.taskIndex].durationModel = this.durationModel;
    return ok({
      plan: plan,
      inverse: this.inverse(oldModel),
    });
  }

  inverse(durationModel: DurationModel): SubOp {
    return new SetTaskDurationModelSubOp(this.taskIndex, durationModel);
  }
}

export class SetTaskStateSubOp implements SubOp {
  taskState: TaskState;
  taskIndex: number;

  constructor(taskIndex: number, taskState: TaskState) {
    this.taskIndex = taskIndex;
    this.taskState = taskState;
  }

  apply(plan: Plan): Result<SubOpResult> {
    const ret = indexInRangeForVertices(this.taskIndex, plan.chart);
    if (!ret.ok) {
      return ret;
    }
    const oldState = plan.chart.Vertices[this.taskIndex].state;
    plan.chart.Vertices[this.taskIndex].state = this.taskState;
    return ok({
      plan: plan,
      inverse: this.inverse(oldState),
    });
  }

  inverse(taskState: TaskState): SubOp {
    return new SetTaskStateSubOp(this.taskIndex, taskState);
  }
}

export function InsertNewEmptyTaskAfterOp(taskIndex: number): Op {
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

export function SetTaskDurationModelOp(
  taskIndex: number,
  durationModel: DurationModel
): Op {
  return new Op([new SetTaskDurationModelSubOp(taskIndex, durationModel)]);
}

export function SetTaskStateOp(taskIndex: number, taskState: TaskState): Op {
  return new Op([new SetTaskStateSubOp(taskIndex, taskState)]);
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

export function AddEdgeOp(fromTaskIndex: number, toTaskIndex: number): Op {
  return new Op([
    new RationalizeEdgesSubOp(),
    new AddEdgeSubOp(fromTaskIndex, toTaskIndex),
    new RationalizeEdgesSubOp(),
  ]);
}
