import { assert } from "@esm-bundle/chai";
import { T2Op, TOp, TestOpsForwardAndBack } from "./opstestutil.ts";
import {
  AddEdgeOp,
  SplitTaskOp,
  InsertNewEmptyTaskAfterOp,
  SetTaskNameOp,
  SetTaskStateOp,
  DupTaskOp,
} from "./chart.ts";
import { Plan } from "../plan/plan.ts";
import { DEFAULT_TASK_NAME } from "../chart/chart.ts";
import { DirectedEdge } from "../dag/dag.ts";

const arrowSummary = (plan: Plan): string[] =>
  plan.chart.Edges.map(
    (d: DirectedEdge) =>
      `${plan.chart.Vertices[d.i].name}->${plan.chart.Vertices[d.j].name}`
  ).sort();

describe("InsertNewEmptyTaskAfterOp", () => {
  it("Adds both a Task and Vertices.", () => {
    TestOpsForwardAndBack([
      T2Op((plan: Plan, forward: boolean) => {
        if (forward) {
          assert.deepEqual(plan.chart.Edges, [new DirectedEdge(0, 1)]);
          assert.equal(plan.chart.Vertices.length, 2);
        } else {
          assert.deepEqual(plan.chart.Edges, [new DirectedEdge(0, 1)]);
          assert.equal(plan.chart.Vertices.length, 2);
        }
      }),
      InsertNewEmptyTaskAfterOp(0),
      TOp((plan: Plan) => {
        assert.deepEqual(arrowSummary(plan), [
          "Start->Task Name",
          "Task Name->Finish",
        ]);
        assert.equal(plan.chart.Vertices.length, 3);
      }),
    ]);
  });

  it("Fails if the taskIndex is out of range", () => {
    const res = InsertNewEmptyTaskAfterOp(2).applyTo(new Plan());
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("is not in range"));
  });

  it("Fails if the taskIndex is out of range", () => {
    const res = InsertNewEmptyTaskAfterOp(-1).applyTo(new Plan());
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

  it("Fails if the taskIndex is out of range", () => {
    const res = SetTaskNameOp(-1, "foo").applyTo(new Plan());
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("is not in range"));
  });

  it("Fails if the taskIndex is out of range", () => {
    const res = SetTaskNameOp(2, "bar").applyTo(new Plan());
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("is not in range"));
  });
});

describe("SetTaskStateOp", () => {
  const newTaskState = "complete";
  it("Sets a tasks state.", () => {
    TestOpsForwardAndBack([
      InsertNewEmptyTaskAfterOp(0),
      T2Op((plan: Plan) => {
        assert.equal(plan.chart.Vertices[1].state, "unstarted");
      }),
      SetTaskStateOp(1, newTaskState),
      TOp((plan: Plan) => {
        assert.equal(plan.chart.Vertices[1].state, "complete");
      }),
    ]);
  });

  it("Fails if the taskIndex is out of range", () => {
    const res = SetTaskStateOp(-1, newTaskState).applyTo(new Plan());
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("is not in range"));
  });

  it("Fails if the taskIndex is out of range", () => {
    const res = SetTaskStateOp(2, newTaskState).applyTo(new Plan());
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("is not in range"));
  });
});

describe("SplitTaskOp", () => {
  it("Adds both a Task and moves the Vertices.", () => {
    TestOpsForwardAndBack([
      T2Op((plan: Plan) => {
        assert.deepEqual(arrowSummary(plan), ["Start->Finish"]);
        assert.equal(plan.chart.Vertices.length, 2);
      }),
      InsertNewEmptyTaskAfterOp(0),
      SetTaskNameOp(1, "A"),
      InsertNewEmptyTaskAfterOp(1),
      SetTaskNameOp(2, "B"),
      T2Op((plan: Plan) => {
        assert.deepEqual(arrowSummary(plan).sort(), [
          "A->Finish",
          "B->Finish",
          "Start->A",
          "Start->B",
        ]);
      }),

      InsertNewEmptyTaskAfterOp(2),
      SetTaskNameOp(3, "C"),
      T2Op((plan: Plan, forward: boolean) => {
        assert.deepEqual(
          arrowSummary(plan).sort(),
          [
            "A->Finish",
            "B->Finish",
            "C->Finish",
            "Start->A",
            "Start->B",
            "Start->C",
          ],
          `Direction: ${forward ? "forward" : "backward"}`
        );
        assert.equal(plan.chart.Vertices.length, 5);
      }),

      AddEdgeOp(1, 3),
      AddEdgeOp(2, 3),
      T2Op((plan: Plan) => {
        assert.deepEqual(arrowSummary(plan), [
          "A->C",
          "B->C",
          "C->Finish",
          "Start->A",
          "Start->B",
        ]);
        assert.equal(plan.chart.Vertices.length, 5);
      }),
      SplitTaskOp(3),
      SetTaskNameOp(4, "D"),
      TOp((plan: Plan) => {
        assert.deepEqual(arrowSummary(plan), [
          "A->C",
          "B->C",
          "C->D",
          "D->Finish",
          "Start->A",
          "Start->B",
        ]);
        assert.equal(plan.chart.Vertices.length, 6);
      }),
    ]);
  });

  it("Fails if the taskIndex is out of range", () => {
    const res = InsertNewEmptyTaskAfterOp(2).applyTo(new Plan());
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("is not in range"));
  });

  it("Fails if the taskIndex is out of range", () => {
    const res = InsertNewEmptyTaskAfterOp(-1).applyTo(new Plan());
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("is not in range"));
  });
});

