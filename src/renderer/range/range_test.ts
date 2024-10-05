import { assert } from "@esm-bundle/chai";
import { DisplayRange, MIN_DISPLAY_RANGE } from "./range.ts";

describe("DisplayRange", () => {
  it("Fixes up the order of its inputs", () => {
    const r = new DisplayRange(10, -10);
    assert.equal(r.begin, -10);
    assert.equal(r.end, 10);
  });

  it("Honors the minumum range", () => {
    const r = new DisplayRange(0, 0);
    assert.equal(r.begin, 0);
    assert.equal(r.end, MIN_DISPLAY_RANGE);
  });
});
