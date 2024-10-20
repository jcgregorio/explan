import { Result, ok, error } from "../result.ts";
import { Task, Chart, ChartValidate } from "../chart/chart.ts";
import { DirectedEdge, edgesBySrcAndDstToMap } from "../dag/dag.ts";

/** Type for a function that does rounding. */
export type Rounder = (x: number) => number;

/** Span represents when a task will be done, i.e. it contains the time the task
 * is expected to begin and end. */
export class Span {
  start: number = 0;
  finish: number = 0;
}

/** The standard slack calculation values. */
export class Slack {
  early: Span = new Span();
  late: Span = new Span();
  slack: number = 0;
}

const roundSpan = (span: Span, round: Rounder) => {
  span.start = round(span.start);
  span.finish = round(span.finish);
};

const roundSlack = (slack: Slack, round: Rounder) => {
  slack.slack = round(slack.slack);
  roundSpan(slack.early, round);
  roundSpan(slack.late, round);
};

export type TaskDuration = (t: Task, taskIndex: number) => number;

export const defaultTaskDuration = (t: Task): number => {
  return t.duration;
};

export type SlackResult = Result<Slack[]>;

// Calculate the slack for each Task in the Chart.
export function ComputeSlack(
  c: Chart,
  taskDuration: TaskDuration = defaultTaskDuration,
  round: Rounder
): SlackResult {
  // Create a Slack for each Task.
  const slacks: Slack[] = [];
  for (let i = 0; i < c.Vertices.length; i++) {
    slacks.push(new Slack());
  }

  const r = ChartValidate(c);
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
    slack.early.finish = round(
      slack.early.start + taskDuration(task, vertexIndex)
    );
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
      slack.late.finish = Math.min(
        ...edges.bySrc.get(vertexIndex)!.map((e: DirectedEdge): number => {
          const successorSlack = slacks[e.j];
          return successorSlack.late.start;
        })
      );
      slack.late.start = round(
        slack.late.finish - taskDuration(task, vertexIndex)
      );
      roundSpan(slack.late, round);
      roundSpan(slack.early, round);
      slack.slack = round(slack.late.finish - slack.early.finish);
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
