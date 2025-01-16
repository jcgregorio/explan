import { assert } from "@esm-bundle/chai";
import { HitRect, Rect } from "./hitrect.ts";
import { Point } from "../renderer/scale/point.ts";

describe("HitRect", () => {
  const r1: Rect = { top: 0, bottom: 1, left: 0, right: 1 };
  const r2: Rect = { top: 2, bottom: 3, left: 0, right: 2 };

  it("works on an empty list of Rects", () => {
    assert.equal(new HitRect([]).hit(new Point(0, 0)), -1);
  });

  it("works on a single Rect", () => {
    assert.equal(new HitRect([r1]).hit(new Point(0, 0)), 0);
    assert.equal(new HitRect([r1]).hit(new Point(2, 2)), -1);
    assert.equal(new HitRect([r1]).hit(new Point(0, -1)), -1);
  });

  it("works on a two Rects", () => {
    const r = new HitRect([r2, r1]);
    assert.equal(r.hit(new Point(0, 0)), 0, "inside r1");
    assert.equal(r.hit(new Point(0, 2)), 1, "inside r2");
    assert.equal(r.hit(new Point(2, -1)), -1, "above r1");
    assert.equal(r.hit(new Point(2, 1.5)), -1, "vertically between r1 and r2");
    assert.equal(r.hit(new Point(2, 4)), -1, "below r2");
    assert.equal(r.hit(new Point(3, 2.5)), -1, "to the right of r2");
    assert.equal(r.hit(new Point(-1, 2.5)), -1, "to the left of r2");
    assert.equal(r.hit(new Point(1.5, 0)), -1, "to the right of r1");
    assert.equal(r.hit(new Point(-1.5, 0)), -1, "to the left of r1");
  });
});
