import { Result, ok, error } from "../result";
import { DirectedEdge } from "../dag/dag";
import { Plan } from "../plan/plan";
import { Task } from "../chart/chart";
import { Op, SubOp, SubOpResult } from "./ops";

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
    const e = DirectedEdgeForPlan(this.i, this.j, plan);
    if (!e.ok) {
      return e;
    }
    plan.chart.Edges.push(e.value);
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
    const chart = plan.chart;
    const e = DirectedEdgeForPlan(this.i, this.j, plan);
    if (!e.ok) {
      return e;
    }
    chart.Edges = chart.Edges.filter((v: DirectedEdge): boolean => {
      if (v.i === e.value.i && v.j === e.value.j) {
        return false;
      }
      return true;
    });
    return ok({
      plan: plan,
      inverse: this.inverse(),
    });
  }

  inverse(): SubOp {
    return new AddEdgeSubOp(this.i, this.j);
  }
}

export class AddTaskAfterSubOp implements SubOp {
  index: number = 0;

  constructor(index: number) {
    this.index = index;
  }

  apply(plan: Plan): Result<SubOpResult> {
    const chart = plan.chart;
    if (this.index < 0 || this.index > chart.Vertices.length - 2) {
      return error(
        `${this.index} is not in range [0, ${chart.Vertices.length - 2}]`
      );
    }
    plan.chart.Vertices.splice(this.index + 1, 0, new Task());

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
    return ok({plan:plan, inverse: this.inverse()});
  }

  inverse(): SubOp {
    return new DeleteTaskAfterSubOp(this.index);
  }
}

export class DeleteTaskAfterSubOp implements SubOp {
  index: number = 0;

  constructor(index: number) {
    this.index = index;
  }

  apply(plan: Plan): Result<SubOpResult> {
    const chart = plan.chart;
    if (this.index < 0 || this.index > chart.Vertices.length - 2) {
      return error(
        `${this.index} is not in range [0, ${chart.Vertices.length - 2}]`
      );
    }
    chart.Vertices.splice(this.index + 1, 1);

    // Update Edges.
    for (let i = 0; i < chart.Edges.length; i++) {
      const edge = chart.Edges[i];
      if (edge.i >= this.index + 1) {
        edge.i--;
      }
      if (edge.j >= this.index + 1) {
        edge.j--;
      }
    }

    return ok({plan:plan, inverse:this.inverse});
  }

  inverse(): SubOp {
    return new AddTaskAfterSubOp(this.index);
  }
}

export function InsertNewEmptyTaskAfterOp(index: number): Op {
  return new Op([
    new AddTaskAfterSubOp(index),
    new AddEdgeSubOp(0, index + 1),
    new AddEdgeSubOp(index + 1, -1),
  ]);
}
