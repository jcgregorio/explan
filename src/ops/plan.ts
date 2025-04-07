// Ops for updating a Plan's start status and the completion status of Tasks.

import { Task } from '../chart/chart';
import { Plan } from '../plan/plan';
import { PlanStatus, fromJSON, toJSON } from '../plan_status/plan_status';
import { Result, error, ok } from '../result';
import {
  TaskCompletion,
  TaskCompletions,
  taskCompletionsFromJSON,
  taskCompletionsToJSON,
} from '../task_completion/task_completion';
import { Op, SubOp, SubOpResult } from './ops';
import {
  toJSON as taskToJSON,
  fromJSON as taskFromJSON,
} from '../task_completion/task_completion';
import { UnitTypes } from '../units/unit';

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

    if (plan.status.stage === 'unstarted') {
      // Now loop over every task and set the TaskCompletion to unstarted.
      plan.chart.Vertices.forEach((task: Task) => {
        plan.taskCompletion[task.id] = { stage: 'unstarted' };
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
    if (plan.status.stage !== 'started') {
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

export class SetPlanUnitsSubOp implements SubOp {
  unit: UnitTypes;

  constructor(unit: UnitTypes) {
    this.unit = unit;
  }

  applyTo(plan: Plan): Result<SubOpResult> {
    const oldUnits = plan.durationUnits.kind();
    plan.setDurationUnits(this.unit);

    return ok({
      plan: plan,
      inverse: new SetPlanUnitsSubOp(oldUnits),
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
    if (this.value.stage !== 'unstarted' && plan.status.stage === 'unstarted') {
      return error(
        new Error("Can't start a task if the plan hasn't been started.")
      );
    }
    if (this.value.stage === 'started') {
      if (this.value.start < 0) {
        return error(
          new Error(
            "The start of a task can't come befoe the start of the plan."
          )
        );
      }
      if (this.value.percentComplete < 1 || this.value.percentComplete > 99) {
        return error(new Error('Percent Complete must be in [1, 99].'));
      }
    }
    if (this.value.stage === 'finished') {
      if (this.value.span.finish < this.value.span.start) {
        return error(new Error("Finish can't come before Start."));
      }
      if (this.value.span.start < 0) {
        return error(
          new Error(
            "The start of a task can't come befoe the start of the plan."
          )
        );
      }
    }

    const ret = plan.getTaskCompletion(this.taskIndex);
    if (!ret.ok) {
      return ret;
    }

    const oldTaskStatus = taskFromJSON(taskToJSON(ret.value));
    const setRet = plan.setTaskCompletion(this.taskIndex, this.value);
    if (!setRet.ok) {
      return setRet;
    }

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

export function SetPlanUnitsOp(unit: UnitTypes): Op {
  return new Op([new SetPlanUnitsSubOp(unit)]);
}

export function SetPlanStartStateOp(value: PlanStatus): Op {
  return new Op([new SetPlanStartStateSubOp(value)]);
}

export function UpdatePlanStartDateOp(start: number): Op {
  return new Op([new UpdatePlanStartDateSubOp(start)]);
}
