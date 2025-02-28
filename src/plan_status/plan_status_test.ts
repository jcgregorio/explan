import { assert } from "@esm-bundle/chai";
import {
  fromJSON,
  PlanStatus,
  PlanStatusSerialized,
  toJSON,
} from "./plan_status";

describe("PlanStatus", () => {
  const roundTrips = (p: PlanStatus) => {
    assert.deepEqual(fromJSON(toJSON(p)), p);
  };

  it("serialized to/from JSON", () => {
    roundTrips({ stage: "unstarted" });
    roundTrips({ stage: "started", start: new Date() });
  });

  it("handles malformed JSON", () => {
    const unstarted: PlanStatus = { stage: "unstarted" };
    assert.deepEqual(fromJSON({} as PlanStatusSerialized), unstarted);
    assert.deepEqual(
      fromJSON({ stage: "started" } as PlanStatusSerialized),
      unstarted
    );
  });
});
