import { assert } from "@esm-bundle/chai";
import { T2Op, TOp, TestOpsForwardAndBack } from "./opstestutil";
import { InsertNewEmptyTaskAfterOp, SetTaskName, SetTaskNameOp } from "./chart";
import { Plan } from "../plan/plan";
import { Chart, DEFAULT_TASK_NAME } from "../chart/chart";

describe("InsertNewEmptyTaskAfterOp", () => {
  it("Adds both a Task and Vertices.", () => {
    TestOpsForwardAndBack([
      T2Op((plan: Plan) => {
        assert.deepEqual(plan.chart.Edges, [
          {
            i: 0,
            j: 1,
          },
        ]);
        assert.equal(plan.chart.Vertices.length, 2);
      }),
      InsertNewEmptyTaskAfterOp(0),
      TOp((plan: Plan) => {
        assert.deepEqual(plan.chart.Edges, [
          {
            i: 0,
            j: 2,
          },
          {
            i: 0,
            j: 1,
          },
          {
            i: 1,
            j: 2,
          },
        ]);
        assert.equal(plan.chart.Vertices.length, 3);
      }),
    ]);
  });

  it("Fails if the taskIndex is out of range", () => {
    const res = InsertNewEmptyTaskAfterOp(2).apply(new Plan(new Chart()));
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("is not in range"));
  });

  it("Fails if the taskIndex is out of range", () => {
    const res = InsertNewEmptyTaskAfterOp(-1).apply(new Plan(new Chart()));
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("is not in range"));
  });
});

describe("SetTaskName", () => {
  const newTaskName = "An updated task name";
  it("Sets a tasks name.", () => {
    TestOpsForwardAndBack([
      InsertNewEmptyTaskAfterOp(0),
      T2Op((plan: Plan) => {
        assert.equal(plan.chart.Vertices[1].name, DEFAULT_TASK_NAME);
      }),
      SetTaskNameOp(1, newTaskName),
      TOp((plan: Plan) => {
        assert.equal(plan.chart.Vertices[1].name, newTaskName);
      }),
    ]);
  });
});
