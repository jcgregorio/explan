// AddMetric
// DeleteMetric
// RenameMetric
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
    return new DeleteMetricSupOp(this.name);
  }
}

export class DeleteMetricSupOp implements SubOp {
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

export function AddMetricOp(
  name: string,
  metricDefinition: MetricDefinition
): Op {
  return new Op([new AddMetricSubOp(name, metricDefinition)]);
}

export function DeleteMetricOp(name: string): Op {
  return new Op([new DeleteMetricSupOp(name)]);
}
