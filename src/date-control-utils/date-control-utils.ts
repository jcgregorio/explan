// Converts a Date into a form to feed to an HTMLDateInput.
export const dateControlValue = (d: Date): string =>
  `${d.getFullYear()}-${("" + (d.getMonth() + 1)).padStart(2, "0")}-${("" + d.getDate()).padStart(2, "0")}`;

export const dateControlDateRe = /\d{4}-\d{2}-\d{2}/;
