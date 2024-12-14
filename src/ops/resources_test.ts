import { assert } from "@esm-bundle/chai";
import { Task } from "../chart/chart.ts";
import { Plan, StaticResourceDefinitions } from "../plan/plan.ts";
import {
  AddResourceOp,
  AddResourceOptionOp,
  DeleteResourceOp,
  DeleteResourceOptionOp,
  MoveResourceOptionOp,
  RenameResourceOp,
  RenameResourceOptionOp,
  SetResourceValueOp,
} from "../ops/resources.ts";
import { applyAllOpsToPlan } from "./ops.ts";
import { T2Op, TOp, TestOpsForwardAndBack } from "./opstestutil.ts";
import { ResourceDefinition } from "../resources/resources.ts";

describe("SetResourceValueOp", () => {
  it("Fails if the key is not a valid resource.", () => {
    const res = SetResourceValueOp("unknown resource", "foo", 1).applyTo(
      new Plan()
    );
    assert.isFalse(res.ok);
    assert.include(res.error.message, "does not exist as a Resource");
  });

  it("Creates a valid inverse.", () => {
    TestOpsForwardAndBack([
      AddResourceOp("Who"),
      AddResourceOptionOp("Who", "Fred"),
      AddResourceOptionOp("Who", "Barney"),
      T2Op((plan: Plan) => {
        assert.equal(plan.chart.Vertices[1].getResource("Who"), "");
      }),
      SetResourceValueOp("Who", "Barney", 1),
      TOp((plan: Plan) => {
        assert.equal(plan.chart.Vertices[1].getResource("Who"), "Barney");
      }),
    ]);
  });
});

describe("AddResourceOp/DeleteResourceOp", () => {
  it("AddResourceOp adds a new resource to a Plan", () => {
    TestOpsForwardAndBack([
      T2Op((plan: Plan) => {
        // Confirm "Who" isn't defined as a resource.
        plan.chart.Vertices.forEach((task: Task) => {
          assert.equal(task.getResource("Who"), undefined);
        });
      }),
      AddResourceOp("Who"),
      TOp((plan: Plan) => {
        assert.deepEqual(plan.resourceDefinitions, {
          Uncertainty: StaticResourceDefinitions.Uncertainty,
          Who: {
            values: [""],
            isStatic: false,
          } as ResourceDefinition,
        });

        // Confirm each task was updated.
        plan.chart.Vertices.forEach((task: Task) => {
          assert.equal(task.getResource("Who"), "");
        });
      }),
    ]);
  });

  it("DeleteResourceOp fails if the Resource doesn't exist", () => {
    const plan = new Plan();

    const res = DeleteResourceOp("Who").applyTo(plan);
    assert.isFalse(res.ok);
    assert.isTrue(
      res.error.message.includes(
        "The resource with name Who does not exist and can't be deleted."
      )
    );
  });

  it("AddResourceOp fails if the Resource already exists", () => {
    const plan = new Plan();

    // First application should succeed.
    let res = AddResourceOp("Who").applyTo(plan);
    assert.isTrue(res.ok);

    // Second addition should fail.
    res = AddResourceOp("Who").applyTo(res.value.plan);
    assert.isFalse(res.ok);
    assert.isTrue(res.error.message.includes("Who already exists"));
  });
});

