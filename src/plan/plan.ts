import {
  Chart,
  ChartSerialized,
  ChartValidate,
  Task,
  TaskSerialized,
} from "../chart/chart.ts";
import { DirectedEdge, DirectedEdgeSerialized } from "../dag/dag.ts";
import {
  MetricDefinition,
  MetricDefinitions,
  MetricDefinitionsSerialized,
} from "../metrics/metrics.ts";
import { MetricRange } from "../metrics/range.ts";
import { RationalizeEdgesOp } from "../ops/chart.ts";
import {
  ResourceDefinition,
  ResourceDefinitions,
  ResourceDefinitionsSerialized,
} from "../resources/resources.ts";
import { Result, ok } from "../result.ts";
import { UncertaintyToNum } from "../stats/cdf/triangular/jacobian.ts";
import {
  Days,
  UnitBase,
  UnitSerialized,
  UnitTypes,
  Unitless,
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
  // A value of 0 means unstared.
  startDate: number;
  durationUnits: UnitSerialized;
  chart: ChartSerialized;
  resourceDefinitions: ResourceDefinitionsSerialized;
  metricDefinitions: MetricDefinitionsSerialized;
}

export class Plan {
  chart: Chart;

  // Controls how time is displayed.
  durationUnits: UnitBase;

  started: boolean = false;

  startDate: Date = new Date();

  resourceDefinitions: ResourceDefinitions;

  metricDefinitions: MetricDefinitions;

  constructor() {
    this.chart = new Chart();

    this.resourceDefinitions = Object.assign({}, StaticResourceDefinitions);
    this.metricDefinitions = Object.assign({}, StaticMetricDefinitions);

    this.durationUnits = new Days(
      new Date(),
      this.getStaticMetricDefinition("Duration")
    );

    this.applyMetricsAndResourcesToVertices();
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

  toJSON(): PlanSerialized {
    return {
      startDate: this.started ? this.startDate.getTime() : 0,
      durationUnits: this.durationUnits.toJSON(),
      chart: this.chart.toJSON(),
      resourceDefinitions: Object.fromEntries(
        Object.entries(this.resourceDefinitions).filter(
          ([key, resourceDefinition]) => !resourceDefinition.isStatic
        )
      ),
      metricDefinitions: Object.fromEntries(
        Object.entries(this.metricDefinitions)
          .filter(([key, metricDefinition]) => !metricDefinition.isStatic)
          .map(([key, metricDefinition]) => [key, metricDefinition.toJSON()])
      ),
    };
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

  public static FromJSON = (text: string): Result<Plan> => {
    const planSerialized: PlanSerialized = JSON.parse(text);
    const plan = new Plan();

    plan.chart.Vertices = planSerialized.chart.vertices.map(
      (taskSerialized: TaskSerialized): Task => {
        const task = new Task(taskSerialized.name);
        task.metrics = taskSerialized.metrics;
        task.resources = taskSerialized.resources;
        task.id = taskSerialized.id;

        return task;
      }
    );
    plan.chart.Edges = planSerialized.chart.edges.map(
      (directedEdgeSerialized: DirectedEdgeSerialized): DirectedEdge =>
        new DirectedEdge(directedEdgeSerialized.i, directedEdgeSerialized.j)
    );

    const deserializedMetricDefinitions = Object.fromEntries(
      Object.entries(planSerialized.metricDefinitions).map(
        ([key, serializedMetricDefinition]) => [
          key,
          MetricDefinition.FromJSON(serializedMetricDefinition),
        ]
      )
    );

    plan.metricDefinitions = Object.assign(
      {},
      StaticMetricDefinitions,
      deserializedMetricDefinitions
    );

    const deserializedResourceDefinitions = Object.fromEntries(
      Object.entries(planSerialized.resourceDefinitions).map(
        ([key, serializedResourceDefinition]) => [
          key,
          ResourceDefinition.FromJSON(serializedResourceDefinition),
        ]
      )
    );

    plan.resourceDefinitions = Object.assign(
      {},
      StaticResourceDefinitions,
      deserializedResourceDefinitions
    );

    if (planSerialized.startDate === 0) {
      plan.started = false;
      plan.startDate = new Date();
    } else {
      plan.started = true;
      plan.startDate = new Date(planSerialized.startDate);
    }
    plan.durationUnits = UnitBase.fromJSON(
      planSerialized.durationUnits,
      plan.startDate,
      plan.getStaticMetricDefinition("Duration")
    );

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
