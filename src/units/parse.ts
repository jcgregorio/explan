const decimalRegex = /^[\d\.]+$/;
const shorthandRegex = /^(\d+d)?(\d+w)?(\d+m)?(\d+y)?$/;

export const parseDuration = (s: string, daysInWeek: 5 | 7): number => {
  if (s.match(decimalRegex)) {
    return +s;
  }
  let ret = 0;
  let num = 0;
  [...s].forEach((c: string) => {
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
      // Error?!?!
    }
  });
  return ret;
};
