import {
  dateControlDateRe,
  dateControlValue,
} from "../date-control-utils/date-control-utils";
import { Result, error, ok } from "../result";

export class Weekdays {
  start: Date;

  /**
   * Maps from a number of weekdays (from this.start) to a number of days (which
   * ignores includes weekends.
   */
  cache: Map<number, number>;
  lastCacheEntry: number;

  constructor(start: Date) {
    this.start = start;
    this.cache = new Map();
    this.cache.set(0, 0);
    this.lastCacheEntry = 0;
  }

  dateToWeekday(s: string): Result<number> {
    if (!dateControlDateRe.test(s)) {
      return error(new Error(`${s} is not a valid date`));
    }
    // This should be done faster, possibly w/caching.

    const date = new Date(s);
    if (date <= this.start) {
      return error(new Error(`${date} comes before ${this.start}`));
    }
    let start = new Date(this.start.getTime());
    let formattedDate = dateControlValue(start);
    let weekDay = 0;
    while (formattedDate < s) {
      const oldDate = start.getDate();
      start.setDate(oldDate + 1);

      const dayOfWeek = start.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Sun or Sat.
        // TODO - Here is where holiday checks would go.
        continue;
      }

      weekDay += 1;
      formattedDate = dateControlValue(start);
    }
    return ok(weekDay);
  }

  weekdaysToDays(numWeekdays: number): number {
    if (numWeekdays < 0) {
      return 0;
    }
    numWeekdays = Math.trunc(numWeekdays);
    const cacheValue = this.cache.get(numWeekdays);
    if (cacheValue !== undefined) {
      return cacheValue;
    }

    let start = new Date(this.start.getTime());
    let weekday = this.lastCacheEntry;
    let day = this.cache.get(weekday)!;
    start.setDate(start.getDate() + day);

    while (weekday !== numWeekdays) {
      const oldDate = start.getDate();
      start.setDate(oldDate + 1);
      day += 1;

      const dayOfWeek = start.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Sun or Sat.
        // TODO - Here is where holiday checks would go.
        continue;
      }
      weekday += 1;
      this.cache.set(weekday, day);
    }
    this.lastCacheEntry = weekday;
    return day;
  }
}
