import { Chart, Task } from "../chart/chart.ts";
import { MetricDefinition, MetricDefinitions } from "../metrics/metrics.ts";
import { MetricRange } from "../metrics/range.ts";
import {
  ResourceDefinition,
  ResourceDefinitions,
} from "../resources/resources.ts";
import { UncertaintyToNum } from "../stats/cdf/triangular/jacobian.ts";

export type StaticMetricKeys = "Duration" | "Percent Complete";

export const StaticMetricDefinitions: MetricDefinitions = {
  // How long a task will take, in days.
  Duration: new MetricDefinition(0, new MetricRange(), true),
  // The percent complete for a task.
  Percent: new MetricDefinition(0, new MetricRange(0, 100), true),
};

export const StaticResourceDefinitions: ResourceDefinitions = {
  Uncertainty: {
    values: Object.keys(UncertaintyToNum),
  },
};

export class Plan {
  chart: Chart;

  resourceDefinitions: ResourceDefinitions;

  metricDefinitions: MetricDefinitions;

  constructor() {
    this.chart = new Chart();

    this.resourceDefinitions = Object.assign({}, StaticResourceDefinitions);
    this.metricDefinitions = Object.assign({}, StaticMetricDefinitions);

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
}
