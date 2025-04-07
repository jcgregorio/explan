import { assert } from "@esm-bundle/chai";
import {
  fromJSON,
  PlanStatus,
  PlanStatusSerialized,
  toJSON,
} from "./plan_status";
import {
  parseDateString,
  todayAsUTC,
} from "../date-control-utils/date-control-utils";

describe("PlanStatus", () => {
  const roundTrips = (p: PlanStatus) => {
    assert.deepEqual(fromJSON(toJSON(p)), p);
  };

  it("serialized to/from JSON", () => {
    roundTrips({ stage: "unstarted", start: 0 });
    roundTrips({ stage: "started", start: todayAsUTC().getTime() });
  });

  it("handles malformed JSON", () => {
    const unstarted: PlanStatus = { stage: "unstarted", start: 0 };
    assert.deepEqual(fromJSON({} as PlanStatusSerialized), unstarted);
    assert.deepEqual(
      fromJSON({ stage: "started" } as PlanStatusSerialized),
      unstarted,
    );
  });

  it("produces expected serialization", () => {
    const ret = parseDateString("2025-01-22");
    assert.isTrue(ret.ok);
    assert.deepEqual(
      toJSON({
        stage: "started",
        start: ret.value.getTime(),
      }),
      {
        stage: "started",
        start: "2025-01-22",
      },
    );
  });
});
