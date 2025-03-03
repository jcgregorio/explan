import { assert } from "@esm-bundle/chai";
import { T2Op, TOp, TestOpsForwardAndBack } from "./opstestutil";
import { Plan } from "../plan/plan";
import { SetPlanStartStateOp } from "./plan";
import { unstarted } from "../plan_status/plan_status";

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
});
