import { Chart } from "../chart/chart";
import { MetricDefinition, MetricDefinitions } from "../metrics/metrics";
import { MetricRange } from "../metrics/range";
import { ResourceDefinitions } from "../resources/resources";

export const enum StaticKeys {
  Duration = "duration",
  Percent = "percent",
}

export const StaticMetricDefinitions: MetricDefinitions = new Map<
  string,
  MetricDefinition
>([
  // How long a task will take, in days.
  [StaticKeys.Duration, new MetricDefinition("Duration", new MetricRange(), 1)],
  // The percent complete for a task.
  [
    StaticKeys.Percent,
    new MetricDefinition("Percent Complete", new MetricRange(0, 100), 0),
  ],
]);

export class Plan {
  chart: Chart;

  resourceDefinitions: ResourceDefinitions = [];

  metricDefinitions: MetricDefinitions = new Map<string, MetricDefinition>();

  constructor(chart: Chart) {
    this.chart = chart;
    this.metricDefinitions = new Map<string, MetricDefinition>(
      StaticMetricDefinitions
    );
  }
}
