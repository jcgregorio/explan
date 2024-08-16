import { assert } from "@esm-bundle/chai";
import { T2Op, TOp, TestOpsForwardAndBack } from "./opstestutil";
import {
  InsertNewEmptyTaskAfterOp,
  SetTaskDurationModelOp,
  SetTaskName,
  SetTaskNameOp,
  SetTaskStateOp,
} from "./chart";
import { Plan } from "../plan/plan";
import { Chart, DEFAULT_TASK_NAME, TaskState } from "../chart/chart";
import { JacobianDuration, Uncertainty } from "../duration/jacobian";

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
