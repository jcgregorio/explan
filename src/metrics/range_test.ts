import { MetricRange, clamp } from "./range";
import { assert } from "@esm-bundle/chai";

describe("clamp", () => {
  it("Handles numbers above the range.", () => {
    assert.equal(clamp(10, -1, 1), 1);
  });
  it("Handles numbers below the range.", () => {
    assert.equal(clamp(-10, -1, 1), -1);
  });
  it("Handles numbers within the range.", () => {
    assert.equal(clamp(0.1, -1, 1), 0.1);
  });
});

describe("MetricRange", () => {
  it("Ensures min < max", () => {
    // Note min and max are backwards.
    const r = new MetricRange(10, 5);
    assert.equal(r.min, 5);
    assert.equal(r.max, 10);
  });

  it("Has sensible defaults for constructor.", () => {
    // Note min and max are backwards.
    const r = new MetricRange();
    assert.equal(r.min, -Number.MAX_VALUE);
    assert.equal(r.max, Number.MAX_VALUE);
  });

  describe("Returns the right information when clamping a value.", () => {
    const mr = new MetricRange(-1, 1);
    it("Handles numbers above the range.", () => {
      assert.deepEqual(mr.clamp(10), 1);
    });
    it("Handles numbers below the range.", () => {
      assert.deepEqual(mr.clamp(-10), -1);
    });
    it("Handles numbers within the range.", () => {
      assert.deepEqual(mr.clamp(0.1), 0.1);
    });
  });
});
