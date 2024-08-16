import { Result, ok, error } from "../result";
import { DirectedEdge } from "../dag/dag";
import { Plan } from "../plan/plan";
import { Task } from "../chart/chart";
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
    return ok({ plan: plan, inverse: this.inverse() });
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

    return ok({ plan: plan, inverse: this.inverse });
  }

  inverse(): SubOp {
    return new AddTaskAfterSubOp(this.index);
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
    if (this.taskIndex < 0 || this.taskIndex > plan.chart.Vertices.length - 2) {
      return error(
        `${this.taskIndex} is not in range [0, ${
          plan.chart.Vertices.length - 2
        }]`
      );
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

export class SetDurationModelSubOp implements SubOp {
  taskIndex: number;
  durationModel: DurationModel;

  constructor(taskIndex: number, durationModel: DurationModel) {
    this.taskIndex = taskIndex;
    this.durationModel = durationModel;
  }

  apply(plan: Plan): Result<SubOpResult> {
    if (this.taskIndex < 0 || this.taskIndex > plan.chart.Vertices.length - 2) {
      return error(
        `${this.taskIndex} is not in range [0, ${
          plan.chart.Vertices.length - 2
        }]`
      );
    }
    const oldModel = plan.chart.Vertices[this.taskIndex].durationModel;
    plan.chart.Vertices[this.taskIndex].durationModel = this.durationModel;
    return ok({
      plan: plan,
      inverse: this.inverse(oldModel),
    });
  }

  inverse(durationModel: DurationModel): SubOp {
    return new SetDurationModelSubOp(this.taskIndex, durationModel);
  }
}

export function InsertNewEmptyTaskAfterOp(taskIndex: number): Op {
  return new Op([
    new AddTaskAfterSubOp(taskIndex),
    new AddEdgeSubOp(0, taskIndex + 1),
    new AddEdgeSubOp(taskIndex + 1, -1),
  ]);
}

export function SetTaskNameOp(taskIndex: number, name: string): Op {
  return new Op([new SetTaskNameSubOp(taskIndex, name)]);
}
