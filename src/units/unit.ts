import { MetricDefinition } from "../metrics/metrics";

interface Unit {
  displayTime(t: number): string;
  parse(s: string): number;
}

class Unitless implements Unit {
  metricDefn: MetricDefinition;

  constructor(metricDefn: MetricDefinition) {
    this.metricDefn = metricDefn;
  }

  displayTime(t: number): string {
    return this.metricDefn.clampAndRound(t).toString();
  }
  parse(s: string): number {
    return this.metricDefn.clampAndRound(+s);
  }
}

class Days implements Unit {
  start: Date;
  metricDefn: MetricDefinition;

  constructor(start: Date, metricDefn: MetricDefinition) {
    this.start = start;
    this.metricDefn = metricDefn;
  }

  displayTime(t: number): string {
    const d = new Date(this.start.getTime() + t * 60 * 60 * 24);
    return d.toLocaleDateString();
  }

  parse(s: string): number {
    // Need code to convert 1w2d => 9.
    return this.metricDefn.clampAndRound(+s);
  }
}

class WeekDays implements Unit {
  start: Date;
  metricDefn: MetricDefinition;

  constructor(start: Date, metricDefn: MetricDefinition) {
    this.start = start;
    this.metricDefn = metricDefn;
  }

  displayTime(t: number): string {
    // Need a func to convert the number of weekdays into a number of days,
    // i.e. adding in all the weekends (and eventually holidays).
    const d = new Date(this.start.getTime() + t * 60 * 60 * 24);
    return d.toLocaleDateString();
  }

  parse(s: string): number {
    // Need code to convert 1w2d => 9.
    return this.metricDefn.clampAndRound(+s);
  }
}
