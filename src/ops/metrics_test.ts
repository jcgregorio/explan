import { assert } from "@esm-bundle/chai";
import { Task } from "../chart/chart.ts";
import { Plan } from "../plan/plan.ts";
import { MetricDefinition } from "../metrics/metrics.ts";
import {
  AddMetricOp,
  DeleteMetricOp,
  RenameMetricOp,
  SetMetricValueOp,
  UpdateMetricOp,
} from "./metrics.ts";
import { MetricRange } from "../metrics/range.ts";
import {
  T2Op,
  TOp,
  TestOpsForward,
  TestOpsForwardAndBack,
} from "../ops/opstestutil.ts";

const defaultCostValue = 12;
const newCostValue = 15;

describe("AddMetricOp", () => {
  it("adds a new metric to a Plan", () => {
    TestOpsForwardAndBack([
      T2Op((plan: Plan) => {
        // cost should be undefined at this point, both forward and inverse.
        plan.chart.Vertices.forEach((task: Task) => {
          assert.equal(task.getMetric("cost"), undefined);
        });
      }),
      AddMetricOp("cost", new MetricDefinition(defaultCostValue)),
      TOp((plan: Plan) => {
        assert.deepEqual(
          plan.metricDefinitions.get("cost"),
          new MetricDefinition(defaultCostValue)
        );
        assert.equal(
          plan.metricDefinitions.size,
          3,
          "Because a Plan always starts with two metrics."
        );
        // Confirm each task was updated.
        plan.chart.Vertices.forEach((task: Task) => {
          assert.equal(task.getMetric("cost"), defaultCostValue);
        });
      }),
    ]);
  });

  it("will fail to add a new metric with the same name as an existing metric", () => {
    const res = AddMetricOp("Duration", new MetricDefinition(0)).apply(
      new Plan()
    );
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("already exists"));
  });
});

describe("DeleteMetricOp", () => {
  it("creates an inverse that restores metric values in Tasks.", () => {
    TestOpsForwardAndBack([
      AddMetricOp("cost", new MetricDefinition(defaultCostValue)),
      T2Op((plan: Plan, isForward: boolean) => {
        if (isForward) {
          plan.chart.Vertices[1].setMetric("cost", newCostValue);
        } else {
          assert.equal(plan.chart.Vertices[1].getMetric("cost"), newCostValue);
        }
      }),
      DeleteMetricOp("cost"),
      TOp((plan: Plan) => {
        // Confirm each task was updated.
        plan.chart.Vertices.forEach((task: Task) => {
          assert.equal(task.getMetric("cost"), undefined);
        });
      }),
    ]);
  });

  it("will not delete a static metric", () => {
    const res = DeleteMetricOp("Percent").apply(new Plan());
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("The static Metric"));
  });

  it("will not delete a metric that does not exist", () => {
    const res = DeleteMetricOp("some unknown metric name").apply(new Plan());
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("does not exist"));
  });
});

describe("RenameMetricOp", () => {
  it("will not rename static Metrics", () => {
    const res = RenameMetricOp("Duration", "How long this will take").apply(
      new Plan()
    );
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("can't be renamed"));
  });

  it("will not rename a metric to an existing Metric name", () => {
    let res = AddMetricOp("cost", new MetricDefinition(defaultCostValue)).apply(
      new Plan()
    );
    assert.isTrue(res.ok);

    res = RenameMetricOp("cost", "Duration").apply(res.value.plan);
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("already exists as a metric"));
  });

  it("will return an error if the Metric doesn't exist", () => {
    const res = RenameMetricOp(
      "Some unknown metric",
      "another name for that metric"
    ).apply(new Plan());
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("does not exist as a Metric"));
  });

  it("will rename a metric and all the keys in the Tasks", () => {
    const oldMetricName = "cost";
    const newMetricName = "Cost ($)";

    TestOpsForwardAndBack([
      AddMetricOp(oldMetricName, new MetricDefinition(defaultCostValue)),
      RenameMetricOp(oldMetricName, newMetricName),
      TOp((plan: Plan) => {
        assert.isTrue(plan.metricDefinitions.has(newMetricName));
        assert.isFalse(plan.metricDefinitions.has(oldMetricName));
        assert.equal(Object.keys(plan.chart.Vertices[1].metrics).length, 3);
        assert.equal(
          plan.chart.Vertices[1].getMetric(newMetricName),
          defaultCostValue
        );
      }),
    ]);
  });

  it("generates a correct inverse Op", () => {
    const oldMetricName = "cost";
    const newMetricName = "Cost ($)";

    TestOpsForwardAndBack([
      AddMetricOp(oldMetricName, new MetricDefinition(defaultCostValue)),
      T2Op((plan: Plan, isForward: boolean) => {
        if (!isForward) {
          assert.isFalse(plan.metricDefinitions.has(newMetricName));
          assert.isTrue(plan.metricDefinitions.has(oldMetricName));
          assert.equal(Object.keys(plan.chart.Vertices[1].metrics).length, 3);
          assert.equal(
            plan.chart.Vertices[1].getMetric(oldMetricName),
            defaultCostValue
          );
        }
      }),
      RenameMetricOp(oldMetricName, newMetricName),
      TOp((plan: Plan) => {
        assert.isTrue(plan.metricDefinitions.has(newMetricName));
        assert.isFalse(plan.metricDefinitions.has(oldMetricName));
        assert.equal(
          plan.chart.Vertices[1].getMetric(newMetricName),
          defaultCostValue
        );
      }),
    ]);
  });
});

