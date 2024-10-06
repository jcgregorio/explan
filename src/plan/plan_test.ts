import { assert } from "@esm-bundle/chai";
import { Plan, PlanSerialized } from "./plan";

describe("Plan", () => {
  it("Round trips via JSON", () => {
    const plan = new Plan();
    const serialized = JSON.stringify(plan, null, "  ");
    const deserialized = new Plan().fromJSON(
      JSON.parse(serialized) as PlanSerialized
    );
    assert.equal(serialized, JSON.stringify(deserialized, null, "  "));
  });
});
