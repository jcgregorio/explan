import {
  dateDisplay,
  parseDateString,
  todayAsUTC,
} from "../date-control-utils/date-control-utils";

export type PlanStatus =
  | { stage: "unstarted"; start: 0 }
  | {
      stage: "started";
      start: number; // Number of milliseconds since the epoch. Could probably be changed to a Date.
    };

export const statusToDate = (status: PlanStatus): Date => {
  if (status.stage === "unstarted") {
    return todayAsUTC();
  }

  return new Date(status.start);
};

export const unstarted: PlanStatus = { stage: "unstarted", start: 0 };

export type PlanStatusSerialized = {
  stage: string;
  start: string;
};

export const toJSON = (p: PlanStatus): PlanStatusSerialized => {
  const ret: PlanStatusSerialized = {
    stage: "unstarted",
    start: "",
  };
  if (p.stage === "started") {
    ret.stage = "started";
    ret.start = dateDisplay(new Date(p.start));
  }
  return ret;
};

export const fromJSON = (p: PlanStatusSerialized): PlanStatus => {
  const unstarted: PlanStatus = { stage: "unstarted", start: 0 };

  if (p.stage === undefined) {
    return unstarted;
  }
  if (p.stage === "started") {
    if (p.start === undefined) {
      return unstarted;
    }
    const ret = parseDateString(p.start);
    if (!ret.ok) {
      return unstarted;
    }
    return {
      stage: "started",
      start: ret.value.getTime(),
    };
  }
  return unstarted;
};
