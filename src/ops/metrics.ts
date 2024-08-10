// ChangeMetricDefinition
// ChangeMetricValue

import { Task } from "../chart/chart";
import { MetricDefinition } from "../metrics/metrics";
import { Plan } from "../plan/plan";
import { Result, error, ok } from "../result";
import { Op, SubOp, SubOpResult } from "./ops";

export class AddMetricSubOp implements SubOp {
  name: string;
  metricDefinition: MetricDefinition;

  // Maps an index of a Task to a value for the given metric key.
  taskMetricValues: Map<number, number>;

  constructor(
    name: string,
    metricDefinition: MetricDefinition,
    taskMetricValues: Map<number, number> = new Map() // Should only be supplied by inverse actions.
  ) {
    this.name = name;
    this.metricDefinition = metricDefinition;
    this.taskMetricValues = taskMetricValues;
  }

  apply(plan: Plan): Result<SubOpResult> {
    if (plan.metricDefinitions.has(this.name)) {
      return error(`${this.name} already exists as a Metric`);
    }

    plan.metricDefinitions.set(this.name, this.metricDefinition);

    // Now loop over every task and add this metric and set it to the default,
    // unless there is matching entry in taskMetricValues, in which case we will
    // use that value, i.e. this AddMetricSubOp is actually a revert of a
    // DeleteMetricSubOp.
    plan.chart.Vertices.forEach((task: Task, index: number) => {
      task.metrics.set(
        this.name,
        this.taskMetricValues.get(index) || this.metricDefinition.default
      );
    });

    return ok({ plan: plan, inverse: this.inverse() });
  }

  inverse(): SubOp {
    return new DeleteMetricSubOp(this.name);
  }
}

export class DeleteMetricSubOp implements SubOp {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  apply(plan: Plan): Result<SubOpResult> {
    const metricDefinition = plan.metricDefinitions.get(this.name);

    if (metricDefinition === undefined) {
      return error(
        `The metric with name ${this.name} does not exist and can't be deleted.`
      );
    }

    if (metricDefinition.isStatic) {
      return error(`The static Metric ${this.name} can't be deleted.`);
    }

    // Remove from resource definitions.
    plan.metricDefinitions.delete(this.name);

    const taskIndexToDeletedMetricValue: Map<number, number> = new Map();

    // Now look at all Tasks and remove `this.name` from the metric while also
    // building up the info needed for a revert.
    plan.chart.Vertices.forEach((task: Task, index: number) => {
      const value = task.metrics.get(this.name);
      if (value !== undefined) {
        taskIndexToDeletedMetricValue.set(index, value);
      }
      task.metrics.delete(this.name);
    });

    return ok({
      plan: plan,
      inverse: this.inverse(metricDefinition, taskIndexToDeletedMetricValue),
    });
  }

  private inverse(
    metricDefinition: MetricDefinition,
    metricValuesForDeletedResourceName: Map<number, number>
  ): SubOp {
    return new AddMetricSubOp(
      this.name,
      metricDefinition,
      metricValuesForDeletedResourceName
    );
  }
}

export class RenameMetricSubOp implements SubOp {
  oldName: string;
  newName: string;

  constructor(oldName: string, newName: string) {
    this.oldName = oldName;
    this.newName = newName;
  }

  apply(plan: Plan): Result<SubOpResult> {
    if (plan.metricDefinitions.has(this.newName)) {
      return error(`${this.newName} already exists as a metric.`);
    }

    const metricDefinition = plan.metricDefinitions.get(this.oldName);
    if (metricDefinition === undefined) {
      return error(`${this.oldName} does not exist as a Metric`);
    }
    if (metricDefinition.isStatic) {
      return error(`Static metric ${this.oldName} can't be renamed.`);
    }

    plan.metricDefinitions.set(this.newName, metricDefinition);
    plan.metricDefinitions.delete(this.oldName);

    // Now loop over every task and rename this metric.
    plan.chart.Vertices.forEach((task: Task) => {
      const value = task.metrics.get(this.oldName) || metricDefinition.default;
      task.metrics.set(this.newName, value);
      task.metrics.delete(this.oldName);
    });

    return ok({ plan: plan, inverse: this.inverse() });
  }

  inverse(): SubOp {
    return new RenameMetricSubOp(this.newName, this.oldName);
  }
}

export function AddMetricOp(
  name: string,
  metricDefinition: MetricDefinition
): Op {
  return new Op([new AddMetricSubOp(name, metricDefinition)]);
}

export function DeleteMetricOp(name: string): Op {
  return new Op([new DeleteMetricSubOp(name)]);
}

export function RenameMetricOp(oldName: string, newName: string): Op {
  return new Op([new RenameMetricSubOp(oldName, newName)]);
}
