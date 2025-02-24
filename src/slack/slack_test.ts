import { assert } from "@esm-bundle/chai";
import { Chart } from "../chart/chart";
import {
  AddEdgeOp,
  InsertNewEmptyTaskAfterOp,
  SetTaskNameOp,
} from "../ops/chart";
import { applyAllOpsToPlan, Op } from "../ops/ops";
import { Plan } from "../plan/plan";
import { SetMetricValueOp } from "../ops/metrics";
import { ComputeSlack } from "./slack";
import { Precision } from "../precision/precision";

describe("ComputeSlack", () => {
  let chart: Chart;
  const precision = new Precision(0);

  beforeEach(() => {
    const ops: Op[] = [
      InsertNewEmptyTaskAfterOp(0),
      SetTaskNameOp(1, "C"),
      SetMetricValueOp("Duration", 10, 1),
      InsertNewEmptyTaskAfterOp(0),
      SetTaskNameOp(1, "B"),
      SetMetricValueOp("Duration", 20, 1),
      InsertNewEmptyTaskAfterOp(0),
      SetTaskNameOp(1, "A"),
      SetMetricValueOp("Duration", 10, 1),
      // At this point the Task are in this order:
      // [Start, A, B, C, Finish]
      AddEdgeOp(1, 3),
      AddEdgeOp(2, 3),
    ];
    const ret = applyAllOpsToPlan(ops, new Plan());
    assert.isTrue(ret.ok);
    chart = ret.value.plan.chart;
  });

  it("Correctly calculates early starts", () => {
    const ret = ComputeSlack(chart, null, precision.rounder(), null);
    assert.isTrue(ret.ok);
    const expected = [
      {
        early: {
          finish: 0,
          start: 0,
        },
        late: {
          finish: 0,
          start: 0,
        },
        slack: 0,
      },
      {
        early: {
          finish: 10,
          start: 0,
        },
        late: {
          finish: 20,
          start: 10,
        },
        slack: 10,
      },
      {
        early: {
          finish: 20,
          start: 0,
        },
        late: {
          finish: 20,
          start: 0,
        },
        slack: 0,
      },
      {
        early: {
          finish: 30,
          start: 20,
        },
        late: {
          finish: 30,
          start: 20,
        },
        slack: 0,
      },
      {
        early: {
          finish: 30,
          start: 30,
        },
        late: {
          finish: 30,
          start: 30,
        },
        slack: 0,
      },
    ];

    assert.deepEqual(ret.value, expected);
  });
  it("Correctly calculates early starts given an override.", () => {
    const overrideEarlyStart: Map<string, number> = new Map();
    overrideEarlyStart.set(chart.Vertices[3].id, 5);
    const ret = ComputeSlack(chart, null, precision.rounder(), (id: string) =>
      overrideEarlyStart.get(id)
    );
    assert.isTrue(ret.ok);
    const expected = [
      {
        early: {
          finish: 0,
          start: 0,
        },
        late: {
          finish: 0,
          start: 0,
        },
        slack: 0,
      },
      {
        early: {
          finish: 10,
          start: 0,
        },
        late: {
          finish: 10,
          start: 0,
        },
        slack: 0,
      },
      {
        early: {
          finish: 20,
          start: 0,
        },
        late: {
          finish: 20,
          start: 0,
        },
        slack: 0,
      },
      {
        early: {
          finish: 15,
          start: 5,
        },
        late: {
          finish: 15,
          start: 5,
        },
        slack: 0,
      },
      {
        early: {
          finish: 15,
          start: 15,
        },
        late: {
          finish: 15,
          start: 15,
        },
        slack: 0,
      },
    ];

    assert.deepEqual(ret.value, expected);
  });
});
