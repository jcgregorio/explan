import { assert } from "@esm-bundle/chai";
import { T2Op, TOp, TestOpsForwardAndBack } from "./opstestutil";
import { Plan } from "../plan/plan";
import { SetPlanStartStateOp, UpdatePlanStartDateOp } from "./plan";
import { toJSON, unstarted } from "../plan_status/plan_status";
import { InsertNewEmptyTaskAfterOp } from "./chart";
import { TaskCompletion } from "../task_completion/task_completion";

describe("SetPlanStartStateOp", () => {
  const today = new Date().getTime();
  it("sets the plan status", () => {
    TestOpsForwardAndBack([
      T2Op((plan: Plan) => {
        assert.deepEqual(plan.status, unstarted);
      }),
      SetPlanStartStateOp("started", today),
      TOp((plan: Plan) => {
        assert.deepEqual(plan.status, { stage: "started", start: today });
      }),
    ]);
  });

  it("saves and restores TaskCompletion", () => {
    const completion: TaskCompletion = {
      stage: "started",
      start: 12,
      percentComplete: 50,
    };

    TestOpsForwardAndBack([
      // AddTask
      InsertNewEmptyTaskAfterOp(0),

      TOp((plan: Plan) => {
        // Plan is started and one Task is in the started state.
        plan.status = {
          start: today,
          stage: "started",
        };
        const taskID = plan.chart.Vertices[1].id;
        plan.taskCompletion[taskID] = completion;
      }),
      T2Op((plan: Plan, isForward: boolean) => {
        assert.deepEqual(plan.status.stage, "started");
        // assert task completion
        const taskID = plan.chart.Vertices[1].id;
        assert.deepEqual(plan.taskCompletion[taskID], completion);
      }),
      SetPlanStartStateOp("unstarted", 0),
      TOp((plan: Plan) => {
        // Plan moves to unstarted.
        assert.deepEqual(plan.status, { stage: "unstarted", start: 0 });

        // Started task moved to unstarted.
        const taskID = plan.chart.Vertices[1].id;
        assert.deepEqual(plan.taskCompletion[taskID], { stage: "unstarted" });
      }),
    ]);
  });
});

describe("UpdatePlanStartDateOp", () => {
  const now = new Date();
  const today = now.getTime();
  now.setDate(now.getDate() + 1);
  const tomorrow = now.getTime();
  it("Fails if the Plan isn't started.", () => {
    const res = UpdatePlanStartDateOp(today).applyTo(new Plan());
    assert.isFalse(res.ok);
  });

  it("sets the plan start date", () => {
    TestOpsForwardAndBack([
      SetPlanStartStateOp("started", today),
      T2Op((plan: Plan) => {
        assert.deepEqual(plan.status, { stage: "started", start: today });
      }),
      UpdatePlanStartDateOp(tomorrow),
      TOp((plan: Plan) => {
        assert.deepEqual(plan.status, { stage: "started", start: tomorrow });
      }),
    ]);
  });
});
