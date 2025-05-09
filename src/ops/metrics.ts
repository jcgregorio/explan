// ChangeMetricValue

import { Task } from '../chart/chart.ts';
import { MetricDefinition } from '../metrics/metrics.ts';
import { Plan } from '../plan/plan.ts';
import { Result, error, ok } from '../result.ts';
import { Op, SubOp, SubOpResult } from './ops.ts';

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

  applyTo(plan: Plan): Result<SubOpResult> {
    if (plan.getMetricDefinition(this.name) !== undefined) {
      return error(`${this.name} already exists as a Metric`);
    }

    plan.setMetricDefinition(this.name, this.metricDefinition);

    // Now loop over every task and add this metric and set it to the default,
    // unless there is matching entry in taskMetricValues, in which case we will
    // use that value, i.e. this AddMetricSubOp is actually a revert of a
    // DeleteMetricSubOp.
    plan.chart.Vertices.forEach((task: Task, index: number) => {
      task.setMetric(
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

  applyTo(plan: Plan): Result<SubOpResult> {
    const metricDefinition = plan.getMetricDefinition(this.name);

    if (metricDefinition === undefined) {
      return error(
        `The metric with name ${this.name} does not exist and can't be deleted.`
      );
    }

    if (metricDefinition.isStatic) {
      return error(`The static Metric ${this.name} can't be deleted.`);
    }

    // Remove from resource definitions.
    plan.deleteMetricDefinition(this.name);

    const taskIndexToDeletedMetricValue: Map<number, number> = new Map();

    // Now look at all Tasks and remove `this.name` from the metric while also
    // building up the info needed for a revert.
    plan.chart.Vertices.forEach((task: Task, index: number) => {
      const value = task.getMetric(this.name);
      if (value !== undefined) {
        taskIndexToDeletedMetricValue.set(index, value);
      }
      task.deleteMetric(this.name);
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

  applyTo(plan: Plan): Result<SubOpResult> {
    if (plan.getMetricDefinition(this.newName) !== undefined) {
      return error(`${this.newName} already exists as a metric.`);
    }

    const metricDefinition = plan.getMetricDefinition(this.oldName);
    if (metricDefinition === undefined) {
      return error(`${this.oldName} does not exist as a Metric`);
    }
    if (metricDefinition.isStatic) {
      return error(`Static metric ${this.oldName} can't be renamed.`);
    }

    plan.setMetricDefinition(this.newName, metricDefinition);
    plan.deleteMetricDefinition(this.oldName);

    // Now loop over every task and rename this metric.
    plan.chart.Vertices.forEach((task: Task) => {
      const value = task.getMetric(this.oldName) || metricDefinition.default;
      task.setMetric(this.newName, value);
      task.deleteMetric(this.oldName);
    });

    return ok({ plan: plan, inverse: this.inverse() });
  }

  inverse(): SubOp {
    return new RenameMetricSubOp(this.newName, this.oldName);
  }
}

export class UpdateMetricSubOp implements SubOp {
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

  applyTo(plan: Plan): Result<SubOpResult> {
    const oldMetricDefinition = plan.getMetricDefinition(this.name);
    if (oldMetricDefinition === undefined) {
      return error(`${this.name} does not exist as a Metric`);
    }
    if (oldMetricDefinition.isStatic) {
      return error(`Static metric ${this.name} can't be updated.`);
    }

    // Rationalize default should be in [min, max].
    this.metricDefinition.default = this.metricDefinition.range.clamp(
      this.metricDefinition.default
    );

    plan.setMetricDefinition(this.name, this.metricDefinition);

    const taskMetricValues: Map<number, number> = new Map();
    // Now loop over every task and update the metric values to reflect the new
    // metric definition, unless there is matching entry in taskMetricValues, in
    // which case we will use that value, i.e. this UpdateMetricSubOp is
    // actually a revert of another UpdateMetricSubOp.
    plan.chart.Vertices.forEach((task: Task, index: number) => {
      const oldValue = task.getMetric(this.name)!;

      let newValue: number;
      if (this.taskMetricValues.has(index)) {
        // taskMetricValues has a value then use that, as this is an inverse
        // operation.
        newValue = this.taskMetricValues.get(index)!;
      } else if (
        oldValue === oldMetricDefinition.default &&
        this.metricDefinition.range.min <= oldValue &&
        this.metricDefinition.range.max > oldValue
      ) {
        // If the oldValue is the default, change it to the new default, but only if the
        // new default is in the range.
        newValue = this.metricDefinition.default;
        taskMetricValues.set(index, oldValue);

        // What might have changed is the min or max newValue, which might make
        // the default value invalid.
      } else {
        // Clamp.
        newValue = this.metricDefinition.range.clamp(oldValue);
        newValue = this.metricDefinition.precision.round(newValue);
        taskMetricValues.set(index, oldValue);
      }
      task.setMetric(this.name, newValue);
    });

    return ok({
      plan: plan,
      inverse: this.inverse(oldMetricDefinition, taskMetricValues),
    });
  }

  inverse(
    oldMetricDefinition: MetricDefinition,
    taskMetricValues: Map<number, number>
  ): SubOp {
    return new UpdateMetricSubOp(
      this.name,
      oldMetricDefinition,
      taskMetricValues
    );
  }
}

export class SetMetricValueSubOp implements SubOp {
  name: string;
  value: number;
  taskIndex: number;

  constructor(name: string, value: number, taskIndex: number) {
    this.name = name;
    this.value = value;
    this.taskIndex = taskIndex;
  }

  applyTo(plan: Plan): Result<SubOpResult> {
    const metricsDefinition = plan.getMetricDefinition(this.name);
    if (metricsDefinition === undefined) {
      return error(`${this.name} does not exist as a Metric`);
    }

    const task = plan.chart.Vertices[this.taskIndex];
    const oldValue = task.getMetric(this.name) || metricsDefinition.default;
    task.setMetric(this.name, metricsDefinition.clampAndRound(this.value));

    return ok({ plan: plan, inverse: this.inverse(oldValue) });
  }

  inverse(value: number): SubOp {
    return new SetMetricValueSubOp(this.name, value, this.taskIndex);
  }
}

export function AddMetricOp(
  name: string,
  metricDefinition: MetricDefinition
): Op {
  return new Op([new AddMetricSubOp(name, metricDefinition)], 'AddMetricOp');
}

export function DeleteMetricOp(name: string): Op {
  return new Op([new DeleteMetricSubOp(name)], 'DeleteMetricOp');
}

export function RenameMetricOp(oldName: string, newName: string): Op {
  return new Op([new RenameMetricSubOp(oldName, newName)], 'RenameMetricOp');
}

export function UpdateMetricOp(
  name: string,
  metricDefinition: MetricDefinition
): Op {
  return new Op(
    [new UpdateMetricSubOp(name, metricDefinition)],
    'UpdateMetricOp'
  );
}

export function SetMetricValueOp(
  name: string,
  value: number,
  taskIndex: number
): Op {
  return new Op(
    [new SetMetricValueSubOp(name, value, taskIndex)],
    'SetMetricValueOp'
  );
}
