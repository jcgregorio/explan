import { assert } from "@esm-bundle/chai";
import { Chart } from "../chart/chart";
import { Plan } from "../plan/plan";
import {
  AddResourceOp,
  AddResourceOptionOp,
  DeleteResourceOp,
  DeleteResourceOptionOp,
} from "../ops/resources";

describe("AddResourceOp/DeleteResourceOp", () => {
  it("AddResourceOp adds a new resource to a Plan", () => {
    const plan = new Plan(new Chart());

    const op = AddResourceOp("Who");
    let res = op.apply(plan);
    assert.isTrue(res.ok);
    assert.deepEqual(res.value.resourceDefinitions, [
      {
        key: "Who",
        values: [""],
      },
    ]);

    // Now show the inverse also works.
    res = op.inverse().apply(res.value);
    assert.isTrue(res.ok);
    assert.equal(res.value.resourceDefinitions.length, 0);
  });

  it("DeleteResourceOp fails if the Resource doesn't exist", () => {
    const plan = new Plan(new Chart());

    const res = DeleteResourceOp("Who").apply(plan);
    assert.isFalse(res.ok);
    assert.isTrue(
      res.error.message.includes(
        "The resource with name Who does not exist and can't be deleted."
      )
    );
  });

  it("AddResourceOp fails if the Resource already exists", () => {
    const plan = new Plan(new Chart());

    // First application should succeed.
    let res = AddResourceOp("Who").apply(plan);
    assert.isTrue(res.ok);

    // Second addition should fail.
    res = AddResourceOp("Who").apply(res.value);
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("Who already exists"));
  });
});

describe("AddResourceOptionOp/DeleteResourceOptionOp", () => {
  const init = (): Plan => {
    const plan = new Plan(new Chart());

    const res = AddResourceOp("Who").apply(plan);
    assert.isTrue(res.ok);
    return res.value;
  };

  it("AddResourceOptionOp adds a new resource value to a Plan", () => {
    const plan = init();
    const op = AddResourceOptionOp("Who", "Fred");
    let res = op.apply(plan);
    assert.isTrue(res.ok);

    assert.deepEqual(res.value.resourceDefinitions, [
      {
        key: "Who",
        values: ["", "Fred"],
      },
    ]);

    // Now Show the inverse also works.
    res = op.inverse().apply(res.value);
    assert.isTrue(res.ok);
    assert.deepEqual(res.value.resourceDefinitions, [
      {
        key: "Who",
        values: [""],
      },
    ]);
  });

  it("AddResourceOptionOp fails if a Resource with the given key doesn't exists.", () => {
    const plan = init();
    const res = AddResourceOptionOp("Unknown Resource Key", "Fred").apply(plan);
    assert.isFalse(res.ok);
    assert.isTrue(
      res.error.message.includes(
        "Unknown Resource Key doesn't exist as a Resource"
      )
    );
  });

  it("AddResourceOptionOp fails if a Resource with the given key already has the given value.", () => {
    const plan = init();
    const res = AddResourceOptionOp("Who", "").apply(plan);
    assert.isFalse(res.ok);
    assert.isTrue(
      res.error.message.includes("already exists as a value in the Resource")
    );
  });

  it("DeleteResourceOptionOp fails if a Resource with the given key doesn't exist.", () => {
    const plan = init();
    const res = DeleteResourceOptionOp("Unknown Resource Key", "Fred").apply(
      plan
    );
    assert.isFalse(res.ok);
    assert.isTrue(
      res.error.message.includes(
        "Unknown Resource Key doesn't exist as a Resource"
      )
    );
  });

  it("DeleteResourceOptionOp fails if a Resource with the given key doesn't have the value.", () => {
    const plan = init();
    const res = DeleteResourceOptionOp("Who", "Unknown Value").apply(plan);
    assert.isFalse(res.ok);
    assert.isTrue(
      res.error.message.includes("does not exist as a value in the Resource")
    );
  });

  it("DeleteResourceOptionOp fails if the op would leave the Resource with no values.", () => {
    const plan = init();
    const res = DeleteResourceOptionOp("Who", "").apply(plan);
    assert.isFalse(res.ok);
    assert.isTrue(
      res.error.message.includes("Resources must have at least one value.")
    );
  });
});
