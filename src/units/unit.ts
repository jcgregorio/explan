import { MetricDefinition } from "../metrics/metrics";
import { Result, ok } from "../result";
import { parseDuration } from "./parse";
import { Weekdays } from "./weekdays";

interface Unit {
  displayTime(t: number): string;
  parse(s: string): Result<number>;
}

export class Unitless implements Unit {
  metricDefn: MetricDefinition;

  constructor(metricDefn: MetricDefinition) {
    this.metricDefn = metricDefn;
  }

  displayTime(t: number): string {
    return this.metricDefn.clampAndRound(t).toString();
  }
  parse(s: string): Result<number> {
    return ok(this.metricDefn.clampAndRound(+s));
  }
}

export class Days implements Unit {
  start: Date;
  metricDefn: MetricDefinition;

  constructor(start: Date, metricDefn: MetricDefinition) {
    this.start = start;
    this.metricDefn = metricDefn;
  }

  displayTime(t: number, locale?: Intl.LocalesArgument): string {
    const d = new Date(this.start.getTime());
    d.setDate(d.getDate() + t);
    return d.toLocaleDateString(locale);
  }

  parse(s: string): Result<number> {
    const d = parseDuration(s, 7);
    if (!d.ok) {
      return d;
    }
    return ok(this.metricDefn.clampAndRound(d.value));
  }
}

export class WeekDays implements Unit {
  start: Date;
  metricDefn: MetricDefinition;
  weekdays: Weekdays;

  constructor(start: Date, metricDefn: MetricDefinition) {
    this.start = start;
    this.metricDefn = metricDefn;
    this.weekdays = new Weekdays(start);
  }

  // Locale only used for testing.
  displayTime(t: number, locale?: Intl.LocalesArgument): string {
    const d = new Date(this.start.getTime());
    d.setDate(d.getDate() + this.weekdays.weekdaysToDays(t));
    return d.toLocaleDateString(locale);
  }

  parse(s: string): Result<number> {
    const d = parseDuration(s, 5);
    if (!d.ok) {
      return d;
    }
    return ok(this.metricDefn.clampAndRound(d.value));
  }
}
