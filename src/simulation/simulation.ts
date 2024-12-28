import { Chart, Task } from "../chart/chart";
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
  criticalPath: number[];
  durations: number[];
}

export interface CriticalPathTaskEntry {
  taskIndex: number;
  duration: number;
  numTimesAppeared: number;
}

export interface SimulationResults {
  paths: Map<string, CriticalPathEntry>;
  tasks: CriticalPathTaskEntry[];
}

/**
 * Simulate the uncertainty in the plan and generate possible alternate critical
 * paths.
 */
export const simulation = (
  chart: Chart,
  numSimulationLoops: number
): SimulationResults => {
  // Simulate the uncertainty in the plan and generate possible alternate
  // critical paths.

  const allCriticalPaths = new Map<string, CriticalPathEntry>();

  for (let i = 0; i < numSimulationLoops; i++) {
    // Generate random durations based on each Tasks uncertainty.
    const durations = chart.Vertices.map((t: Task) => {
      const rawDuration = new Jacobian(
        t.duration, // Acceptable direct access to duration.
        t.getResource("Uncertainty") as Uncertainty
      ).sample(rndInt(MAX_RANDOM) / MAX_RANDOM);
      return precision.round(rawDuration);
    });

    // Compute the slack based on those random durations.
    const slacksRet = ComputeSlack(
      chart,
      (taskIndex: number) => durations[taskIndex],
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
        criticalPath: criticalPath,
        durations: durations,
      };
      allCriticalPaths.set(criticalPathAsString, pathEntry);
    }
    pathEntry.count++;
  }

  return {
    paths: allCriticalPaths,
    tasks: criticalTaskFrequencies(allCriticalPaths, chart),
  };
};

export const criticalTaskFrequencies = (
  allCriticalPaths: Map<string, CriticalPathEntry>,
  chart: Chart
): CriticalPathTaskEntry[] => {
  const critialTasks: Map<number, CriticalPathTaskEntry> = new Map();

  allCriticalPaths.forEach((value: CriticalPathEntry) => {
    value.criticalPath.forEach((taskIndex: number) => {
      let taskEntry = critialTasks.get(taskIndex);
      if (taskEntry === undefined) {
        taskEntry = {
          taskIndex: taskIndex,
          duration: chart.Vertices[taskIndex].duration,
          numTimesAppeared: 0,
        };
        critialTasks.set(taskIndex, taskEntry);
      }
      taskEntry.numTimesAppeared += value.count;
    });
  });

  return [...critialTasks.values()].sort(
    (a: CriticalPathTaskEntry, b: CriticalPathTaskEntry): number => {
      return b.duration - a.duration;
    }
  );
};
