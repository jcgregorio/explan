import { assert } from "@esm-bundle/chai";
import { Plan } from "../../plan/plan";
import { applyAllOpsToPlan } from "../../ops/ops";
import { InsertNewEmptyTaskAfterOp, SetTaskNameOp } from "../../ops/chart";
import { filter } from "./filter";
import { validateChart } from "../chart";

describe("filter", () => {
  const init = (): Plan => {
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
    const plan = init();
    const ret = filter(plan.chart, null);
    assert.isTrue(ret.ok);
    assert.deepEqual(plan.chart, ret.value.chartLike);
    const vret = validateChart(plan.chart);
    assert.isTrue(vret.ok);
    assert.deepEqual(vret.value, ret.value.displayOrder);
  });
});
