import { assert } from "@esm-bundle/chai";
import { MetricDefinition } from "../metrics/metrics";
import { MetricRange } from "../metrics/range";
import { Precision } from "../precision/precision";
import { Days } from "./unit.ts";
import { Result } from "../result.ts";

describe("Units", () => {
  describe("Days", () => {
    const m = new MetricDefinition(
      0,
      new MetricRange(1),
      false,
      new Precision(2)
    );
    const start = new Date("2025-01-22");
    const d = new Days(start, m);

    const isOK = (r: Result<number>) => {
      assert.isTrue(r.ok);
      return r.value;
    };

    it("returns error on bad input", () => {
      assert.isFalse(d.parse("f").ok);
    });

    it("clamps input to the range", () => {
      assert.equal(isOK(d.parse("0")), 1, "clamped from 0 to 1");
    });

    it("rounds to the precision", () => {
      assert.equal(
        isOK(d.parse("1.123456")),
        1.12,
        "rounded to precision of 2"
      );
    });

    it("understands duration shorthands", () => {
      assert.equal(isOK(d.parse("1w")), 7);
      assert.equal(isOK(d.parse("2d1w")), 9);
      assert.equal(isOK(d.parse("2d3m")), 86);
      assert.equal(isOK(d.parse("1w2d3m")), 93);
      assert.equal(
        isOK(d.parse("w")),
        1,
        " w parses as 0w which is 0, but is clamped to 1."
      );
    });
  });
});
