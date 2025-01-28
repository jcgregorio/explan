import { MetricDefinition } from "../metrics/metrics";
import { Result, error, ok } from "../result";
import { parseDuration } from "./parse";
import { Weekdays } from "./weekdays";

// Unit describes how the duration values are to be interpreted.
interface Unit {
  // Convert a duration into a displayable string.
  displayTime(t: number): string;

  // Parse a duration, either as a raw number, or in a shorthand duration, such
  // as 1d, 2d, 5y.
  parse(s: string): Result<number>;

  unitType: UnitTypes;

  start: Date;
}

interface UnitSerialized {
  start: number;
  unitType: string;
}

const toJSON = (u: Unit): UnitSerialized => {
  return {
    unitType: u.unitType,
    start: u.start.getTime(),
  };
};

const fromJSON = (s: string, metricDefn: MetricDefinition): Unit => {
  const unitSerialized: UnitSerialized = JSON.parse(s);
  return UnitBuilders[toUnit(unitSerialized.unitType)](
    new Date(unitSerialized.start),
    metricDefn
  );
};

const UNIT_TYPES = ["Unitless", "Days", "Weekdays"] as const;

// All types of duration units available.
export type UnitTypes = (typeof UNIT_TYPES)[number];

// Describes each type of Unit available.
export const UnitDescriptions: Record<UnitTypes, string> = {
  Unitless: "Unitless durations.",
  Days: "Days, with 7 days a week.",
  Weekdays: "Days, with 5 days a week.",
};

// Builders for each type of Unit.
export const UnitBuilders: Record<
  UnitTypes,
  (start: Date, metricDefn: MetricDefinition) => Unit
> = {
  Unitless: (start: Date, metricDefn: MetricDefinition) =>
    new Unitless(start, metricDefn),
  Days: (start: Date, metricDefn: MetricDefinition) =>
    new Days(start, metricDefn),
  Weekdays: (start: Date, metricDefn: MetricDefinition) =>
    new WeekDays(start, metricDefn),
};

export const toUnit = (s: string): UnitTypes => {
  if (UNIT_TYPES.some((t: UnitTypes) => t === s)) {
    return s as UnitTypes;
  }
  return "Unitless";
};

// Unitless,
export class Unitless implements Unit {
  start: Date;
  metricDefn: MetricDefinition;

  unitType: UnitTypes = "Unitless";

  constructor(start: Date, metricDefn: MetricDefinition) {
    this.start = start;
    this.metricDefn = metricDefn;
  }

  displayTime(t: number): string {
    return this.metricDefn.clampAndRound(t).toString();
  }

  parse(s: string): Result<number> {
    const parsed = +s;
    if (Number.isNaN(parsed)) {
      return error(new Error(`Invalid number value: ${s}`));
    }
    return ok(this.metricDefn.clampAndRound(parsed));
  }
}

export class Days implements Unit {
  start: Date;
  metricDefn: MetricDefinition;

  unitType: UnitTypes = "Days";

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

  unitType: UnitTypes = "Weekdays";

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
