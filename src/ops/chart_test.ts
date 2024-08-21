import { assert } from "@esm-bundle/chai";
import { T2Op, TOp, TestOpsForwardAndBack } from "./opstestutil";
import {
  AddEdgeOp,
  SplitTaskOp,
  InsertNewEmptyTaskAfterOp,
  SetTaskDurationModelOp,
  SetTaskNameOp,
  SetTaskStateOp,
} from "./chart";
import { Plan } from "../plan/plan";
import { Chart, DEFAULT_TASK_NAME, TaskState } from "../chart/chart";
import { JacobianDuration, Uncertainty } from "../duration/jacobian";
import { DirectedEdge } from "../dag/dag";

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

  it("Fails if the taskIndex is out of range", () => {
    const res = SetTaskNameOp(-1, "foo").apply(new Plan(new Chart()));
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("is not in range"));
  });

  it("Fails if the taskIndex is out of range", () => {
    const res = SetTaskNameOp(2, "bar").apply(new Plan(new Chart()));
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("is not in range"));
  });
});

describe("SetDurationModelOp", () => {
  const newDurationModel = new JacobianDuration(Uncertainty.extreme);
  it("Sets a tasks duration model.", () => {
    TestOpsForwardAndBack([
      InsertNewEmptyTaskAfterOp(0),
      T2Op((plan: Plan) => {
        assert.equal(
          (plan.chart.Vertices[1].durationModel as JacobianDuration)
            .uncertainty,
          Uncertainty.moderate
        );
      }),
      SetTaskDurationModelOp(1, newDurationModel),
      TOp((plan: Plan) => {
        assert.equal(
          (plan.chart.Vertices[1].durationModel as JacobianDuration)
            .uncertainty,
          Uncertainty.extreme
        );
      }),
    ]);
  });

  it("Fails if the taskIndex is out of range", () => {
    const res = SetTaskDurationModelOp(-1, newDurationModel).apply(
      new Plan(new Chart())
    );
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("is not in range"));
  });

  it("Fails if the taskIndex is out of range", () => {
    const res = SetTaskDurationModelOp(2, newDurationModel).apply(
      new Plan(new Chart())
    );
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("is not in range"));
  });
});

describe("SetTaskStateOp", () => {
  const newTaskState = TaskState.complete;
  it("Sets a tasks state.", () => {
    TestOpsForwardAndBack([
      InsertNewEmptyTaskAfterOp(0),
      T2Op((plan: Plan) => {
        assert.equal(plan.chart.Vertices[1].state, TaskState.unstarted);
      }),
      SetTaskStateOp(1, newTaskState),
      TOp((plan: Plan) => {
        assert.equal(plan.chart.Vertices[1].state, TaskState.complete);
      }),
    ]);
  });

  it("Fails if the taskIndex is out of range", () => {
    const res = SetTaskStateOp(-1, newTaskState).apply(new Plan(new Chart()));
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("is not in range"));
  });

  it("Fails if the taskIndex is out of range", () => {
    const res = SetTaskStateOp(2, newTaskState).apply(new Plan(new Chart()));
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("is not in range"));
  });
});

describe("DupTaskOp", () => {
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
