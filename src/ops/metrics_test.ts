import { MetricDefinition, MetricDefinitions } from "../metrics/metrics";
import { MetricRange } from "../metrics/range";

const defaultDuration = 2.0;
const defaultPercentComplete = 0.0;

const testMetricDefinitions: MetricDefinitions = new Map<
  string,
  MetricDefinition
>([
  // How long a task will take, in days.
  ["duration", new MetricDefinition(new MetricRange(), defaultDuration)],
  // The percent complete for a task.
  [
    "percentComplete",
    new MetricDefinition(new MetricRange(0, 100), defaultPercentComplete),
  ],
]);
