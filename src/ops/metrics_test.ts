import { assert } from "@esm-bundle/chai";
import { Chart, Task } from "../chart/chart";
import { Plan, StaticMetricKeys } from "../plan/plan";
import { MetricDefinition } from "../metrics/metrics";
import {
  AddMetricOp,
  DeleteMetricOp,
  RenameMetricOp,
  UpdateMetricOp,
} from "./metrics";
import { applyAllOpsToPlan, applyAllOpsToPlanAndThenInverse } from "./ops";
import { MetricRange } from "../metrics/range";
import { T2Op, TOp } from "../ops/opstestutil";

const defaultCostValue = 12;
const newCostValue = 15;

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
    assert.isTrue(res.error.message.includes("already exists"));
  });
});

describe("DeleteMetricOp", () => {
  it("creates an inverse that restores metric values in Tasks.", () => {
    const plan = new Plan(new Chart());

    let res = AddMetricOp("cost", new MetricDefinition(defaultCostValue)).apply(
      plan
    );
    assert.isTrue(res.ok);

    plan.chart.Vertices[1].metrics.set("cost", newCostValue);

    res = DeleteMetricOp("cost").apply(res.value.plan);
    assert.isTrue(res.ok);

    // Confirm each task was updated.
    res.value.plan.chart.Vertices.forEach((task: Task) => {
      assert.equal(task.metrics.get("cost"), undefined);
    });

    // Now apply the inverse of the delete which should restore the metric and
    // values in each task.
    res = res.value.inverse.apply(res.value.plan);
    assert.isTrue(res.ok);

    // Confirm that cost reverts to its previous value.
    assert.equal(plan.chart.Vertices[1].metrics.get("cost"), newCostValue);
  });

  it("will not delete a static metric", () => {
    const plan = new Plan(new Chart());

    const res = DeleteMetricOp(StaticMetricKeys.Percent).apply(plan);
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("The static Metric"));
  });

  it("will not delete a metric that does not exist", () => {
    const plan = new Plan(new Chart());

    const res = DeleteMetricOp("some unknown metric name").apply(plan);
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("does not exist"));
  });
});

describe("RenameMetricOp", () => {
  it("will not rename static Metrics", () => {
    const plan = new Plan(new Chart());

    const op = RenameMetricOp(
      StaticMetricKeys.Duration,
      "How long this will take"
    );
    const res = op.apply(plan);
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("can't be renamed"));
  });

  it("will not rename a metric to an existing Metric name", () => {
    const plan = new Plan(new Chart());
    let res = AddMetricOp("cost", new MetricDefinition(defaultCostValue)).apply(
      plan
    );
    assert.isTrue(res.ok);

    const op = RenameMetricOp("cost", StaticMetricKeys.Duration);
    res = op.apply(res.value.plan);
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("already exists as a metric"));
  });

  it("will return an error if the Metric doesn't exist", () => {
    const plan = new Plan(new Chart());
    const op = RenameMetricOp(
      "Some unknown metric",
      "another name for that metric"
    );
    const res = op.apply(plan);
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("does not exist as a Metric"));
  });

  it("will rename a metric and all the keys in the Tasks", () => {
    const oldMetricName = "cost";
    const newMetricName = "Cost ($)";

    assert.isTrue(
      applyAllOpsToPlanAndThenInverse(
        [
          AddMetricOp(oldMetricName, new MetricDefinition(defaultCostValue)),
          RenameMetricOp(oldMetricName, newMetricName),
          TOp((plan: Plan) => {
            assert.isTrue(plan.metricDefinitions.has(newMetricName));
            assert.isFalse(plan.metricDefinitions.has(oldMetricName));
            assert.equal(plan.chart.Vertices[1].metrics.size, 3);
            assert.equal(
              plan.chart.Vertices[1].metrics.get(newMetricName),
              defaultCostValue
            );
          }),
        ],
        new Plan(new Chart())
      ).ok
    );
  });

  it("generates a correct inverse Op", () => {
    const oldMetricName = "cost";
    const newMetricName = "Cost ($)";

    assert.isTrue(
      applyAllOpsToPlanAndThenInverse(
        [
          AddMetricOp(oldMetricName, new MetricDefinition(defaultCostValue)),
          T2Op((plan: Plan, isForward: boolean) => {
            if (!isForward) {
              assert.isFalse(plan.metricDefinitions.has(newMetricName));
              assert.isTrue(plan.metricDefinitions.has(oldMetricName));
              assert.equal(plan.chart.Vertices[1].metrics.size, 3);
              assert.equal(
                plan.chart.Vertices[1].metrics.get(oldMetricName),
                defaultCostValue
              );
            }
          }),
          RenameMetricOp(oldMetricName, newMetricName),
        ],
        new Plan(new Chart())
      ).ok
    );
  });
});

