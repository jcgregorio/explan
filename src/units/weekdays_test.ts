import { assert } from "@esm-bundle/chai";
import { Weekdays } from "./weekdays.ts";

describe("Weekdays", () => {
  let w: Weekdays;
  beforeEach(() => {
    w = new Weekdays(new Date("2025-01-20T12:00:00"));
  });

  it("Converts 0 to 0", () => {
    assert.equal(w.weekdaysToDays(0), 0); // Monday
    assert.equal(w.weekdaysToDays(1), 1); // T
    assert.equal(w.weekdaysToDays(2), 2); // W
    assert.equal(w.weekdaysToDays(3), 3); // Th
    assert.equal(w.weekdaysToDays(4), 4); // F
    assert.equal(w.weekdaysToDays(5), 7); // Sat
    assert.equal(w.weekdaysToDays(6), 8);
    assert.equal(w.weekdaysToDays(7), 9);
    assert.equal(w.weekdaysToDays(7), 9);
    assert.equal(w.cache.get(7), 9);
  });
});
