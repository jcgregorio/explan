import { Result, error, ok } from "../result";

// All dates are stored and calculated as noon UTC for consistency.

// Converts a Date into a form to feed to an HTMLDateInput.
export const dateDisplay = (d: Date): string => d.toISOString().slice(0, 10);

export const dateControlDateRe = /\d{4}-\d{2}-\d{2}/;

export const parseDateString = (s: string): Result<Date> => {
  if (!dateControlDateRe.test(s)) {
    return error(new Error(`${s} is not a valid date`));
  }

  return ok(new Date(s + "T12:00:00.000Z"));
};
