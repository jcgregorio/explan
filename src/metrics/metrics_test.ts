import {
  MetricDefinition,
  MetricDefinitions,
  MetricsContainer,
} from "./metrics";
import { MetricRange } from "./range";
import { assert } from "@esm-bundle/chai";

describe("MetricDefinition", () => {
  it("Clamps the provided default to the range.", () => {
    const m = new MetricDefinition("Display Name", new MetricRange(-1, 1), 2);
    assert.equal(m.default, 1);
  });
});

const testMetricDefinitions: MetricDefinitions = new Map<
  string,
  MetricDefinition
>([
  // How long a task will take, in days.
  ["duration", new MetricDefinition("Duration", new MetricRange(), 1)],
  // The percent complete for a task.
  [
    "percentComplete",
    new MetricDefinition("Percent Complete", new MetricRange(0, 100), 0),
  ],
]);

describe("MetricsContainer", () => {
  it("Set metric values to default on construction", () => {
    const mc = new MetricsContainer(testMetricDefinitions);
    assert.equal(mc.get("duration"), 1);
    assert.equal(mc.get("percentComplete"), 0);
  });
});
