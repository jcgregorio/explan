import { keyed } from "lit-html/directives/keyed.js";
import { Chart, ChartSerialized, ChartValidate, Task } from "../chart/chart.ts";
import {
  MetricDefinition,
  MetricDefinitions,
  MetricDefinitionsSerialized,
} from "../metrics/metrics.ts";
import { MetricRange } from "../metrics/range.ts";
import { RationalizeEdgesOp } from "../ops/chart.ts";
import {
  PlanStatus,
  PlanStatusSerialized,
  toJSON as statusToJSON,
  fromJSON as statusFromJSON,
  statusToDate,
} from "../plan_status/plan_status.ts";
import {
  ResourceDefinition,
  ResourceDefinitions,
  ResourceDefinitionsSerialized,
} from "../resources/resources.ts";
import { Result, error, ok } from "../result.ts";
import { UncertaintyToNum } from "../stats/cdf/triangular/jacobian.ts";
import {
  TaskCompletions,
  TaskCompletionsSerialized,
  taskCompletionsToJSON,
  taskCompletionsFromJSON,
  TaskCompletion,
} from "../task_completion/task_completion.ts";
import {
  Days,
  UnitBase,
  UnitBuilders,
  UnitSerialized,
  UnitTypes,
} from "../units/unit.ts";

export type StaticMetricKeys = "Duration" | "Percent Complete";

export const StaticMetricDefinitions: Record<
  StaticMetricKeys,
  MetricDefinition
> = {
  // How long a task will take, in days.
  Duration: new MetricDefinition(0, new MetricRange(0), true),
  // The percent complete for a task.
  "Percent Complete": new MetricDefinition(0, new MetricRange(0, 100), true),
};

export type StaticResourceKeys = "Uncertainty";

export const StaticResourceDefinitions: Record<
  StaticResourceKeys,
  ResourceDefinition
> = {
  Uncertainty: new ResourceDefinition(Object.keys(UncertaintyToNum), true),
};

export interface PlanSerialized {
  status: PlanStatusSerialized;
  taskCompletion: TaskCompletionsSerialized;
  durationUnits: UnitSerialized;
  chart: ChartSerialized;
  resourceDefinitions: ResourceDefinitionsSerialized;
  metricDefinitions: MetricDefinitionsSerialized;
}

export class Plan {
  chart: Chart;

  // Controls how time is displayed.
  durationUnits: UnitBase;

  _status: PlanStatus = { stage: "unstarted", start: 0 };

  taskCompletion: TaskCompletions = {};

  resourceDefinitions: ResourceDefinitions;

  metricDefinitions: MetricDefinitions;

  public get status(): PlanStatus {
    return this._status;
  }

  public set status(value: PlanStatus) {
    this._status = value;
    this.durationUnits = new Days(
      new Date(statusToDate(this.status)),
      this.getStaticMetricDefinition("Duration")
    );
  }

  setTaskCompletion(index: number, value: TaskCompletion): Result<null> {
    const task = this.chart.Vertices[index];
    if (task === undefined) {
      return error(new Error(`${index} is not a valid Task index.`));
    }
    this.taskCompletion[task.id] = value;
    return ok(null);
  }

  getTaskCompletion(index: number): Result<TaskCompletion> {
    const task = this.chart.Vertices[index];
    if (task === undefined) {
      return error(new Error(`${index} is not a valid Task index.`));
    }
    return ok(this.taskCompletion[task.id] || { stage: "unstarted" });
  }

  constructor() {
    this.chart = new Chart();
    this.resourceDefinitions = Object.assign({}, StaticResourceDefinitions);
    this.metricDefinitions = Object.assign({}, StaticMetricDefinitions);
    this.durationUnits = new Days(
      new Date(statusToDate(this.status)),
      this.getStaticMetricDefinition("Duration")
    );

    this.applyMetricsAndResourcesToVertices();
  }

  setDurationUnits(unitType: UnitTypes) {
    this.durationUnits = UnitBuilders[unitType](
      new Date(statusToDate(this.status)),
      this.getStaticMetricDefinition("Duration")
    );
  }

  getStaticMetricDefinition(name: StaticMetricKeys): MetricDefinition {
    return this.metricDefinitions[name];
  }

  getStaticResourceDefinition(name: StaticResourceKeys): ResourceDefinition {
    return this.resourceDefinitions[name];
  }

