// Ops for updating a Plan's start status and the completion status of Tasks.

import { Task } from "../chart/chart";
import { Plan } from "../plan/plan";
import { fromJSON, toJSON } from "../plan_status/plan_status";
import { Result, error, ok } from "../result";
import {
  TaskCompletions,
  taskCompletionsFromJSON,
  taskCompletionsToJSON,
} from "../task_completion/task_completion";
import { Op, SubOp, SubOpResult } from "./ops";

// UpdatePlanStartDate

// SetTaskStartState
// UpdatePercentComplete
// UpdateTaskStartDate
// SetTaskFinishedState

export class SetPlanStartStateSubOp implements SubOp {
  stage: string;
  start: number;
  taskCompletions: TaskCompletions | null;

  constructor(
    stage: string,
    start: number,
    taskCompletions: TaskCompletions | null = null
  ) {
    this.stage = stage;
    this.start = start;
    this.taskCompletions = taskCompletions;
  }

  applyTo(plan: Plan): Result<SubOpResult> {
    const oldStatus = fromJSON(toJSON(plan.status));
    plan.status = fromJSON({
      stage: this.stage,
      start: this.start,
    });

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
      inverse: new SetPlanStartStateSubOp(
        oldStatus.stage,
        oldStatus.start,
        taskCompletionsSnapshot
      ),
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

export function SetPlanStartStateOp(stage: string, start: number): Op {
  return new Op([new SetPlanStartStateSubOp(stage, start)]);
}

export function UpdatePlanStartDateOp(start: number): Op {
  return new Op([new UpdatePlanStartDateSubOp(start)]);
}
