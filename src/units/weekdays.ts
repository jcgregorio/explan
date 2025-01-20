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
        continue;
      }
      weekday += 1;
      this.cache.set(weekday, day);
    }
    this.lastCacheEntry = weekday;
    return day;
  }
}
