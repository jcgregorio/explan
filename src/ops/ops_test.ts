import { assert } from "@esm-bundle/chai";
import { Plan } from "../plan/plan";
import { error, ok, Result } from "../result";
import { applyAllOpsToPlan, Op, SubOp, SubOpResult } from "./ops";

const testErrorMessage = "Forced test failure.";

const inverseFailureErrorMessage = "Inverse failed to apply";

export type FailureType = "None" | "FailsOnApply" | "InverseFailsOnApply";

// A SubOp used just for testing. It records apply()'s in subOpApplicationOrder.
// It also knows if it's the inverse, and that's represented in
// subOpApplicationOrder by prepending the subOp name with "-".
class TestSubOp implements SubOp {
  name: string;
  fails: FailureType;
  isInverse: boolean;

  static subOpApplicationOrder: string[] = [];

  static reset() {
    this.subOpApplicationOrder = [];
  }

  constructor(
    name: string,
    fails: FailureType = "None",
    isInverse: boolean = false,
  ) {
    this.name = name;
    this.fails = fails;
    this.isInverse = isInverse;
  }

  apply(plan: Plan): Result<SubOpResult> {
    if (!this.isInverse && this.fails === "FailsOnApply") {
      return error(new Error(testErrorMessage));
    }
    if (this.isInverse && this.fails === "InverseFailsOnApply") {
      return error(new Error(inverseFailureErrorMessage));
    }
    TestSubOp.subOpApplicationOrder.push(
      `${this.isInverse ? "-" : ""}${this.name}`,
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
    TestSubOp.reset();
    const op = new Op([
      new TestSubOp("A"),
      new TestSubOp("B"),
      new TestSubOp("C"),
    ]);
    let res = op.apply(new Plan());
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

  it("Correctly unwinds partial applications if a subOp fails.", () => {
    TestSubOp.reset();
    const op = new Op([
      new TestSubOp("A"),
      new TestSubOp("B"),
      new TestSubOp("C", "FailsOnApply"),
    ]);
    const res = op.apply(new Plan());
    assert.isFalse(res.ok);
    assert.deepEqual(TestSubOp.subOpApplicationOrder, ["A", "B", "-B", "-A"]);
    assert.isTrue(res.error.message.includes(testErrorMessage));
  });

  it("Correctly returns error if subOp fails and the inverse fails to apply.", () => {
    TestSubOp.reset();
    const op = new Op([
      new TestSubOp("A"),
      new TestSubOp("B", "InverseFailsOnApply"),
      new TestSubOp("C", "FailsOnApply"),
    ]);
    const res = op.apply(new Plan());
    assert.isFalse(res.ok);
    assert.deepEqual(TestSubOp.subOpApplicationOrder, ["A", "B"]);
    assert.isTrue(res.error.message.includes(inverseFailureErrorMessage));
  });
});

describe("applyAllOpsToPlan", () => {
  it("Returns the set of inverse Ops in reverse order.", () => {
    TestSubOp.reset();
    const allOps: Op[] = [
      new Op([new TestSubOp("A")]),
      new Op([new TestSubOp("B.1"), new TestSubOp("B.2")]),
      new Op([new TestSubOp("C.1"), new TestSubOp("C.2")]),
    ];
    let ret = applyAllOpsToPlan(allOps, new Plan());
    assert.isTrue(ret.ok);
    ret = applyAllOpsToPlan(ret.value.ops, ret.value.plan);
    assert.isTrue(ret.ok);
    assert.deepEqual(TestSubOp.subOpApplicationOrder, [
      "A",
      "B.1",
      "B.2",
      "C.1",
      "C.2",
      "-C.2",
      "-C.1",
      "-B.2",
      "-B.1",
      "-A",
    ]);
  });

  it("Correctly unwinds applied Ops if on Op fails.", () => {
    TestSubOp.reset();
    const allOps: Op[] = [
      new Op([new TestSubOp("A")]),
      new Op([new TestSubOp("B.1"), new TestSubOp("B.2", "FailsOnApply")]),
      new Op([new TestSubOp("C.1"), new TestSubOp("C.2")]),
    ];
    const ret = applyAllOpsToPlan(allOps, new Plan());
    assert.isFalse(ret.ok);
    assert.deepEqual(TestSubOp.subOpApplicationOrder, [
      "A",
      "B.1",
      "-B.1",
      "-A",
    ]);
    assert.isTrue(ret.error.message.includes(testErrorMessage));
  });

  it("Returns correct error if unwinding from a failed Op produces a second error.", () => {
    TestSubOp.reset();
    const allOps: Op[] = [
      new Op([new TestSubOp("A")]),
      new Op([
        new TestSubOp("B.1", "InverseFailsOnApply"),
        new TestSubOp("B.2", "FailsOnApply"),
      ]),
      new Op([new TestSubOp("C.1"), new TestSubOp("C.2")]),
    ];
    const ret = applyAllOpsToPlan(allOps, new Plan());
    assert.isFalse(ret.ok);
    assert.deepEqual(TestSubOp.subOpApplicationOrder, ["A", "B.1", "-A"]);
    assert.isTrue(ret.error.message.includes(inverseFailureErrorMessage));
  });
});
