import { assert } from "@esm-bundle/chai";
import { Plan } from "./plan";
import {
  AddResourceOp,
  AddResourceOptionOp,
  SetResourceValueOp,
} from "../ops/resources";
import { Op, applyAllOpsToPlan } from "../ops/ops";
import { SetMetricValueOp } from "../ops/metrics";
import { InsertNewEmptyTaskAfterOp, SetTaskNameOp } from "../ops/chart";

describe("Plan", () => {
  it("Round trips via JSON", () => {
    const plan = new Plan();
    const actual = Plan.fromJSON(plan.toJSON());
    assert.deepEqual(actual, plan);
  });

  it("Round trips via JSON", () => {
    const plan = new Plan();
    const serialized = JSON.stringify(plan, null, "  ");
    const deserializedResult = Plan.FromJSONText(serialized);
    assert.isTrue(deserializedResult.ok);
    const deserialized = deserializedResult.value;
    assert.equal(serialized, JSON.stringify(deserialized, null, "  "));
  });

  it("Round trips via JSON with Tasks and Edges", () => {
    // Create a Plan with a task and resource and metric to confirm that they
    // all roundtrip correctly.
    const people: string[] = ["Fred", "Barney", "Wilma", "Betty"];
    const ops: Op[] = [AddResourceOp("Person")];
    people.forEach((person: string) => {
      ops.push(AddResourceOptionOp("Person", person));
    });

    ops.push(
      InsertNewEmptyTaskAfterOp(0),
      SetMetricValueOp("Duration", 10, 1),
      SetTaskNameOp(1, "MyFirstTask"),
      SetResourceValueOp("Person", people[1], 1),
      SetResourceValueOp("Uncertainty", "moderate", 1)
    );

    const ret = applyAllOpsToPlan(ops, new Plan());
    assert.isTrue(ret.ok);
    const plan = ret.value.plan;

    // Now serialize it.
    const serialized = JSON.stringify(plan, null, "  ");

    // Now reconstitute from that serialization.
    const deserializedResult = Plan.FromJSONText(serialized);
    assert.isTrue(deserializedResult.ok);
    const deserialized = deserializedResult.value;

    // Confirm they are equivalent.
    assert.equal(serialized, JSON.stringify(deserialized, null, "  "));
    assert.equal(deserialized.chart.Vertices[1].name, "MyFirstTask");
    assert.equal(deserialized.chart.Vertices[1].getMetric("Duration"), 10);
    assert.equal(
      deserialized.chart.Vertices[1].getResource("Person"),
      people[1]
    );
    assert.equal(
      deserialized.chart.Vertices[1].getResource("Uncertainty"),
      "moderate"
    );
  });
});
