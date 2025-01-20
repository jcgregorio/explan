import { assert } from "@esm-bundle/chai";
import { Weekdays } from "./weekdays.ts";

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
});
