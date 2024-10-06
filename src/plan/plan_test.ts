import { assert } from "@esm-bundle/chai";
import { FromJSON, Plan, PlanSerialized } from "./plan";
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
    const serialized = JSON.stringify(plan, null, "  ");
    const deserialized = new Plan().fromJSON(
      JSON.parse(serialized) as PlanSerialized
    );
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
    const deserializedResult = FromJSON(serialized);
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

  it("Can deserialize with Start and Finish Nodes being missing.", () => {
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

    // Now drop the edges and just keep the non-start/finish task.
    plan.chart.Edges = [];
    plan.chart.Vertices = [plan.chart.Vertices[1]];

    // Now serialize it.
    const serialized = JSON.stringify(plan, null, "  ");

    // Now reconstitute from that serialization.
    const deserializedResult = FromJSON(serialized);
    assert.isTrue(deserializedResult.ok);
    const deserialized = deserializedResult.value;

    // Confirm the deserialization works.
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
