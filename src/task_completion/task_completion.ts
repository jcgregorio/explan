// This doesn't distiguish between just started, and
// finished, which would affect early.finish.
//

import { Span } from "../slack/slack";

// This can be serialized to JSON.
//
// The only way to move to 'started' is to set a non-zero
// Percent Complete.
//
// Only then can the 'start' value be edited.
//
// The only way to move to 'finished' is to set a
// Percent Complete of 100%.
export type TaskCompletion =
  | { stage: "unstarted" }
  | {
      stage: "started";
      start: number;
      percentComplete: number;
    }
  | {
      stage: "finished";
      span: Span;
    };

export type TaskCompletionSerialized = {
  stage: string;
  start: number;
  percentComplete: number;
  finish: number;
};

export const toJSON = (
  taskCompletion: TaskCompletion
): TaskCompletionSerialized => {
  const ret: TaskCompletionSerialized = {
    stage: taskCompletion.stage as string,
    start: 0,
    finish: 0,
    percentComplete: 0,
  };

  switch (taskCompletion.stage) {
    case "unstarted":
      break;
    case "started":
      ret.start = taskCompletion.start;
      ret.percentComplete = taskCompletion.percentComplete;
      break;
    case "finished":
      ret.start = taskCompletion.span.start;
      ret.finish = taskCompletion.span.finish;
      break;
    default:
      taskCompletion satisfies never;
      break;
  }
  return ret;
};

export const fromJSON = (
  taskCompletionSerialized: TaskCompletionSerialized
): TaskCompletion => {
  const unstarted: TaskCompletion = { stage: "unstarted" };
  switch (taskCompletionSerialized.stage) {
    case "unstarted":
      return {
        stage: "unstarted",
      };
    case "started":
      if (taskCompletionSerialized.start === undefined) {
        return unstarted;
      }
      return {
        stage: "started",
        start: taskCompletionSerialized.start,
        percentComplete: taskCompletionSerialized.percentComplete,
      };
    case "finished":
      if (
        taskCompletionSerialized.start === undefined ||
        taskCompletionSerialized.finish === undefined
      ) {
        return unstarted;
      }
      return {
        stage: "finished",
        span: new Span(
          taskCompletionSerialized.start,
          taskCompletionSerialized.finish
        ),
      };
    default:
      return unstarted;
  }
};
