import { Task } from "../chart/chart";
import { Plan } from "../plan/plan";
import { Precision } from "../precision/precision";
import { ComputeSlack, CriticalPath } from "../slack/slack";
import { Jacobian, Uncertainty } from "../stats/cdf/triangular/jacobian";

const MAX_RANDOM = 1000;

const precision = new Precision(2);

const rndInt = (n: number): number => {
  return Math.floor(Math.random() * n);
};

export interface CriticalPathEntry {
  count: number;
  tasks: number[];
  durations: number[];
}

export const simulation = (
  plan: Plan,
  numSimulationLoops: number
): Map<string, CriticalPathEntry> => {
  // Simulate the uncertainty in the plan and generate possible alternate
  // critical paths.

  const allCriticalPaths = new Map<string, CriticalPathEntry>();

  for (let i = 0; i < numSimulationLoops; i++) {
    const durations = plan.chart.Vertices.map((t: Task) => {
      const rawDuration = new Jacobian(
        t.duration,
        t.getResource("Uncertainty") as Uncertainty
      ).sample(rndInt(MAX_RANDOM) / MAX_RANDOM);
      return precision.round(rawDuration);
    });

    const slacksRet = ComputeSlack(
      plan.chart,
      (t: Task, taskIndex: number) => durations[taskIndex],
      precision.rounder()
    );
    if (!slacksRet.ok) {
      throw slacksRet.error;
    }
    const criticalPath = CriticalPath(slacksRet.value, precision.rounder());
    const criticalPathAsString = `${criticalPath}`;
    let pathEntry = allCriticalPaths.get(criticalPathAsString);
    if (pathEntry === undefined) {
      pathEntry = {
        count: 0,
        tasks: criticalPath,
        durations: durations,
      };
      allCriticalPaths.set(criticalPathAsString, pathEntry);
    }
    pathEntry.count++;
  }
  return allCriticalPaths;
};
