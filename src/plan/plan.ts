import { Chart, Task } from "../chart/chart.ts";
import { MetricDefinition, MetricDefinitions } from "../metrics/metrics.ts";
import { MetricRange } from "../metrics/range.ts";
import {
  ResourceDefinition,
  ResourceDefinitions,
} from "../resources/resources.ts";
import { UncertaintyToNum } from "../stats/cdf/triangular/jacobian.ts";

export type StaticMetricKeys = "Duration" | "Percent Complete";

export const StaticMetricDefinitions: MetricDefinitions = new Map<
  string,
  MetricDefinition
>([
  // How long a task will take, in days.
  ["Duration", new MetricDefinition(0, new MetricRange(), true)],
  // The percent complete for a task.
  ["Percent", new MetricDefinition(0, new MetricRange(0, 100), true)],
]);

export const StaticResourceDefinitions: ResourceDefinitions = [
  {
    key: "Uncertainty",
    values: Object.keys(UncertaintyToNum),
  },
];

export class Plan {
  chart: Chart;

  resourceDefinitions: ResourceDefinitions = StaticResourceDefinitions.slice();

  metricDefinitions: MetricDefinitions;

  constructor() {
    this.chart = new Chart();
    this.metricDefinitions = new Map<string, MetricDefinition>(
      StaticMetricDefinitions
    );
    [...this.metricDefinitions.keys()].forEach((metricName: string) => {
      const md = this.metricDefinitions.get(metricName)!;
      this.chart.Vertices.forEach((task: Task) => {
        task.metrics.set(metricName, md.default);
      });
    });
    this.resourceDefinitions.forEach(
      (resourceDefinition: ResourceDefinition) => {
        this.chart.Vertices.forEach((task: Task) => {
          task.resources[resourceDefinition.key] = resourceDefinition.values[0];
        });
      }
    );
  }

  // Returns a new Task with defaults for all metrics and resources.
  newTask(): Task {
    const ret = new Task();
    [...this.metricDefinitions.keys()].forEach((metricName: string) => {
      const md = this.metricDefinitions.get(metricName)!;

      ret.metrics.set(metricName, md.default);
    });
    this.resourceDefinitions.forEach(
      (resourceDefinition: ResourceDefinition) => {
        ret.resources[resourceDefinition.key] = resourceDefinition.values[0];
      }
    );
    return ret;
  }
}
