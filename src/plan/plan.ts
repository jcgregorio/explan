import { Chart, Task } from "../chart/chart";
import { MetricDefinition, MetricDefinitions } from "../metrics/metrics";
import { MetricRange } from "../metrics/range";
import { ResourceDefinitions } from "../resources/resources";

export const enum StaticMetricKeys {
  Duration = "Duration",
  Percent = "Percent Complete",
}

export const StaticMetricDefinitions: MetricDefinitions = new Map<
  string,
  MetricDefinition
>([
  // How long a task will take, in days.
  [StaticMetricKeys.Duration, new MetricDefinition(1, new MetricRange(), true)],
  // The percent complete for a task.
  [
    StaticMetricKeys.Percent,
    new MetricDefinition(0, new MetricRange(0, 100), true),
  ],
]);

export class Plan {
  chart: Chart;

  resourceDefinitions: ResourceDefinitions = [];

  metricDefinitions: MetricDefinitions;

  constructor(chart: Chart) {
    this.chart = chart;
    this.metricDefinitions = new Map<string, MetricDefinition>(
      StaticMetricDefinitions
    );
    [...this.metricDefinitions.keys()].forEach((metricName: string) => {
      const md = this.metricDefinitions.get(metricName)!;
      this.chart.Vertices.forEach((task: Task) => {
        task.metrics.set(metricName, md.default);
      });
    });
  }
}
