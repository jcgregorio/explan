import { MetricDefinition } from "./metrics";
import { MetricRange } from "./range";
import { assert } from "@esm-bundle/chai";

describe("MetricDefinition", () => {
  it("Clamps the provided default to the range.", () => {
    const m = new MetricDefinition(new MetricRange(-1, 1), 2);
    assert.equal(m.default, 1);
  });
});
