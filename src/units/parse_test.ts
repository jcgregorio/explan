import { assert } from "@esm-bundle/chai";
import { parseDuration } from "./parse.ts";
import { Result } from "../result.ts";

const isOK = (r: Result<number>): number => {
  assert.isTrue(r.ok);
  return r.value;
};

describe("parseDuration", () => {
  it("handles shorthand durations", () => {
    assert.equal(isOK(parseDuration("1w", 7)), 7);
    assert.equal(isOK(parseDuration("1w", 5)), 5);
    assert.equal(isOK(parseDuration("1d1w", 5)), 6);
    assert.equal(isOK(parseDuration("1w1d", 5)), 6);
    assert.equal(isOK(parseDuration("1w1d1m", 5)), 4 * 5 + 5 + 1);
    assert.equal(isOK(parseDuration("1w1d1m", 7)), 4 * 7 + 7 + 1);
    assert.equal(isOK(parseDuration("10d", 7)), 10);
    assert.equal(isOK(parseDuration("10d", 7)), 10);
  });

  it("handles numbers", () => {
    assert.equal(isOK(parseDuration("1", 5)), 1);
    assert.equal(isOK(parseDuration("100", 5)), 100);
    assert.equal(isOK(parseDuration("1101.124", 5)), 1101.124);
  });

  it("detects invalid durations numbers", () => {
    assert.isFalse(parseDuration("f", 5).ok);
    assert.isFalse(parseDuration("123z", 5).ok);
  });
});
