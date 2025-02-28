import { assert } from "@esm-bundle/chai";
import {
  fromJSON,
  TaskCompletion,
  TaskCompletionSerialized,
  toJSON,
} from "./task_completion";
import { Span } from "../slack/slack";

describe("TaskCompletion", () => {
  const roundTrips = (t: TaskCompletion) => {
    assert.deepEqual(fromJSON(toJSON(t)), t);
  };

  it("serializes to/from JSON correctly", () => {
    roundTrips({
      stage: "unstarted",
    });
    roundTrips({
      stage: "started",
      start: 12,
    });
    roundTrips({
      stage: "finished",
      span: new Span(10, 20),
    });
  });

  it("handles malformed JSON inputs", () => {
    const unstarted: TaskCompletion = { stage: "unstarted" };
    assert.deepEqual(
      fromJSON({
        bloop: "not a valid serialization",
      } as any as TaskCompletionSerialized),
      unstarted
    );

    assert.deepEqual(
      fromJSON({
        stage: "started",
      } as any as TaskCompletionSerialized),
      unstarted
    );

    assert.deepEqual(
      fromJSON({
        stage: "finished",
      } as any as TaskCompletionSerialized),
      unstarted
    );
  });
});
