import { assert } from "@esm-bundle/chai";
import { Chart } from "../chart/chart";
import { Plan } from "../plan/plan";
import { ok, Result } from "../result";
import { Op, SubOp, SubOpResult } from "./ops";

// A SubOp used just for testing. It records apply()'s
// in the subOpApplicationOrder.
class TestSubOp implements SubOp {
  name: string;
  fails: boolean;
  isInverse: boolean;

  static subOpApplicationOrder: string[] = [];

  constructor(
    name: string,
    fails: boolean = false,
    isInverse: boolean = false
  ) {
    this.name = name;
    this.fails = fails;
    this.isInverse = isInverse;
  }

  apply(plan: Plan): Result<SubOpResult> {
    TestSubOp.subOpApplicationOrder.push(
      `${this.isInverse ? "-" : ""}${this.name}`
    );
    const ret: SubOpResult = {
      plan: plan,
      inverse: new TestSubOp(this.name, this.fails, !this.isInverse),
    };
    return ok(ret);
  }
}

describe("Op", () => {
  it("Reverses the order of the inverse subOps", () => {
    TestSubOp.subOpApplicationOrder = [];
    const op = new Op([
      new TestSubOp("A"),
      new TestSubOp("B"),
      new TestSubOp("C"),
    ]);
    let res = op.apply(new Plan(new Chart()));
    assert.isTrue(res.ok);
    res = res.value.inverse.apply(res.value.plan);
    assert.isTrue(res.ok);
    assert.deepEqual(TestSubOp.subOpApplicationOrder, [
      "A",
      "B",
      "C",
      "-C",
      "-B",
      "-A",
    ]);
  });
});
