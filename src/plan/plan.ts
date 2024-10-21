import {
  Chart,
  ChartSerialized,
  Task,
  TaskSerialized,
  validateChart,
} from "../chart/chart.ts";
import { DirectedEdge, DirectedEdgeSerialized } from "../dag/dag.ts";
import {
  MetricDefinition,
  MetricDefinitionSerialized,
  MetricDefinitions,
  MetricDefinitionsSerialized,
} from "../metrics/metrics.ts";
import { MetricRange } from "../metrics/range.ts";
import { RationalizeEdgesOp } from "../ops/chart.ts";
import { Precision } from "../precision/precision.ts";
import {
  ResourceDefinition,
  ResourceDefinitions,
  ResourceDefinitionsSerialized,
} from "../resources/resources.ts";
import { Result, ok } from "../result.ts";
import { UncertaintyToNum } from "../stats/cdf/triangular/jacobian.ts";

export type StaticMetricKeys = "Duration" | "Percent Complete";

export const StaticMetricDefinitions: MetricDefinitions = {
  // How long a task will take, in days.
  Duration: new MetricDefinition(0, new MetricRange(), true),
  // The percent complete for a task.
  Percent: new MetricDefinition(0, new MetricRange(0, 100), true),
};

export const StaticResourceDefinitions: ResourceDefinitions = {
  Uncertainty: new ResourceDefinition(Object.keys(UncertaintyToNum), true),
};

export interface PlanSerialized {
  chart: ChartSerialized;
  resourceDefinitions: ResourceDefinitionsSerialized;
  metricDefinitions: MetricDefinitionsSerialized;
}

export class Plan {
  chart: Chart;

  resourceDefinitions: ResourceDefinitions;

  metricDefinitions: MetricDefinitions;

  constructor() {
    this.chart = new Chart();

    this.resourceDefinitions = Object.assign({}, StaticResourceDefinitions);
    this.metricDefinitions = Object.assign({}, StaticMetricDefinitions);
    this.applyMetricsAndResourcesToVertices();
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
}

export const FromJSON = (text: string): Result<Plan> => {
  const planSerialized: PlanSerialized = JSON.parse(text);
  const plan = new Plan();

  plan.chart.Vertices = planSerialized.chart.vertices.map(
    (taskSerialized: TaskSerialized): Task => {
      const task = new Task(taskSerialized.name);
      task.state = taskSerialized.state;
      task.metrics = taskSerialized.metrics;
      task.resources = taskSerialized.resources;

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

  const ret = RationalizeEdgesOp().apply(plan);
  if (!ret.ok) {
    return ret;
  }

  const retVal = validateChart(plan.chart);
  if (!retVal.ok) {
    return retVal;
  }
  return ok(plan);
};
