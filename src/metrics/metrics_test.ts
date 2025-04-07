import { Precision } from "../precision/precision.ts";
import { MetricDefinition, MetricDefinitionSerialized } from "./metrics.ts";
import { MetricRange } from "./range.ts";
import { assert } from "@esm-bundle/chai";

describe("MetricDefinition", () => {
  it("Clamps the provided default to the range.", () => {
    const m = new MetricDefinition(2, new MetricRange(-1, 1));
    assert.equal(m.default, 1);
  });

  it("Rounds default, min and max to the provided precision.", () => {
    const m = new MetricDefinition(
      2.22222,
      new MetricRange(-1.1234, 1.1234),
      false,
      new Precision(2),
    );
    assert.equal(m.default, 1.12);
    assert.equal(m.range.min, -1.12);
    assert.equal(m.range.max, 1.12);
  });

  it("Round trips through JSON", () => {
    const m = new MetricDefinition(
      50,
      new MetricRange(0, 100),
      false,
      new Precision(2),
    );
    const reconstituted = MetricDefinition.fromJSON(m.toJSON());
    assert.deepEqual(m, reconstituted);
  });

  it("Can be deserialized from {}", () => {
    const reconstituted = MetricDefinition.fromJSON(
      {} as unknown as MetricDefinitionSerialized,
    );
    assert.equal(reconstituted.range.max, Number.MAX_VALUE);
  });
});
