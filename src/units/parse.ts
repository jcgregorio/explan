import { Result, error, ok } from "../result";

const decimalRegex = /^[\d\.]+$/;
const shorthandRegex = /^(\d+d)?(\d+w)?(\d+m)?(\d+y)?$/;

export const parseDuration = (s: string, daysInWeek: 5 | 7): Result<number> => {
  if (s.match(decimalRegex)) {
    return ok(+s);
  }
  let ret = 0;
  let num = 0;
  const chars = [...s];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c === "d") {
      ret += num;
      num = 0;
    } else if (c === "w") {
      ret += num * daysInWeek;
      num = 0;
    } else if (c === "m") {
      ret += num * daysInWeek * 4;
      num = 0;
    } else if ("0123456789".includes(c)) {
      num = num * 10 + +c;
    } else {
      return error(new Error(`invalid duration format: ${s}`));
    }
  }
  return ok(ret);
};
