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
import {
  TaskCompletion,
  taskUnstarted,
} from "../task_completion/task_completion";
import { unstarted } from "../plan_status/plan_status";

describe("Plan", () => {
  it("Round trips via JSON", () => {
    const plan = new Plan();
    const actual = Plan.fromJSON(plan.toJSON());

    // Copy over the start in the units because it will change.
    actual.durationUnits["start"] = plan.durationUnits["start"];
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

  it("can set duration units", () => {
    const p = new Plan();
    p.status = { stage: "started", start: 0 };
    assert.equal("1/8/1970", p.durationUnits.displayTime(8, "en-US"));
    p.setDurationUnits("Weekdays");
    assert.equal("1/12/1970", p.durationUnits.displayTime(8, "en-US"));
  });

  it("can set and get task completions", () => {
    const ret = InsertNewEmptyTaskAfterOp(0).applyTo(new Plan());
    assert.isTrue(ret.ok);
    const plan = ret.value.plan;

    const completion: TaskCompletion = {
      stage: "started",
      start: 9,
      percentComplete: 10,
    };

    // Set works
    let setRet = plan.setTaskCompletion(1, completion);
    assert.isTrue(setRet.ok);

    // Get works
    let getRet = plan.getTaskCompletion(1);
    assert.isTrue(getRet.ok);

    // Set fails if out of bounds.
    setRet = plan.setTaskCompletion(4, completion);
    assert.isFalse(setRet.ok);

    // Get fails if out of bounds.
    getRet = plan.getTaskCompletion(4);
    assert.isFalse(getRet.ok);
  });

  it("get task completion for a Task that doesn't have a task completion works", () => {
    const ret = InsertNewEmptyTaskAfterOp(0).applyTo(new Plan());
    assert.isTrue(ret.ok);
    const plan = ret.value.plan;

    // Get works
    let getRet = plan.getTaskCompletion(1);
    assert.isTrue(getRet.ok);
    assert.deepEqual(getRet.value, taskUnstarted);
  });
});
