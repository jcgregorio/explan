import { Result, error, ok } from '../result';

const decimalRegex = /^[\d\.]+$/;

/**
 * The values of daysInWeek mean:
 *
 *   7 - 7 days in a week (weekends aren't special).
 *
 *   5 - 5 days a week (don't count weekends).
 *
 *   0 - This is a unitless duration, not days, values are just numbers,
 */
export type DurationUnitType = 0 | 5 | 7;

/**
 * Parses a human duration, such as "1w3d" to a number of days.
 *
 * The actualy number of days returned depends on the units of what a day means,
 * which is passed in via daysInWeek.
 *
 * The values of daysInWeek mean:
 *
 *   7 - 7 days in a week (weekends aren't special).
 *
 *   5 - 5 days a week (don't count weekends).
 *
 *   0 - This is a unitless duration, not days, values that aren't just numbers,
 *       such as '1w2d' will return an error.
 */
export const parseHumanDuration = (
  s: string,
  daysInWeek: DurationUnitType
): Result<number> => {
  s = s.trim();

  // Empty string is always 0.
  if (s === '') {
    return ok(0);
  }

  if (s.match(decimalRegex)) {
    const parsed = +s;
    if (Number.isNaN(parsed)) {
      return error(new Error(`Invalid number value: ${s}`));
    }
    return ok(parsed);
  }

  if (daysInWeek === 0) {
    return error(new Error(`${s} is not a valid unitless duration.`));
  }
  let ret = 0;
  let num = 0;
  const chars = [...s];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c === 'd') {
      ret += num;
      num = 0;
    } else if (c === 'w') {
      ret += num * daysInWeek;
      num = 0;
    } else if (c === 'm') {
      ret += num * daysInWeek * 4 + 2; // 4 weeks + 2 days, i.e. 30 days in either 5 or 7 daysInWeek.
      num = 0;
    } else if (c === 'y') {
      ret += num * daysInWeek * 52;
      num = 0;
    } else if ('0123456789'.includes(c)) {
      num = num * 10 + +c;
    } else {
      return error(new Error(`invalid duration format: ${s}`));
    }
  }
  return ok(ret);
};

/**
 * Converts a number duration into a human duration string.
 *
 *
 * The values of daysInWeek mean:
 *
 *   7 - 7 days in a week (weekends aren't special). E: 8 -> "1w1d"
 *
 *   5 - 5 days a week (don't count weekends). E: 8 -> "1w3d"
 *
 *   0 - This is a unitless duration, not days, values that aren't just numbers,
 *       such as '1w2d' will return an error. Ex: 8 -> "8".
 *
 */
export const durationToHuman = (
  days: number,
  daysInWeek: DurationUnitType
): Result<string> => {
  if (days < 0) {
    return error(new Error(`Can't convert negative days: ${days}`));
  }
  if (days === 0) {
    return ok('0');
  }
  if (daysInWeek === 0) {
    return ok(`${days}`);
  }
  days = Math.floor(days);
  const daysInYear = 52 * daysInWeek;
  const daysInMonth = 4 * daysInWeek + 2;
  const parts: string[] = [];
  if (days >= daysInYear) {
    const years = Math.floor(days / daysInYear);
    days = days % daysInYear;
    parts.push(`${years}y`);
  }
  if (days >= daysInMonth) {
    const months = Math.floor(days / daysInMonth);
    days = days % daysInMonth;
    parts.push(`${months}m`);
  }
  if (days >= daysInWeek) {
    const weeks = Math.floor(days / daysInWeek);
    days = days % daysInWeek;
    parts.push(`${weeks}w`);
  }
  if (days > 0) {
    parts.push(`${days}d`);
  }
  return ok(parts.join(''));
};

/**
 * Converts a human duration
 * @param duration
 * @param fromDaysInWeek
 * @param toDaysInWeek
 * @returns
 */
export const changeUnits = (
  duration: number,
  fromDaysInWeek: DurationUnitType,
  toDaysInWeek: DurationUnitType
): Result<number> => {
  if (toDaysInWeek === 0) {
    return ok(duration);
  }

  const ret = durationToHuman(duration, fromDaysInWeek);
  if (!ret.ok) {
    return ret;
  }

  return parseHumanDuration(ret.value, toDaysInWeek);
};
