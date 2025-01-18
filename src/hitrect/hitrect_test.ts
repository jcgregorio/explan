import { assert } from "@esm-bundle/chai";
import { HitRect } from "./hitrect.ts";
import { pt } from "../point/point.ts";
import { Rect } from "../rect/rect.ts";

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
    assert.equal(new HitRect([]).hit(pt(0, 0)), null);
  });

  it("works on a single Rect", () => {
    assert.equal(new HitRect([r1]).hit(pt(0, 0)), r1);
    assert.equal(new HitRect([r1]).hit(pt(2, 2)), null);
    assert.equal(new HitRect([r1]).hit(pt(0, -1)), null);
  });

  it("works on a two Rects", () => {
    const r = new HitRect([r2, r1]);
    assert.equal(r.hit(pt(0, 0)), r1, "inside r1");
    assert.equal(r.hit(pt(0, 2)), r2, "inside r2");
    assert.equal(r.hit(pt(2, -1)), null, "above r1");
    assert.equal(r.hit(pt(2, 1.5)), null, "vertically between r1 and r2");
    assert.equal(r.hit(pt(2, 4)), null, "below r2");
    assert.equal(r.hit(pt(3, 2.5)), null, "to the right of r2");
    assert.equal(r.hit(pt(-1, 2.5)), null, "to the left of r2");
    assert.equal(r.hit(pt(1.5, 0)), null, "to the right of r1");
    assert.equal(r.hit(pt(-1.5, 0)), null, "to the left of r1");
  });
});
