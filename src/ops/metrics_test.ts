import { assert } from "@esm-bundle/chai";
import { Chart, Task } from "../chart/chart";
import { Plan, StaticMetricKeys } from "../plan/plan";
import { MetricDefinition } from "../metrics/metrics";
import { AddMetricOp } from "./metrics";

describe("AddMetricOp", () => {
  it("adds a new metric to a Plan", () => {
    const plan = new Plan(new Chart());
    const defaultCostValue = 12;

    const op = AddMetricOp("cost", new MetricDefinition(defaultCostValue));
    let res = op.apply(plan);
    assert.isTrue(res.ok);
    assert.deepEqual(
      res.value.plan.metricDefinitions.get("cost"),
      new MetricDefinition(defaultCostValue)
    );
    assert.equal(
      res.value.plan.metricDefinitions.size,
      3,
      "Because a Plan always starts with two metrics."
    );

    // Confirm each task was updated.
    res.value.plan.chart.Vertices.forEach((task: Task) => {
      assert.equal(task.metrics.get("cost"), defaultCostValue);
    });

    // Now show the inverse also works.
    res = res.value.inverse.apply(res.value.plan);
    assert.isTrue(res.ok);
    assert.equal(res.value.plan.metricDefinitions.size, 2);

    // Confirm each task was updated.
    res.value.plan.chart.Vertices.forEach((task: Task) => {
      assert.equal(task.metrics.get("cost"), undefined);
    });
  });

  it("will fail to add a new metric with the same name as an existing metric", () => {
    const plan = new Plan(new Chart());

    const op = AddMetricOp(StaticMetricKeys.Duration, new MetricDefinition(0));
    const res = op.apply(plan);
    assert.isFalse(res.ok);
  });
});
