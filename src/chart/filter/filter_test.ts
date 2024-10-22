import { assert } from "@esm-bundle/chai";
import { Plan } from "../../plan/plan";
import { applyAllOpsToPlan } from "../../ops/ops";
import { InsertNewEmptyTaskAfterOp, SetTaskNameOp } from "../../ops/chart";
import { filter } from "./filter";
import { Task, validateChart } from "../chart";
import { DirectedEdge } from "../../dag/dag";

describe("filter", () => {
  const newPlan = (): Plan => {
    const plan = new Plan();

    const res = applyAllOpsToPlan(
      [
        InsertNewEmptyTaskAfterOp(0),
        SetTaskNameOp(1, "Fred"),
        InsertNewEmptyTaskAfterOp(0),
        SetTaskNameOp(1, "Barney"),
      ],
      plan
    );

    assert.isTrue(res.ok);
    return res.value.plan;
  };

  it("returns a chart unchanged if the filterFunc is null", () => {
    const plan = newPlan();

    // Supply a null filter.
    const ret = filter(plan.chart, null, []);
    assert.isTrue(ret.ok);
    assert.deepEqual(plan.chart, ret.value.chartLike);
    const vret = validateChart(plan.chart);
    assert.isTrue(vret.ok);
    assert.deepEqual(vret.value, ret.value.displayOrder);
  });

  it("returns a chart with no tasks, even start and finish are filtered out", () => {
    const plan = newPlan();

    // Filter out all tasks.
    const ret = filter(plan.chart, () => false, []);
    assert.isTrue(ret.ok);
    assert.equal(ret.value.chartLike.Vertices.length, 0);
  });

  it("returns edges that are updated to point to the new Task locations", () => {
    const plan = newPlan();

    // Filter out only the Task named "Fred", which is task #1, which means that
    // the "Barney" task will bump down to spot #1, ensure that the edges
    // returned also reflect that.
    const ret = filter(
      plan.chart,
      (task: Task): boolean => {
        return task.name !== "Fred";
      },
      []
    );
    assert.isTrue(ret.ok);
    assert.deepEqual(ret.value.chartLike.Edges, [
      new DirectedEdge(0, 1),
      new DirectedEdge(1, 2),
    ]);
  });
});