describe("AddResourceOptionOp/DeleteResourceOptionOp", () => {
  const init = (): Plan => {
    const plan = new Plan();

    const res = AddResourceOp("Who").applyTo(plan);
    assert.isTrue(res.ok);
    return res.value.plan;
  };

  it("AddResourceOptionOp adds a new resource value to a Plan", () => {
    TestOpsForwardAndBack([
      AddResourceOp("Who"),
      T2Op((plan: Plan, isForward: boolean) => {
        if (isForward) {
          assert.deepEqual(plan.resourceDefinitions, {
            Uncertainty: StaticResourceDefinitions.Uncertainty,
            Who: {
              values: [""],
              isStatic: false,
            } as ResourceDefinition,
          });

          // Confirm that in both forward and back direction the task value for
          // the resource is correct.
          assert.equal(plan.chart.Vertices[0].getResource("Who"), "");
        }
      }),
      AddResourceOptionOp("Who", "Fred"),
      T2Op((plan: Plan, isForward: boolean) => {
        if (isForward) {
          assert.deepEqual(plan.resourceDefinitions, {
            Uncertainty: StaticResourceDefinitions.Uncertainty,
            Who: {
              values: ["", "Fred"],
              isStatic: false,
            } as ResourceDefinition,
          });

          // Check that the task resource values remain unchanged.
          plan.chart.Vertices.forEach((task: Task) => {
            assert.equal(task.getResource("Who"), "");
          });

          // Change the value of one Tasks resources to a non-default value.
          plan.chart.Vertices[0].setResource("Who", "Fred");
        }
      }),
    ]);
  });

  it("AddResourceOptionOp fails if a Resource with the given key doesn't exists.", () => {
    const plan = init();
    const res = AddResourceOptionOp("Unknown Resource Key", "Fred").applyTo(
      plan
    );
    assert.isFalse(res.ok);
    assert.isTrue(
      res.error.message.includes(
        "Unknown Resource Key doesn't exist as a Resource"
      )
    );
  });

  it("AddResourceOptionOp fails if a Resource with the given key already has the given value.", () => {
    const plan = init();
    const res = AddResourceOptionOp("Who", "").applyTo(plan);
    assert.isFalse(res.ok);
    assert.isTrue(
      res.error.message.includes("already exists as a value in the Resource")
    );
  });

  it("DeleteResourceOptionOp fails if a Resource with the given key doesn't exist.", () => {
    const plan = init();
    const res = DeleteResourceOptionOp("Unknown Resource Key", "Fred").applyTo(
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
    const res = DeleteResourceOptionOp("Who", "Unknown Value").applyTo(plan);
    assert.isFalse(res.ok);
    assert.isTrue(
      res.error.message.includes("does not exist as a value in the Resource")
    );
  });

  it("DeleteResourceOptionOp fails if the op would leave the Resource with no values.", () => {
    const plan = init();
    const res = DeleteResourceOptionOp("Who", "").applyTo(plan);
    assert.isFalse(res.ok);
    assert.isTrue(
      res.error.message.includes("Resources must have at least one value.")
    );
  });

  it("DeleteResourceOptionOp forces task resource values back to the default", () => {
    TestOpsForwardAndBack([
      AddResourceOp("Who"),
      AddResourceOptionOp("Who", "Fred"),
      AddResourceOptionOp("Who", "Barney"),
      T2Op((plan: Plan) => {
        assert.equal(plan.chart.Vertices[1].getResource("Who"), "");
      }),
      SetResourceValueOp("Who", "Barney", 1),
      T2Op((plan: Plan) => {
        // Check forward and back have the resource set to "Barney".
        assert.equal(plan.chart.Vertices[1].getResource("Who"), "Barney");
      }),
      DeleteResourceOptionOp("Who", "Barney"),
      TOp((plan: Plan) => {
        // Since Barney was deleted it should go back to the default.
        assert.equal(plan.chart.Vertices[1].getResource("Who"), "");
      }),
    ]);
  });
});

describe("RenameResourceOp", () => {
  const init = (): Plan => {
    const plan = new Plan();

    let res = AddResourceOp("Who").applyTo(plan);
    assert.isTrue(res.ok);
    res = AddResourceOptionOp("Who", "Fred").applyTo(res.value.plan);
    assert.isTrue(res.ok);
    res = AddResourceOptionOp("Who", "Barney").applyTo(res.value.plan);
    assert.isTrue(res.ok);
    return res.value.plan;
  };

  it("Can change the name of a resource both in the definition and in tasks.", () => {
    TestOpsForwardAndBack([
      AddResourceOp("Who"),
      AddResourceOptionOp("Who", "Fred"),
      AddResourceOptionOp("Who", "Barney"),
      T2Op((plan: Plan) => {
        assert.deepEqual(plan.resourceDefinitions, {
          Uncertainty: StaticResourceDefinitions.Uncertainty,
          Who: {
            values: ["", "Fred", "Barney"],
            isStatic: false,
          } as ResourceDefinition,
        });

        assert.equal(plan.chart.Vertices[1].getResource("Who"), "");
      }),
      SetResourceValueOp("Who", "Fred", 1),
      T2Op((plan: Plan) => {
        // Check forward and back have the resource set to "Barney".
        assert.equal(plan.chart.Vertices[1].getResource("Who"), "Fred");
      }),
      RenameResourceOp("Who", "Person"),
      TOp((plan: Plan) => {
        // Task resources should be updated to match.
        assert.equal(plan.chart.Vertices[1].getResource("Person"), "Fred");
      }),
    ]);
  });

  it("Fails if the new resource name already exist.", () => {
    const plan = init();

    let res = AddResourceOp("Person").applyTo(plan);
    assert.isTrue(res.ok);
    res = RenameResourceOp("Who", "Person").applyTo(res.value.plan);
    assert.isFalse(res.ok);
  });

  it("Fails if the old resource doesn't exist.", () => {
    const plan = init();

    const res = RenameResourceOp(
      "Unknown Resource Name",
      "New Unknown Resource Name"
    ).applyTo(plan);
    assert.isFalse(res.ok);
  });
});

describe("RenameResourceOptionOp", () => {
  const init = (): Plan => {
    const plan = new Plan();

    const res = applyAllOpsToPlan(
      [
        AddResourceOp("Who"),
        AddResourceOptionOp("Who", "Fred"),
        AddResourceOptionOp("Who", "Barney"),
      ],
      plan
    );

    assert.isTrue(res.ok);
    return res.value.plan;
  };

  it("Can change the value of a resource both in the definition and in tasks.", () => {
    TestOpsForwardAndBack([
      AddResourceOp("Who"),
      AddResourceOptionOp("Who", "Fred"),
      AddResourceOptionOp("Who", "Barney"),
      T2Op((plan: Plan) => {
        assert.deepEqual(plan.resourceDefinitions, {
          Uncertainty: StaticResourceDefinitions.Uncertainty,
          Who: {
            values: ["", "Fred", "Barney"],
            isStatic: false,
          } as ResourceDefinition,
        });

        assert.equal(plan.chart.Vertices[1].getResource("Who"), "");
      }),
      SetResourceValueOp("Who", "Fred", 1),
      T2Op((plan: Plan) => {
        // Check forward and back have the resource set to "Barney".
        assert.equal(plan.chart.Vertices[1].getResource("Who"), "Fred");
      }),
      RenameResourceOptionOp("Who", "Fred", "Wilma"),
      TOp((plan: Plan) => {
        // Task resources should be updated to match.
        assert.equal(plan.chart.Vertices[1].getResource("Who"), "Wilma");
      }),
    ]);
  });

  it("Fails if the oldValue doesn't exist.", () => {
    const plan = init();
    const res = RenameResourceOptionOp("Who", "Unknown Value", "Wilma").applyTo(
      plan
    );
    assert.isFalse(res.ok);
  });

  it("Fails if the newValue does exist.", () => {
    const plan = init();

    // This should fail because "Barney" is already a value, and we can't have
    // duplicate values.
    const res = RenameResourceOptionOp("Who", "Fred", "Barney").applyTo(plan);
    assert.isFalse(res.ok);
  });
});

describe("MoveResourceOptionSubOp", () => {
  const init = (): Plan => {
    const plan = new Plan();

    const res = applyAllOpsToPlan(
      [
        AddResourceOp("Who"),
        AddResourceOptionOp("Who", "Fred"),
        AddResourceOptionOp("Who", "Barney"),
      ],
      plan
    );
    assert.isTrue(res.ok);

    return res.value.plan;
  };

  it("Can change the order of resource values in the definition.", () => {
    TestOpsForwardAndBack([
      AddResourceOp("Who"),
      AddResourceOptionOp("Who", "Fred"),
      AddResourceOptionOp("Who", "Barney"),
      T2Op((plan: Plan) => {
        assert.deepEqual(plan.resourceDefinitions, {
          Uncertainty: StaticResourceDefinitions.Uncertainty,
          Who: {
            values: ["", "Fred", "Barney"],
            isStatic: false,
          } as ResourceDefinition,
        });
      }),
      MoveResourceOptionOp("Who", 1, 2),
      TOp((plan: Plan) => {
        assert.deepEqual(plan.resourceDefinitions, {
          Uncertainty: StaticResourceDefinitions.Uncertainty,
          Who: {
            values: ["", "Barney", "Fred"],
            isStatic: false,
          } as ResourceDefinition,
        });
      }),
    ]);
  });

  it("Fails if either index exceeds the length of the array of resource values.", () => {
    const plan = init();

    let res = MoveResourceOptionOp("Who", 1, 5).applyTo(plan);
    assert.isFalse(res.ok);
    assert.equal("Who does not have a value at index 5", res.error.message);
    res = MoveResourceOptionOp("Who", 7, 1).applyTo(plan);
    assert.isFalse(res.ok);
    assert.equal("Who does not have a value at index 7", res.error.message);
  });
});