describe("UpdateMetricSubOp", () => {
  it("fails when the metric doesn't exist", () => {
    const res = UpdateMetricOp(
      "some unknown metric",
      new MetricDefinition(defaultCostValue)
    ).apply(new Plan());
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("does not exist"));
  });

  it("fails when the metric is Static", () => {
    const res = UpdateMetricOp(
      "Duration",
      new MetricDefinition(defaultCostValue)
    ).apply(new Plan());
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("Static metric"));
  });

  it("can update the default value in all the Tasks", () => {
    TestOpsForward([
      AddMetricOp("cost", new MetricDefinition(defaultCostValue)),
      UpdateMetricOp("cost", new MetricDefinition(newCostValue)),
      TOp((plan: Plan) => {
        assert.equal(plan.metricDefinitions.get("cost")!.default, newCostValue);
        plan.chart.Vertices.forEach((task: Task) => {
          assert.equal(task.getMetric("cost"), newCostValue);
        });
      }),
    ]);
  });

  it("can update the values to be in the new range in all the Tasks", () => {
    TestOpsForward([
      AddMetricOp("cost", new MetricDefinition(defaultCostValue)),
      UpdateMetricOp(
        "cost",
        new MetricDefinition(defaultCostValue, new MetricRange(100, 200))
      ),
      TOp((plan: Plan) => {
        // Since defaultCostValue < 100 each Task's metric value, it should be clamped to 100.
        plan.chart.Vertices.forEach((task: Task) => {
          assert.equal(task.getMetric("cost"), 100);
        });
      }),
    ]);
  });

  it("the inverse Op also restores values in Tasks", () => {
    const taskIndex = 1;
    const newCostForTask = 17;

    TestOpsForwardAndBack([
      AddMetricOp("cost", new MetricDefinition(defaultCostValue)),
      T2Op((plan: Plan) => {
        // Confirm the value for that single task gets restored on revert.
        assert.equal(
          plan.chart.Vertices[1].getMetric("cost"),
          defaultCostValue
        );
      }),
      SetMetricValueOp("cost", newCostForTask, taskIndex),
      T2Op((plan: Plan) => {
        // Confirm the value for that single task gets restored on revert.
        assert.equal(plan.chart.Vertices[1].getMetric("cost"), newCostForTask);
      }),
      UpdateMetricOp(
        "cost",
        new MetricDefinition(defaultCostValue, new MetricRange(100, 200))
      ),
      TOp((plan: Plan) => {
        // Confirm each Task cost metric got updated.
        plan.chart.Vertices.forEach((task: Task) => {
          assert.equal(task.getMetric("cost"), 100);
        });
      }),
    ]);
  });
});

describe("SetMetricValueOp", () => {
  it("Fails if the metric doesn't exist", () => {
    const res = SetMetricValueOp("unknown metric", 1, 0).apply(new Plan());
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("does not exist as a Metric"));
  });

  it("Sets a metric value, and the inverse unsets it.", () => {
    const taskIndex = 1;
    TestOpsForwardAndBack([
      T2Op((plan: Plan) => {
        assert.isUndefined(plan.chart.Vertices[taskIndex].getMetric("cost"));
      }),
      AddMetricOp("cost", new MetricDefinition(100)),
      SetMetricValueOp("cost", 200, taskIndex),
      TOp((plan: Plan) => {
        assert.equal(plan.chart.Vertices[taskIndex].getMetric("cost"), 200);
      }),
    ]);
  });
});
