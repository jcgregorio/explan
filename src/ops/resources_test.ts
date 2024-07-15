import { assert } from "@esm-bundle/chai";
import { Chart, Task } from "../chart/chart";
import { Plan } from "../plan/plan";
import {
  AddResourceOp,
  AddResourceOptionOp,
  DeleteResourceOp,
  DeleteResourceOptionOp,
  MoveResourceOptionOp,
  RenameResourceOptionOp,
} from "../ops/resources";

describe("AddResourceOp/DeleteResourceOp", () => {
  it("AddResourceOp adds a new resource to a Plan", () => {
    const plan = new Plan(new Chart());

    const op = AddResourceOp("Who");
    let res = op.apply(plan);
    assert.isTrue(res.ok);
    assert.deepEqual(res.value.plan.resourceDefinitions, [
      {
        key: "Who",
        values: [""],
      },
    ]);

    // Confirm each task was updated.
    res.value.plan.chart.Vertices.forEach((task: Task) => {
      assert.equal(task.resources["Who"], "");
    });

    // Now show the inverse also works.
    res = res.value.inverse.apply(res.value.plan);
    assert.isTrue(res.ok);
    assert.equal(res.value.plan.resourceDefinitions.length, 0);

    // Confirm each task was updated.
    res.value.plan.chart.Vertices.forEach((task: Task) => {
      assert.equal(task.resources["Who"], undefined);
    });
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
    res = AddResourceOp("Who").apply(res.value.plan);
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("Who already exists"));
  });
});

describe("AddResourceOptionOp/DeleteResourceOptionOp", () => {
  const init = (): Plan => {
    const plan = new Plan(new Chart());

    const res = AddResourceOp("Who").apply(plan);
    assert.isTrue(res.ok);
    return res.value.plan;
  };

  it("AddResourceOptionOp adds a new resource value to a Plan", () => {
    const plan = init();
    let res = AddResourceOptionOp("Who", "Fred").apply(plan);
    assert.isTrue(res.ok);

    assert.deepEqual(res.value.plan.resourceDefinitions, [
      {
        key: "Who",
        values: ["", "Fred"],
      },
    ]);

    // Check that the task resource values remain unchanged.
    res.value.plan.chart.Vertices.forEach((task: Task) => {
      assert.equal(task.resources["Who"], "");
    });

    // Change the value of one Tasks resources to a non-default value.
    res.value.plan.chart.Vertices[0].resources["Who"] = "Fred";

    // Now show the inverse also works, i.e. we can remove "Barney" from the
    // definition and all the tasks will be updated to make sense.
    res = res.value.inverse.apply(res.value.plan);
    assert.isTrue(res.ok);
    assert.deepEqual(res.value.plan.resourceDefinitions, [
      {
        key: "Who",
        values: [""],
      },
    ]);

    assert.equal(res.value.plan.chart.Vertices[0].resources["Who"], "");

    // And finally, show that the revert of the revert changes the task resource
    // value back to "Fred".
    res = res.value.inverse.apply(res.value.plan);
    assert.isTrue(res.ok);
    assert.deepEqual(res.value.plan.resourceDefinitions, [
      {
        key: "Who",
        values: ["", "Fred"],
      },
    ]);
    assert.equal(res.value.plan.chart.Vertices[0].resources["Who"], "Fred");
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

describe("ReplaceResourceOptionSubOp", () => {
  const init = (): Plan => {
    const plan = new Plan(new Chart());

    let res = AddResourceOp("Who").apply(plan);
    assert.isTrue(res.ok);
    res = AddResourceOptionOp("Who", "Fred").apply(res.value.plan);
    assert.isTrue(res.ok);
    res = AddResourceOptionOp("Who", "Barney").apply(res.value.plan);
    assert.isTrue(res.ok);
    return res.value.plan;
  };

  it("Can change the value of a resource both in the definition and in tasks.", () => {
    const plan = init();

    assert.deepEqual(plan.resourceDefinitions, [
      {
        key: "Who",
        values: ["", "Fred", "Barney"],
      },
    ]);

    // Set a Task resource value to a non-default value:
    plan.chart.Vertices[0].resources["Who"] = "Fred";

    // Replace "Fred" with "Wilma" everywhere.
    let res = RenameResourceOptionOp("Who", "Fred", "Wilma").apply(plan);
    assert.isTrue(res.ok);
    assert.deepEqual(res.value.plan.resourceDefinitions, [
      {
        key: "Who",
        values: ["", "Wilma", "Barney"],
      },
    ]);
    assert.equal(plan.chart.Vertices[0].resources["Who"], "Wilma");

    // Now confirm the inverse Op restores the old value in both the definition and in the tasks.
    res = res.value.inverse.apply(res.value.plan);
    assert.isTrue(res.ok);
    assert.deepEqual(res.value.plan.resourceDefinitions, [
      {
        key: "Who",
        values: ["", "Fred", "Barney"],
      },
    ]);
    assert.equal(plan.chart.Vertices[0].resources["Who"], "Fred");
  });

  it("Fails if the oldValue doesn't exist.", () => {
    const plan = init();

    assert.deepEqual(plan.resourceDefinitions, [
      {
        key: "Who",
        values: ["", "Fred", "Barney"],
      },
    ]);

    const res = RenameResourceOptionOp("Who", "Unknown Value", "Wilma").apply(
      plan
    );
    assert.isFalse(res.ok);
  });

  it("Fails if the newValue does exist.", () => {
    const plan = init();

    assert.deepEqual(plan.resourceDefinitions, [
      {
        key: "Who",
        values: ["", "Fred", "Barney"],
      },
    ]);

    // This should fail because "Barney" is already a value, and we can't have
    // duplicate values.
    const res = RenameResourceOptionOp("Who", "Fred", "Barney").apply(plan);
    assert.isFalse(res.ok);
  });
});

describe("MoveResourceOptionSubOp", () => {
  const init = (): Plan => {
    const plan = new Plan(new Chart());

    let res = AddResourceOp("Who").apply(plan);
    assert.isTrue(res.ok);
    res = AddResourceOptionOp("Who", "Fred").apply(res.value.plan);
    assert.isTrue(res.ok);
    res = AddResourceOptionOp("Who", "Barney").apply(res.value.plan);
    assert.isTrue(res.ok);
    return res.value.plan;
  };

  it("Can change the order of resource values in the definition.", () => {
    const plan = init();

    let res = MoveResourceOptionOp("Who", 1, 2).apply(plan);
    assert.isTrue(res.ok);
    assert.deepEqual(res.value.plan.resourceDefinitions, [
      {
        key: "Who",
        values: ["", "Barney", "Fred"],
      },
    ]);

    // Confirm the inverse op restores the old resource value order.
    res = res.value.inverse.apply(plan);
    assert.isTrue(res.ok);
    assert.deepEqual(res.value.plan.resourceDefinitions, [
      {
        key: "Who",
        values: ["", "Fred", "Barney"],
      },
    ]);
  });

  it("Fails if either index exceeds the length of the array of resource values.", () => {
    const plan = init();

    let res = MoveResourceOptionOp("Who", 1, 5).apply(plan);
    assert.isFalse(res.ok);
    assert.equal("Who does not have a value at index 5", res.error.message);
    res = MoveResourceOptionOp("Who", 7, 1).apply(plan);
    assert.isFalse(res.ok);
    assert.equal("Who does not have a value at index 7", res.error.message);
  });
});
