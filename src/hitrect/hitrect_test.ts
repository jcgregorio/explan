import { assert } from "@esm-bundle/chai";
import { HitRect } from "./hitrect.ts";
import { Point, pt } from "../point/point.ts";
import { Rect } from "../types/types.ts";

describe("HitRect", () => {
  const r1: Rect = {
    topLeft: pt(0, 0),
    bottomRight: pt(1, 1),
  };
  const r2: Rect = {
    topLeft: pt(0, 2),
    bottomRight: pt(2, 3),
  };

  it("works on an empty list of Rects", () => {
    assert.equal(new HitRect([]).hit(pt(0, 0)), -1);
  });

  it("works on a single Rect", () => {
    assert.equal(new HitRect([r1]).hit(pt(0, 0)), 0);
    assert.equal(new HitRect([r1]).hit(pt(2, 2)), -1);
    assert.equal(new HitRect([r1]).hit(pt(0, -1)), -1);
  });

  it("works on a two Rects", () => {
    const r = new HitRect([r2, r1]);
    assert.equal(r.hit(pt(0, 0)), 0, "inside r1");
    assert.equal(r.hit(pt(0, 2)), 1, "inside r2");
    assert.equal(r.hit(pt(2, -1)), -1, "above r1");
    assert.equal(r.hit(pt(2, 1.5)), -1, "vertically between r1 and r2");
    assert.equal(r.hit(pt(2, 4)), -1, "below r2");
    assert.equal(r.hit(pt(3, 2.5)), -1, "to the right of r2");
    assert.equal(r.hit(pt(-1, 2.5)), -1, "to the left of r2");
    assert.equal(r.hit(pt(1.5, 0)), -1, "to the right of r1");
    assert.equal(r.hit(pt(-1.5, 0)), -1, "to the left of r1");
  });
});
