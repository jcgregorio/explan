import { Result, ok, error } from "../result.ts";
import { Task, Chart, ChartValidate } from "../chart/chart.ts";
import { DirectedEdge, edgesBySrcAndDstToMap } from "../dag/dag.ts";
import { Rounder, TaskDuration } from "../types/types.ts";

/** Span represents when a task will be done, i.e. it contains the time the task
 * is expected to begin and end. */
export class Span {
  start: number;
  finish: number;

  constructor(start: number = 0, finish: number = 0) {
    this.start = start;
    this.finish = finish;
  }
}

/** The standard slack calculation values. */
export class Slack {
  early: Span = new Span();
  late: Span = new Span();
  slack: number = 0;
}

export type SlackResult = Result<Slack[]>;

export type SlackEarlyStartOverride = (taskID: string) => number | undefined;

// Calculate the slack for each Task in the Chart.
export function ComputeSlack(
  c: Chart,
  taskDuration: TaskDuration | null = null,
  round: Rounder,
  override: SlackEarlyStartOverride | null = null
): SlackResult {
  if (taskDuration === null) {
    taskDuration = (taskIndex: number) => c.Vertices[taskIndex].duration;
  }

  // Create a Slack for each Task.
  const slacks: Slack[] = new Array(c.Vertices.length);
  for (let i = 0; i < c.Vertices.length; i++) {
    slacks[i] = new Slack();
  }

  const r = ChartValidate(c, taskDuration);
  if (!r.ok) {
    return error(r.error);
  }

  const edges = edgesBySrcAndDstToMap(c.Edges);

  const topologicalOrder = r.value;

  // First go forward through the topological sort and find the early start for
  // each task, which is the max of all the predecessors early finish values.
  // Since we know the duration we can also compute the early finish.
  topologicalOrder.slice(1).forEach((vertexIndex: number) => {
    const task = c.Vertices[vertexIndex];
    const slack = slacks[vertexIndex];
    slack.early.start = Math.max(
      ...edges.byDst.get(vertexIndex)!.map((e: DirectedEdge): number => {
        const predecessorSlack = slacks[e.i];
        return predecessorSlack.early.finish;
      })
    );
    const overrideValue = override?.(task.id);
    if (overrideValue !== undefined) {
      slack.early.start = overrideValue;
    }
    slack.early.finish = round(slack.early.start + taskDuration(vertexIndex));
  });

  // Now backwards through the topological sort and find the late finish of each
  // task, which is the min of all the successor tasks late starts. Again since
  // we know the duration we can also compute the late start. Finally, since we
  // now have all the early/late and start/finish values we can now calcuate the
  // slack.
  topologicalOrder.reverse().forEach((vertexIndex: number) => {
    const task = c.Vertices[vertexIndex];
    const slack = slacks[vertexIndex];
    const successors = edges.bySrc.get(vertexIndex);
    if (!successors) {
      slack.late.finish = slack.early.finish;
      slack.late.start = slack.early.start;
    } else {
      const overrideValue = override?.(task.id);
      if (overrideValue !== undefined) {
        // Since this task has been started, we set late
        // start/finish to early start/finish.
        slack.late = slack.early;
        slack.slack = 0;
      } else {
        const lateStarts = edges.bySrc
          .get(vertexIndex)!
          .map((e: DirectedEdge): number | null => {
            // Need to ignore values from started tasks?
            if (override?.(c.Vertices[e.j].id) !== undefined) {
              return null;
            }

            const successorSlack = slacks[e.j];
            return successorSlack.late.start;
          })
          .filter((value) => value !== null);
        if (lateStarts.length === 0) {
          slack.late.finish = slack.early.finish;
        } else {
          slack.late.finish = Math.min(...lateStarts);
        }
        slack.late.start = round(slack.late.finish - taskDuration(vertexIndex));
        slack.slack = round(slack.late.finish - slack.early.finish);
      }
    }
  });

  return ok(slacks);
}

export const CriticalPath = (slacks: Slack[], round: Rounder): number[] => {
  const ret: number[] = [];
  slacks.forEach((slack: Slack, index: number) => {
    if (
      round(slack.late.finish - slack.early.finish) < Number.EPSILON &&
      round(slack.early.finish - slack.early.start) > Number.EPSILON
    ) {
      ret.push(index);
    }
  });
  return ret;
};
