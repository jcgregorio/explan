import { assert } from "@esm-bundle/chai";
import { Weekdays } from "./weekdays.ts";
import { Result } from "../result.ts";

describe("Weekdays", () => {
  it("Converts properly starting on a weekday", () => {
    const w = new Weekdays(new Date("2025-01-20T12:00:00")); // Monday
    assert.equal(w.weekdaysToDays(0), 0); // Monday
    assert.equal(w.weekdaysToDays(1), 1); // T
    assert.equal(w.weekdaysToDays(2), 2); // W
    assert.equal(w.weekdaysToDays(3), 3); // Th
    assert.equal(w.weekdaysToDays(4), 4); // F
    assert.equal(w.weekdaysToDays(5), 7); // M
    assert.equal(w.weekdaysToDays(6), 8);
    assert.equal(w.weekdaysToDays(7), 9);
    assert.equal(w.weekdaysToDays(7), 9);
    assert.equal(w.cache.get(7), 9);
  });

  it("Converts properly starting on a weekend", () => {
    const w = new Weekdays(new Date("2025-01-25T12:00:00")); // Sat
    assert.equal(w.weekdaysToDays(0), 0); // Sat
    assert.equal(w.weekdaysToDays(1), 2); // M
    assert.equal(w.weekdaysToDays(2), 3); // T
    assert.equal(w.weekdaysToDays(3), 4); // W
    assert.equal(w.weekdaysToDays(4), 5); // Th
    assert.equal(w.weekdaysToDays(5), 6); // F
    assert.equal(w.weekdaysToDays(6), 9); // M
    assert.equal(w.weekdaysToDays(7), 10); // T
    assert.equal(w.weekdaysToDays(7), 10);
  });

  const unwrapIfOK = (r: Result<number>): number => {
    assert.isTrue(r.ok);
    return r.value;
  };

  it("Converts a date back into a date offset", () => {
    const w = new Weekdays(new Date("2025-01-24T12:00:00")); // Fri
    assert.equal(unwrapIfOK(w.dateToWeekday("2025-01-25")), 1); // Sat
    assert.equal(unwrapIfOK(w.dateToWeekday("2025-01-26")), 1); // S
    assert.equal(unwrapIfOK(w.dateToWeekday("2025-01-27")), 1); // M
    assert.equal(unwrapIfOK(w.dateToWeekday("2025-01-28")), 2); // T
    assert.equal(unwrapIfOK(w.dateToWeekday("2025-01-29")), 3); // W
    assert.equal(unwrapIfOK(w.dateToWeekday("2025-01-30")), 4); // Th
    assert.equal(unwrapIfOK(w.dateToWeekday("2025-01-31")), 5); // F
  });
});