describe("UpdateMetricSubOp", () => {
  it("fails when the metric doesn't exist", () => {
    const plan = new Plan(new Chart());

    const res = UpdateMetricOp(
      "some unknown metric",
      new MetricDefinition(defaultCostValue)
    ).apply(plan);
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("does not exist"));
  });

  it("fails when the metric is Static", () => {
    const plan = new Plan(new Chart());

    const res = UpdateMetricOp(
      StaticMetricKeys.Duration,
      new MetricDefinition(defaultCostValue)
    ).apply(plan);
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("Static metric"));
  });

  it("can update the default value in all the Tasks", () => {
    assert.isTrue(
      applyAllOpsToPlan(
        [
          AddMetricOp("cost", new MetricDefinition(defaultCostValue)),
          UpdateMetricOp("cost", new MetricDefinition(newCostValue)),
          TOp((plan: Plan) => {
            assert.equal(
              plan.metricDefinitions.get("cost")!.default,
              newCostValue
            );
            plan.chart.Vertices.forEach((task: Task) => {
              assert.equal(task.metrics.get("cost"), newCostValue);
            });
          }),
        ],
        new Plan(new Chart())
      ).ok
    );
  });

  it("can update the values to be in the new range in all the Tasks", () => {
    assert.isTrue(
      applyAllOpsToPlan(
        [
          AddMetricOp("cost", new MetricDefinition(defaultCostValue)),
          UpdateMetricOp(
            "cost",
            new MetricDefinition(defaultCostValue, new MetricRange(100, 200))
          ),
          TOp((plan: Plan) => {
            // Since defaultCostValue < 100 each Task's metric value, it should be clamped to 100.
            plan.chart.Vertices.forEach((task: Task) => {
              assert.equal(task.metrics.get("cost"), 100);
            });
          }),
        ],
        new Plan(new Chart())
      ).ok
    );
  });

  it("the inverse Op also restores values in Tasks", () => {
    const newCostForTask = 17;

    const res = applyAllOpsToPlanAndThenInverse(
      [
        AddMetricOp("cost", new MetricDefinition(defaultCostValue)),
        T2Op((plan: Plan, isForward: boolean) => {
          if (isForward) {
            // Change the value for a single task.
            plan.chart.Vertices[1].metrics.set("cost", newCostForTask);
          } else {
            // Confirm the value for that single task gets restored on revert.
            assert.equal(
              plan.chart.Vertices[1].metrics.get("cost"),
              newCostForTask
            );
          }
        }),
        UpdateMetricOp(
          "cost",
          new MetricDefinition(defaultCostValue, new MetricRange(100, 200))
        ),
        TOp((plan: Plan) => {
          // Confirm each Task cost metric got updated.
          plan.chart.Vertices.forEach((task: Task) => {
            assert.equal(task.metrics.get("cost"), 100);
          });
        }),
      ],
      new Plan(new Chart())
    );
    assert.isTrue(res.ok);
  });
});
