import { Plan } from "../plan/plan";

export type PlanStatus =
  | { stage: "unstarted" }
  | {
      stage: "started";
      start: Date;
    };

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
  const unstarted: PlanStatus = { stage: "unstarted" };

  if (p.stage === undefined) {
    return unstarted;
  }
  if (p.stage === "started") {
    if (p.start === undefined) {
      return unstarted;
    }
    return {
      stage: "started",
      start: new Date(p.start),
    };
  }
  return unstarted;
};
