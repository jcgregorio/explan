import {
  MetricDefinition,
  MetricDefinitions,
  MetricsContainer,
} from "./metrics";
import { MetricRange } from "./range";
import { assert } from "@esm-bundle/chai";

describe("MetricDefinition", () => {
  it("Clamps the provided default to the range.", () => {
    const m = new MetricDefinition(new MetricRange(-1, 1), 2);
    assert.equal(m.default, 1);
  });
});

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

describe("MetricsContainer", () => {
  it("Sets metric values to default on construction", () => {
    const mc = new MetricsContainer(testMetricDefinitions);
    assert.equal(mc.get("duration"), defaultDuration);
    assert.equal(mc.get("percentComplete"), defaultPercentComplete);
  });

  it("Returns error when trying to set value for a non-existent metric", () => {
    const mc = new MetricsContainer(testMetricDefinitions);
    const ret = mc.set("non-existent-metric-name", 12);
    assert.isFalse(ret.ok);
    assert.isTrue(ret.error.message.includes("is not a known metric name"));
  });

  it("Clamps values set for a metric", () => {
    const mc = new MetricsContainer(testMetricDefinitions);
    mc.set("percentComplete", 110);
    assert.equal(mc.get("percentComplete"), 100);
  });

  it("Sets values if within a range", () => {
    const mc = new MetricsContainer(testMetricDefinitions);
    mc.set("percentComplete", 90);
    assert.equal(mc.get("percentComplete"), 90);
  });

  it("Delete values", () => {
    const mc = new MetricsContainer(testMetricDefinitions);
    const ret = mc.delete("duration");
    assert.isTrue(ret);
    assert.equal(mc.get("duration"), undefined);
  });
});