  applyMetricsAndResourcesToVertices() {
    Object.keys(this.metricDefinitions).forEach((metricName: string) => {
      const md = this.metricDefinitions[metricName]!;
      this.chart.Vertices.forEach((task: Task) => {
        task.setMetric(metricName, md.default);
      });
    });
    Object.entries(this.resourceDefinitions).forEach(
      ([key, resourceDefinition]) => {
        this.chart.Vertices.forEach((task: Task) => {
          task.setResource(key, resourceDefinition.values[0]);
        });
      }
    );
  }

  getMetricDefinition(key: string): MetricDefinition | undefined {
    return this.metricDefinitions[key];
  }

  setMetricDefinition(key: string, metricDefinition: MetricDefinition) {
    this.metricDefinitions[key] = metricDefinition;
  }

  deleteMetricDefinition(key: string) {
    delete this.metricDefinitions[key];
  }

  getResourceDefinition(key: string): ResourceDefinition | undefined {
    return this.resourceDefinitions[key];
  }

  setResourceDefinition(key: string, value: ResourceDefinition) {
    this.resourceDefinitions[key] = value;
  }

  deleteResourceDefinition(key: string) {
    delete this.resourceDefinitions[key];
  }

  // Returns a new Task with defaults for all metrics and resources.
  newTask(): Task {
    const ret = new Task();
    Object.keys(this.metricDefinitions).forEach((metricName: string) => {
      const md = this.getMetricDefinition(metricName)!;
      ret.setMetric(metricName, md.default);
    });
    Object.entries(this.resourceDefinitions).forEach(
      ([key, resourceDefinition]) => {
        ret.setResource(key, resourceDefinition.values[0]);
      }
    );
    return ret;
  }

  toJSON(): PlanSerialized {
    return {
      status: statusToJSON(this.status),
      taskCompletion: taskCompletionsToJSON(this.taskCompletion),
      durationUnits: this.durationUnits.toJSON(),
      chart: this.chart.toJSON(),
      resourceDefinitions: Object.fromEntries(
        Object.entries(this.resourceDefinitions)
          .filter(([_, resourceDefinition]) => !resourceDefinition.isStatic)
          .map(([key, resourceDefinition]) => [
            key,
            resourceDefinition.toJSON(),
          ])
      ),
      metricDefinitions: Object.fromEntries(
        Object.entries(this.metricDefinitions)
          .filter(([_, metricDefinition]) => !metricDefinition.isStatic)
          .map(([key, metricDefinition]) => [key, metricDefinition.toJSON()])
      ),
    };
  }

  static fromJSON(planSerialized: PlanSerialized): Plan {
    const ret = new Plan();
    ret.chart = Chart.fromJSON(planSerialized.chart);
    ret.status = statusFromJSON(planSerialized.status);
    ret.taskCompletion = taskCompletionsFromJSON(planSerialized.taskCompletion);
    const deserializedMetricDefinitions = Object.fromEntries(
      Object.entries(planSerialized.metricDefinitions).map(
        ([key, serializedMetricDefinition]) => [
          key,
          MetricDefinition.fromJSON(serializedMetricDefinition),
        ]
      )
    );
    ret.metricDefinitions = Object.assign(
      {},
      StaticMetricDefinitions,
      deserializedMetricDefinitions
    );

    const deserializedResourceDefinitions = Object.fromEntries(
      Object.entries(planSerialized.resourceDefinitions).map(
        ([key, serializedResourceDefinition]) => [
          key,
          ResourceDefinition.fromJSON(serializedResourceDefinition),
        ]
      )
    );
    ret.resourceDefinitions = Object.assign(
      {},
      StaticResourceDefinitions,
      deserializedResourceDefinitions
    );

    ret.durationUnits = UnitBase.fromJSON(
      planSerialized.durationUnits,
      new Date(statusToDate(ret.status)),
      ret.getStaticMetricDefinition("Duration")
    );

    return ret;
  }

  static FromJSONText = (text: string): Result<Plan> => {
    const planSerialized: PlanSerialized = JSON.parse(text);
    const plan = Plan.fromJSON(planSerialized);

    const ret = RationalizeEdgesOp().applyTo(plan);
    if (!ret.ok) {
      return ret;
    }

    const retVal = ChartValidate(plan.chart);
    if (!retVal.ok) {
      return retVal;
    }
    return ok(plan);
  };
}
