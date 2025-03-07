import { MetricDefinition } from "../metrics/metrics";
import { Result, error, ok } from "../result";
import { parseDuration } from "./parse";
import { Weekdays } from "./weekdays";

// Unit describes how the duration values are to be interpreted.
abstract class Unit {
  // Convert a duration into a displayable string.
  abstract displayTime(t: number, locale?: Intl.LocalesArgument): string;

  // Parse a duration, either as a raw number, or in a shorthand duration, such
  // as 1d, 2d, 5y.
  abstract parse(s: string): Result<number>;

  // TODO - Needs a method to go from Date() to duration.
}

// The form a Unit takes when serialized to JSON.
//
// Note we don't serialize the MetricDefinition since that comes from the
// "Duration" static metric.
export interface UnitSerialized {
  unitType: string;
}

export class UnitBase implements Unit {
  protected start: Date;
  protected metricDefn: MetricDefinition;
  protected unitType: UnitTypes;

  constructor(start: Date, metricDefn: MetricDefinition, unitType: UnitTypes) {
    this.start = start;
    this.metricDefn = metricDefn;
    this.unitType = unitType;
  }

  displayTime(t: number, locale?: Intl.LocalesArgument): string {
    throw new Error("Method implemented in subclasses.");
  }

  asDate(t: number): Date {
    throw new Error("Method implemented in subclasses.");
  }

  parse(s: string): Result<number> {
    throw new Error("Method implemented in subclasses.");
  }

  kind(): UnitTypes {
    return this.unitType;
  }

  toJSON(): UnitSerialized {
    return { unitType: this.unitType };
  }

  static fromJSON(
    s: UnitSerialized,
    start: Date,
    metricDefn: MetricDefinition
  ): UnitBase {
    return UnitBuilders[toUnit(s.unitType)](start, metricDefn);
  }
}

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
  (start: Date, metricDefn: MetricDefinition) => UnitBase
> = {
  Unitless: (start: Date, metricDefn: MetricDefinition) =>
    new Unitless(start, metricDefn),
  Days: (start: Date, metricDefn: MetricDefinition) =>
    new Days(start, metricDefn),
  Weekdays: (start: Date, metricDefn: MetricDefinition) =>
    new WeekDays(start, metricDefn),
};

// Parse string into a valid UnitTypes.
export const toUnit = (s: string): UnitTypes => {
  if (UNIT_TYPES.some((t: UnitTypes) => t === s)) {
    return s as UnitTypes;
  }
  return "Unitless";
};

// Unitless.
export class Unitless extends UnitBase implements Unit {
  constructor(start: Date, metricDefn: MetricDefinition) {
    super(start, metricDefn, "Unitless");
  }

  displayTime(t: number, locale?: Intl.LocalesArgument): string {
    return this.metricDefn.clampAndRound(t).toString();
  }

  asDate(t: number): Date {
    // Should never be called.
    return this.start;
  }

  parse(s: string): Result<number> {
    const parsed = +s;
    if (Number.isNaN(parsed)) {
      return error(new Error(`Invalid number value: ${s}`));
    }
    return ok(this.metricDefn.clampAndRound(parsed));
  }
}

export class Days extends UnitBase implements Unit {
  constructor(start: Date, metricDefn: MetricDefinition) {
    super(start, metricDefn, "Days");
  }

  displayTime(t: number, locale?: Intl.LocalesArgument): string {
    return this.asDate(t).toLocaleDateString(locale);
  }

  asDate(t: number): Date {
    const d = new Date(this.start.getTime());
    d.setDate(d.getDate() + t);
    return d;
  }

  parse(s: string): Result<number> {
    const d = parseDuration(s, 7);
    if (!d.ok) {
      return d;
    }
    return ok(this.metricDefn.clampAndRound(d.value));
  }
}

export class WeekDays extends UnitBase implements Unit {
  weekdays: Weekdays;

  constructor(start: Date, metricDefn: MetricDefinition) {
    super(start, metricDefn, "Weekdays");
    this.weekdays = new Weekdays(start);
  }

  // Locale only used for testing.
  displayTime(t: number, locale?: Intl.LocalesArgument): string {
    return this.asDate(t).toLocaleDateString(locale);
  }

  asDate(t: number): Date {
    const d = new Date(this.start.getTime());
    d.setDate(d.getDate() + this.weekdays.weekdaysToDays(t));
    return d;
  }

  parse(s: string): Result<number> {
    const d = parseDuration(s, 5);
    if (!d.ok) {
      return d;
    }
    return ok(this.metricDefn.clampAndRound(d.value));
  }
}
