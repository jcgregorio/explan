import { assert } from "@esm-bundle/chai";
import { Point } from "./point";

describe("Point", () => {
  it("has equal comparitor", () => {
    assert.isTrue(new Point(1, 2).equal(new Point(1, 2)));
    assert.isFalse(new Point(1, 1).equal(new Point(2, 2)));
  });

  it("adds correctly", () => {
    const p = new Point(1, 2);
    p.add(2, 1);
    assert.isTrue(p.equal(new Point(3, 3)));
  });

  it("sums correctly", () => {
    assert.isTrue(new Point(1, 3).sum(new Point(2, 1)).equal(new Point(3, 4)));
  });

  it("set overwrites correctly", () => {
    const p = new Point(1, 2).set(new Point(3, 2));
    assert.isTrue(p.equal(new Point(3, 2)));
  });

  it("duplicates correctly", () => {
    const p = new Point(1, 2);
    const q = p.dup();
    q.add(10, 10);
    assert.isTrue(p.equal(new Point(1, 2)));
    assert.isTrue(q.equal(new Point(11, 12)));
  });
});
