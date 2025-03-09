export type PlanStatus =
  | { stage: "unstarted"; start: 0 }
  | {
      stage: "started";
      start: number; // Number of milliseconds since the epoch.
    };

export const statusToDate = (status: PlanStatus): Date => {
  if (status.stage === "unstarted") {
    return new Date();
  }
  return new Date(status.start);
};

export const unstarted: PlanStatus = { stage: "unstarted", start: 0 };

export type PlanStatusSerialized = {
  stage: string;
  start: number;
};

export const toJSON = (p: PlanStatus): PlanStatusSerialized => {
  const ret: PlanStatusSerialized = {
    stage: "unstarted",
    start: 0,
  };
  if (p.stage === "started") {
    ret.stage = "started";
    ret.start = p.start.valueOf();
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
    return {
      stage: "started",
      start: p.start,
    };
  }
  return unstarted;
};