describe("DupTaskOp", () => {
  it("Fails if the taskIndex is out of range", () => {
    let res = InsertNewEmptyTaskAfterOp(0).applyTo(new Plan());
    assert.isTrue(res.ok);
    res = DupTaskOp(-1).applyTo(res.value.plan);
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("is not in range"));
  });

  it("Fails if the taskIndex is out of range", () => {
    let res = InsertNewEmptyTaskAfterOp(0).applyTo(new Plan());
    assert.isTrue(res.ok);
    res = DupTaskOp(2).applyTo(res.value.plan);
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("is not in range"));
  });

  it("Adds both a Task and moves the Vertices.", () => {
    TestOpsForwardAndBack([
      T2Op((plan: Plan) => {
        assert.deepEqual(arrowSummary(plan), ["Start->Finish"]);
        assert.equal(plan.chart.Vertices.length, 2);
      }),
      InsertNewEmptyTaskAfterOp(0),
      SetTaskNameOp(1, "A"),
      InsertNewEmptyTaskAfterOp(1),
      SetTaskNameOp(2, "B"),
      T2Op((plan: Plan) => {
        assert.deepEqual(arrowSummary(plan).sort(), [
          "A->Finish",
          "B->Finish",
          "Start->A",
          "Start->B",
        ]);
      }),

      InsertNewEmptyTaskAfterOp(2),
      SetTaskNameOp(3, "C"),
      T2Op((plan: Plan, forward: boolean) => {
        assert.deepEqual(
          arrowSummary(plan).sort(),
          [
            "A->Finish",
            "B->Finish",
            "C->Finish",
            "Start->A",
            "Start->B",
            "Start->C",
          ],
          `Direction: ${forward ? "forward" : "backward"}`
        );
        assert.equal(plan.chart.Vertices.length, 5);
      }),

      AddEdgeOp(1, 3),
      AddEdgeOp(2, 3),
      T2Op((plan: Plan) => {
        assert.deepEqual(arrowSummary(plan), [
          "A->C",
          "B->C",
          "C->Finish",
          "Start->A",
          "Start->B",
        ]);
        assert.equal(plan.chart.Vertices.length, 5);
      }),
      DupTaskOp(3),
      SetTaskNameOp(4, "D"),
      TOp((plan: Plan) => {
        assert.deepEqual(arrowSummary(plan), [
          "A->C",
          "A->D",
          "B->C",
          "B->D",
          "C->Finish",
          "D->Finish",
          "Start->A",
          "Start->B",
        ]);
        assert.equal(plan.chart.Vertices.length, 6);
      }),
    ]);
  });

  it("Adds both a Task and moves the Vertices.", () => {
    TestOpsForwardAndBack([
      T2Op((plan: Plan) => {
        assert.deepEqual(arrowSummary(plan), ["Start->Finish"]);
        assert.equal(plan.chart.Vertices.length, 2);
      }),
      InsertNewEmptyTaskAfterOp(0),
      SetTaskNameOp(1, "A"),
      DupTaskOp(1),
      SetTaskNameOp(2, "B"),
      TOp((plan: Plan) => {
        assert.deepEqual(arrowSummary(plan), [
          "A->Finish",
          "B->Finish",
          "Start->A",
          "Start->B",
        ]);
        assert.equal(plan.chart.Vertices.length, 4);
      }),
    ]);
  });
});
