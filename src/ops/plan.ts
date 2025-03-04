// Ops for updating a Plan's start status and the completion status of Tasks.

import { Task } from "../chart/chart";
import { Plan } from "../plan/plan";
import { PlanStatus, fromJSON, toJSON } from "../plan_status/plan_status";
import { Result, error, ok } from "../result";
import {
  TaskCompletion,
  TaskCompletions,
  taskCompletionsFromJSON,
  taskCompletionsToJSON,
  taskUnstarted,
} from "../task_completion/task_completion";
import { Op, SubOp, SubOpResult } from "./ops";
import {
  toJSON as taskToJSON,
  fromJSON as taskFromJSON,
} from "../task_completion/task_completion";

// SetTaskStartState
// UpdatePercentComplete
// UpdateTaskStartDate
// SetTaskFinishedState

export class SetPlanStartStateSubOp implements SubOp {
  value: PlanStatus;
  taskCompletions: TaskCompletions | null = null;

  constructor(
    value: PlanStatus,
    taskCompletions: TaskCompletions | null = null
  ) {
    this.value = value;
    this.taskCompletions = taskCompletions;
  }

  applyTo(plan: Plan): Result<SubOpResult> {
    const oldStatus = fromJSON(toJSON(plan.status));
    plan.status = this.value;

    const taskCompletionsSnapshot = taskCompletionsFromJSON(
      taskCompletionsToJSON(plan.taskCompletion)
    );

    if (this.taskCompletions !== null) {
      plan.taskCompletion = this.taskCompletions;
    }

    if (plan.status.stage === "unstarted") {
      // Now loop over every task and set the TaskCompletion to unstarted.
      plan.chart.Vertices.forEach((task: Task, index: number) => {
        plan.taskCompletion[task.id] = { stage: "unstarted" };
      });
    }

    return ok({
      plan: plan,
      inverse: new SetPlanStartStateSubOp(oldStatus, taskCompletionsSnapshot),
    });
  }
}

export class UpdatePlanStartDateSubOp implements SubOp {
  start: number;

  constructor(start: number) {
    this.start = start;
  }

  applyTo(plan: Plan): Result<SubOpResult> {
    if (plan.status.stage !== "started") {
      return error(new Error("Can't set start date on an unstarted plan."));
    }
    const oldStart = plan.status.start;
    plan.status.start = this.start;

    return ok({
      plan: plan,
      inverse: new UpdatePlanStartDateSubOp(oldStart),
    });
  }
}

export class SetTaskCompletionSubOp implements SubOp {
  taskIndex: number;
  value: TaskCompletion;

  constructor(taskIndex: number, value: TaskCompletion) {
    this.taskIndex = taskIndex;
    this.value = value;
  }

  applyTo(plan: Plan): Result<SubOpResult> {
    if (this.value.stage !== "unstarted" && plan.status.stage === "unstarted") {
      return error(
        new Error("Can't start a task if the plan hasn't been started.")
      );
    }
    const task = plan.chart.Vertices[this.taskIndex];
    const oldTaskStatus = taskFromJSON(
      taskToJSON(plan.taskCompletion[task.id] || taskUnstarted)
    );
    plan.taskCompletion[task.id] = this.value;

    return ok({
      plan: plan,
      inverse: new SetTaskCompletionSubOp(this.taskIndex, oldTaskStatus),
    });
  }
}

export function SetTaskCompletionOp(
  taskIndex: number,
  value: TaskCompletion
): Op {
  return new Op([new SetTaskCompletionSubOp(taskIndex, value)]);
}

export function SetPlanStartStateOp(value: PlanStatus): Op {
  return new Op([new SetPlanStartStateSubOp(value)]);
}

export function UpdatePlanStartDateOp(start: number): Op {
  return new Op([new UpdatePlanStartDateSubOp(start)]);
}
