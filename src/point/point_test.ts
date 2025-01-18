import { assert } from "@esm-bundle/chai";
import { add, dup, equal, pt, sum } from "./point";

describe("Point", () => {
  it("has equal comparitor", () => {
    assert.isTrue(equal(pt(1, 2), pt(1, 2)));
    assert.isFalse(equal(pt(1, 1), pt(2, 2)));
  });

  it("adds correctly", () => {
    let p = pt(1, 2);
    p = add(p, [2, 1]);
    assert.isTrue(equal(p, pt(3, 3)));
  });

  it("sums correctly", () => {
    assert.isTrue(equal(sum(pt(1, 3), pt(2, 1)), pt(3, 4)));
  });

  it("duplicates correctly", () => {
    const p = pt(1, 2);
    let q = dup(p);
    q = add(q, [10, 10]);
    assert.isTrue(equal(p, pt(1, 2)));
    assert.isTrue(equal(q, pt(11, 12)));
  });
});
