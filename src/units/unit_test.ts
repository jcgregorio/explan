import { assert } from "@esm-bundle/chai";
import { MetricDefinition } from "../metrics/metrics";
import { MetricRange } from "../metrics/range";
import { Precision } from "../precision/precision";
import { Days, UnitBase, Unitless, WeekDays } from "./unit.ts";
import { Result } from "../result.ts";
import { parseDateString } from "../date-control-utils/date-control-utils.ts";

describe("Units", () => {
  const m = new MetricDefinition(
    0,
    new MetricRange(1),
    false,
    new Precision(2),
  );
  const ret = parseDateString("2025-01-22");
  assert.isTrue(ret.ok);

  const start = ret.value;

  describe("Unitless", () => {
    const d = new Unitless(start, m);

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
        "rounded to precision of 2",
      );
    });

    it("understands duration shorthands", () => {
      assert.isFalse(d.parse("1w").ok);
      assert.isFalse(d.parse("2d1w").ok);
      assert.isFalse(d.parse("2d3m").ok);
      assert.isFalse(d.parse("1w2d3m").ok);
      assert.isFalse(d.parse("w").ok);
    });

    it("displays durations correctly", () => {
      assert.equal(d.displayTime(0), "1", "clamped to 1 first");
      assert.equal(d.displayTime(1.2), "1.2");
    });

    it("roundtrips through JSON", () => {
      const d2 = UnitBase.fromJSON(JSON.parse(JSON.stringify(d)), start, m);
      assert.deepEqual(d, d2);
    });
  });

  describe("Days", () => {
    const d = new Days(start, m);

    const isOK = (r: Result<number>) => {
      assert.isTrue(r.ok);
      return r.value;
    };

    it("returns error on bad input", () => {
      assert.isFalse(d.parse("f").ok);
    });

    it("parses dates correctly", () => {
      assert.equal(isOK(d.parse("2025-01-25")), 3);
    });

    it("displays durations correctly", () => {
      assert.equal(d.displayTime(0), "2025-01-22");
      assert.equal(d.displayTime(1.2), "2025-01-23");
    });

    it("roundtrips through JSON", () => {
      const stringified = JSON.stringify(d);
      const d2 = UnitBase.fromJSON(JSON.parse(stringified), start, m);
      assert.deepEqual(d2, d);
    });
  });

  describe("WeekDays", () => {
    const d = new WeekDays(start, m);

    const isOK = (r: Result<number>) => {
      assert.isTrue(r.ok);
      return r.value;
    };

    it("returns error on bad input", () => {
      assert.isFalse(d.parse("f").ok);
    });

    it("parses dates correctly", () => {
      assert.equal(isOK(d.parse("2025-01-25")), 3);
    });

    it("displays durations correctly", () => {
      assert.equal(d.displayTime(0), "2025-01-22");
      assert.equal(d.displayTime(1.2), "2025-01-23");
    });

    it("roundtrips through JSON", () => {
      const d1 = new WeekDays(start, m);
      const stringified = JSON.stringify(d1);
      const d2 = UnitBase.fromJSON(JSON.parse(stringified), start, m);
      assert.deepEqual(d1, d2);
    });
  });
});
