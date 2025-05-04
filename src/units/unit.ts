import {
  dateDisplay,
  parseDateString,
} from '../date-control-utils/date-control-utils';
import { MetricDefinition } from '../metrics/metrics';
import { Result, error, ok } from '../result';
import {
  durationToHuman,
  parseHumanDuration,
  UnitTypeToDurationUnitType,
} from './parse';
import { Weekdays } from './weekdays';

// Unit describes how the duration values are to be interpreted.
abstract class Unit {
  // Convert a duration into a displayable string.
  abstract displayTime(t: number, locale?: Intl.LocalesArgument): string;

  // Parse a duration, either as a raw number, or in a shorthand duration, such
  // as 1d, 2d, 5y.
  abstract parseHumanDuration(s: string): Result<number>;

  // Coverts a duration to a human friendly representaiton.
  abstract durationToHuman(days: number): Result<string>;

  // parse a date string.
  abstract dateStringToDuration(s: string): Result<number>;

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  displayTime(_t: number): string {
    throw new Error('Method implemented in subclasses.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  asDate(_t: number): Date {
    throw new Error('Method implemented in subclasses.');
  }

  parseHumanDuration(s: string): Result<number> {
    return parseHumanDuration(s, UnitTypeToDurationUnitType(this.unitType));
  }

  durationToHuman(days: number): Result<string> {
    return durationToHuman(days, UnitTypeToDurationUnitType(this.unitType));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dateStringToDuration(_s: string): Result<number> {
    throw new Error('Method implemented in subclasses.');
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

export const UNIT_TYPES = ['Unitless', 'Days', 'Weekdays'] as const;

// All types of duration units available.
export type UnitTypes = (typeof UNIT_TYPES)[number];

// Describes each type of Unit available.
export const UnitDescriptions: Record<UnitTypes, string> = {
  Unitless: 'Unitless durations.',
  Days: 'Days, with 7 days a week.',
  Weekdays: 'Days, with 5 days a week.',
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
  return 'Unitless';
};

// Unitless.
export class Unitless extends UnitBase implements Unit {
  constructor(start: Date, metricDefn: MetricDefinition) {
    super(start, metricDefn, 'Unitless');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  displayTime(t: number, _locale?: Intl.LocalesArgument): string {
    return this.metricDefn.clampAndRound(t).toString();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  asDate(_t: number): Date {
    // Should never be called.
    return this.start;
  }

  dateStringToDuration(s: string): Result<number> {
    const ret = parseHumanDuration(s, 0);
    if (!ret.ok) {
      return ret;
    }
    return ok(this.metricDefn.clampAndRound(ret.value));
  }
}

export class Days extends UnitBase implements Unit {
  constructor(start: Date, metricDefn: MetricDefinition) {
    super(start, metricDefn, 'Days');
  }

  displayTime(t: number): string {
    return dateDisplay(this.asDate(t));
  }

  asDate(t: number): Date {
    // Dup the start Date first.
    const d = new Date(this.start.getTime());
    d.setDate(d.getDate() + t);
    return d;
  }

  dateStringToDuration(s: string): Result<number> {
    const ret = parseDateString(s);
    if (!ret.ok) {
      return ret;
    }
    const deltaInMilliseconds = ret.value.getTime() - this.start.getTime() + 1;
    if (deltaInMilliseconds < 0) {
      return error(new Error('Dates before the plan start are not allowed.'));
    }

    return ok(
      this.metricDefn.clampAndRound(deltaInMilliseconds / (1000 * 60 * 60 * 24))
    );
  }
}

export class WeekDays extends UnitBase implements Unit {
  weekdays: Weekdays;

  constructor(start: Date, metricDefn: MetricDefinition) {
    super(start, metricDefn, 'Weekdays');
    this.weekdays = new Weekdays(start);
  }

  // Locale only used for testing.
  displayTime(t: number): string {
    return dateDisplay(this.asDate(t));
  }

  asDate(t: number): Date {
    // Dup the start Date first.
    const d = new Date(this.start.getTime());
    d.setDate(d.getDate() + this.weekdays.weekdaysToDays(t));
    return d;
  }

  dateStringToDuration(s: string): Result<number> {
    return this.weekdays.dateToWeekday(s);
  }
}
