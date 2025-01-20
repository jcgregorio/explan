import { assert } from "@esm-bundle/chai";
import { parseDuration } from "./parse.ts";

describe("parseDuration", () => {
  it("handles shorthand durations", () => {
    assert.equal(parseDuration("1w", 7), 7);
    assert.equal(parseDuration("1w", 5), 5);
    assert.equal(parseDuration("1d1w", 5), 6);
    assert.equal(parseDuration("1w1d", 5), 6);
    assert.equal(parseDuration("1w1d1m", 5), 4 * 5 + 5 + 1);
    assert.equal(parseDuration("1w1d1m", 7), 4 * 7 + 7 + 1);
    assert.equal(parseDuration("10d", 7), 10);
    assert.equal(parseDuration("10d", 7), 10);
  });
});
