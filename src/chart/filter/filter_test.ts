import { assert } from "@esm-bundle/chai";
import { Plan } from "../../plan/plan";
import { applyAllOpsToPlan } from "../../ops/ops";
import { InsertNewEmptyTaskAfterOp, SetTaskNameOp } from "../../ops/chart";
import { filter } from "./filter";
import { Task, validateChart } from "../chart";
import { DirectedEdge } from "../../dag/dag";
import { Span } from "../../slack/slack";

describe("filter", () => {
  const newPlan = (): Plan => {
    const plan = new Plan();

    // Create a simple chart of:
    //   0 -> Barney -> 3
    //   0 -> Fred -> 3
    //
    // In the order: Start, Barney, Fred, Finish.
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
    const ret = filter(plan.chart, null, [], [], []);
    assert.isTrue(ret.ok);
    assert.deepEqual(plan.chart, ret.value.chartLike);
    const vret = validateChart(plan.chart);
    assert.isTrue(vret.ok);
    assert.deepEqual(vret.value, ret.value.displayOrder);
  });

  it("returns a chart with no tasks, even start and finish are filtered out", () => {
    const plan = newPlan();

    // Filter out all tasks.
    const ret = filter(plan.chart, () => false, [], [], []);
    assert.isTrue(ret.ok);
    assert.equal(ret.value.chartLike.Vertices.length, 0);
  });

  it("returns edges that are updated to point to the new Task locations", () => {
    const plan = newPlan();

    // Filter out only the Task named "Barney", which is task #1, which means
    // that the "Fred" task will bump down to spot #1, ensure that the edges
    // returned also reflect that.
    const ret = filter(
      plan.chart,
      (task: Task): boolean => {
        return task.name !== "Barney";
      },
      [2], // Fred is highlighted, test that this moves to [1] after filtering.
      [new Span(0, 0), new Span(0, 7), new Span(5, 9), new Span(9, 9)], // Confirm the (0,7) for Fred gets removed.
      ["Start", "Barney", "Fred", "Finish"]
    );
    assert.isTrue(ret.ok);
    assert.deepEqual(ret.value.chartLike.Edges, [
      new DirectedEdge(0, 1),
      new DirectedEdge(1, 2),
    ]);
    assert.deepEqual(ret.value.highlightedTasks, [1]);
    assert.deepEqual(ret.value.spans, [
      new Span(0, 0),
      new Span(5, 9),
      new Span(9, 9),
    ]);
    assert.deepEqual(ret.value.labels, ["Start", "Fred", "Finish"]);
  });
});
