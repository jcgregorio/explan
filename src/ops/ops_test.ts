import { assert } from "@esm-bundle/chai";
import { Chart } from "../chart/chart";
import { Plan } from "../plan/plan";
import { ok, Result } from "../result";
import { Op, SubOp, SubOpResult } from "./ops";

class TestSubOpA implements SubOp {
  apply(plan: Plan): Result<SubOpResult> {
    const ret: SubOpResult = {
      plan: plan,
      inverse: new TestSubOpA(),
    };
    return ok(ret);
  }
}

class TestSubOpB implements SubOp {
  apply(plan: Plan): Result<SubOpResult> {
    const ret: SubOpResult = {
      plan: plan,
      inverse: new TestSubOpB(),
    };
    return ok(ret);
  }
}

class TestSubOpC implements SubOp {
  apply(plan: Plan): Result<SubOpResult> {
    const ret: SubOpResult = {
      plan: plan,
      inverse: new TestSubOpC(),
    };
    return ok(ret);
  }
}
describe("Op", () => {
  it("Reverses the order of the inverse subOps", () => {
    const op = new Op([new TestSubOpA(), new TestSubOpB(), new TestSubOpC()]);
    const res = op.apply(new Plan(new Chart()));
    assert.isTrue(res.ok);
    const iSubOps = res.value.inverse.subOps;
    assert.isTrue(iSubOps[0] instanceof TestSubOpC);
  });
});
