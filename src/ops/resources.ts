import { Result, ok, error } from "../result";
import { Plan } from "../plan/plan";
import { Op, SubOp, SubOpResult } from "./ops";
import {
  DEFAULT_RESOURCE_VALUE,
  ResourceDefinition,
} from "../resources/resources";
import { Task } from "../chart/chart";

export class AddResourceSubOp implements SubOp {
  key: string;

  // Maps an index of a Task to a value for the given resource key.
  taskResourceValues: Map<number, string>;

  constructor(
    name: string,
    taskResourceValues: Map<number, string> = new Map<number, string>() // Should only be supplied by inverse actions.
  ) {
    this.key = name;
    this.taskResourceValues = taskResourceValues;
  }

  apply(plan: Plan): Result<SubOpResult> {
    const foundMatch = plan.resourceDefinitions.find(
      (value: ResourceDefinition) => value.key === this.key
    );
    if (foundMatch !== undefined) {
      return error(`${this.key} already exists as a Resource`);
    }

    plan.resourceDefinitions.push(new ResourceDefinition(this.key));

    // Now loop over every task and add this key and set it to the default, unless
    // there is matching entry in taskResourceValues, in which case we will use that value.
    plan.chart.Vertices.forEach((task: Task, index: number) => {
      task.resources[this.key] =
        this.taskResourceValues.get(index) || DEFAULT_RESOURCE_VALUE;
    });

    return ok({ plan: plan, inverse: this.inverse() });
  }

  inverse(): SubOp {
    return new DeleteResourceSupOp(this.key);
  }
}

export class DeleteResourceSupOp implements SubOp {
  key: string;

  constructor(name: string) {
    this.key = name;
  }

  apply(plan: Plan): Result<SubOpResult> {
    const index = plan.resourceDefinitions.findIndex(
      (value: ResourceDefinition) => value.key === this.key
    );
    if (index === -1) {
      return error(
        `The resource with name ${this.key} does not exist and can't be deleted.`
      );
    }

    // Remove from resource definitions.
    plan.resourceDefinitions.splice(index, 1);

    const taskIndexToDeletedResourceValue: Map<number, string> = new Map();

    // Now look at all Tasks and remove `this.key` from the resources while also
    // building up the info needed for a revert.
    plan.chart.Vertices.forEach((task: Task, index: number) => {
      const value = task.resources[this.key];
      taskIndexToDeletedResourceValue.set(index, value);
      delete task.resources[this.key];
    });

    return ok({
      plan: plan,
      inverse: this.inverse(taskIndexToDeletedResourceValue),
    });
  }

  private inverse(
    resourceValuesForDeletedResourceKey: Map<number, string>
  ): SubOp {
    return new AddResourceSubOp(this.key, resourceValuesForDeletedResourceKey);
  }
}

export class AddResourceOptionSubOp implements SubOp {
  key: string;
  value: string;
  indicesOfTasksToChange: number[] = [];

  constructor(
    key: string,
    value: string,
    indicesOfTasksToChange: number[] = [] // This should only be supplied when being constructed as a inverse operation.
  ) {
    this.key = key;
    this.value = value;
    this.indicesOfTasksToChange = indicesOfTasksToChange;
  }

  apply(plan: Plan): Result<SubOpResult> {
    const definition = plan.resourceDefinitions.find(
      (value: ResourceDefinition) => value.key === this.key
    );
    if (definition === undefined) {
      return error(`${this.key} doesn't exist as a Resource`);
    }
    const existingIndex = definition.values.findIndex(
      (value: string) => value === this.value
    );
    if (existingIndex !== -1) {
      return error(
        `${this.value} already exists as a value in the Resource ${this.key}.`
      );
    }
    definition.values.push(this.value);

    // Now look at all Tasks and set the value for the given key for all the
    // tasks listed in `indicesOfTasksToChange`.
    this.indicesOfTasksToChange.forEach((taskIndex: number) => {
      plan.chart.Vertices[taskIndex].resources[this.key] = this.value;
    });

    return ok({ plan: plan, inverse: this.inverse() });
  }

  private inverse(): SubOp {
    return new DeleteResourceOptionSubOp(
      this.key,
      this.value,
      this.indicesOfTasksToChange
    );
  }
}

export class DeleteResourceOptionSubOp implements SubOp {
  key: string;
  value: string;
  indicesOfTasksToChange: number[];

  constructor(
    key: string,
    value: string,
    indicesOfTasksToChange: number[] = []
  ) {
    this.key = key;
    this.value = value;
    this.indicesOfTasksToChange = indicesOfTasksToChange;
  }

  apply(plan: Plan): Result<SubOpResult> {
    const definition = plan.resourceDefinitions.find(
      (value: ResourceDefinition) => value.key === this.key
    );
    if (definition === undefined) {
      return error(`${this.key} doesn't exist as a Resource`);
    }
    const valueIndex = definition.values.findIndex(
      (value: string) => value === this.value
    );
    if (valueIndex === -1) {
      return error(
        `${this.value} does not exist as a value in the Resource ${this.key}.`
      );
    }
    if (definition.values.length === 1) {
      return error(
        `Resources must have at least one value. ${this.value} only has one value, so it can't be deleted. `
      );
    }

    definition.values.splice(valueIndex, 1);

    // Now iterate though all the tasks and change all tasks that have
    // "key:value" to instead be "key:default". Record which tasks got changed
    // so that we can use that information when we create the invert operation.

    const indicesOfTasksWithMatchingResourceValues: number[] = [];

    plan.chart.Vertices.forEach((task: Task, index: number) => {
      const resourceValue = task.resources[this.key];
      if (resourceValue === undefined) {
        return;
      }

      // Since the value is no longer valid we change it back to the default.
      task.resources[this.key] = definition.values[0];

      // Record which task we just changed.
      indicesOfTasksWithMatchingResourceValues.push(index);
    });

    return ok({
      plan: plan,
      inverse: this.inverse(indicesOfTasksWithMatchingResourceValues),
    });
  }

  private inverse(indicesOfTasksToChange: number[]): SubOp {
    return new AddResourceOptionSubOp(
      this.key,
      this.value,
      indicesOfTasksToChange
    );
  }
}

export class RenameResourceSubOp implements SubOp {
  oldKey: string;
  newKey: string;

  constructor(oldKey: string, newKey: string) {
    this.oldKey = oldKey;
    this.newKey = newKey;
  }

  apply(plan: Plan): Result<SubOpResult> {
    const foundMatch = plan.resourceDefinitions.find(
      (value: ResourceDefinition) => value.key === this.oldKey
    );
    if (foundMatch === undefined) {
      return error(`${this.oldKey} does not exist as a Resource`);
    }

    // Confirm the newKey is not already used.
    const indexOfNewKey = plan.resourceDefinitions.findIndex(
      (value: ResourceDefinition) => value.key === this.newKey
    );

    if (indexOfNewKey !== -1) {
      return error(`${this.newKey} already exists as a resource name.`);
    }

    foundMatch.key = this.newKey;

    // Now loop over every task and change oldKey -> newkey for the given resource key.
    plan.chart.Vertices.forEach((task: Task) => {
      const currentValue = task.resources[this.oldKey];
      task.resources[this.newKey] = currentValue;
      delete task.resources[this.oldKey];
    });

    return ok({ plan: plan, inverse: this.inverse() });
  }

  inverse(): SubOp {
    return new RenameResourceSubOp(this.newKey, this.oldKey);
  }
}

export class RenameResourceOptionSubOp implements SubOp {
  key: string;
  oldValue: string;
  newValue: string;

  constructor(key: string, oldValue: string, newValue: string) {
    this.key = key;
    this.oldValue = oldValue;
    this.newValue = newValue;
  }

  apply(plan: Plan): Result<SubOpResult> {
    const foundMatch = plan.resourceDefinitions.find(
      (value: ResourceDefinition) => value.key === this.key
    );
    if (foundMatch === undefined) {
      return error(`${this.key} does not exist as a Resource`);
    }

    // Confirm the oldValue is in there.
    const oldValueIndex = foundMatch.values.indexOf(this.oldValue);

    if (oldValueIndex === -1) {
      return error(`${this.key} does not a value ${this.oldValue}`);
    }

    // Confirm the newValue is not in there.
    const newValueIndex = foundMatch.values.indexOf(this.newValue);
    if (newValueIndex !== -1) {
      return error(`${this.key} already has a value ${this.newValue}`);
    }

    // Swap the values.
    foundMatch.values.splice(oldValueIndex, 1, this.newValue);

    // Now loop over every task and change oldValue -> newValue for the given resource key.
    plan.chart.Vertices.forEach((task: Task) => {
      const currentValue = task.resources[this.key];
      if (currentValue === this.oldValue) {
        task.resources[this.key] = this.newValue;
      }
    });

    return ok({ plan: plan, inverse: this.inverse() });
  }

  inverse(): SubOp {
    return new RenameResourceOptionSubOp(
      this.key,
      this.newValue,
      this.oldValue
    );
  }
}

export class MoveResourceOptionSubOp implements SubOp {
  key: string;
  oldIndex: number;
  newIndex: number;

  constructor(key: string, oldValue: number, newValue: number) {
    this.key = key;
    this.oldIndex = oldValue;
    this.newIndex = newValue;
  }

  apply(plan: Plan): Result<SubOpResult> {
    const foundMatch = plan.resourceDefinitions.find(
      (value: ResourceDefinition) => value.key === this.key
    );
    if (foundMatch === undefined) {
      return error(`${this.key} does not exist as a Resource`);
    }

    if (this.oldIndex > foundMatch.values.length - 1) {
      return error(
        `${this.key} does not have a value at index ${this.oldIndex}`
      );
    }
    if (this.newIndex > foundMatch.values.length - 1) {
      return error(
        `${this.key} does not have a value at index ${this.newIndex}`
      );
    }

    // Swap the values.
    const tmp = foundMatch.values[this.oldIndex];
    foundMatch.values[this.oldIndex] = foundMatch.values[this.newIndex];
    foundMatch.values[this.newIndex] = tmp;

    // We don't need to do anything with Tasks because the index of a value is
    // irrelevant since we store the value itself, not the index.

    return ok({ plan: plan, inverse: this.inverse() });
  }

  inverse(): SubOp {
    return new MoveResourceOptionSubOp(this.key, this.newIndex, this.oldIndex);
  }
}

export function AddResourceOp(name: string): Op {
  return new Op([new AddResourceSubOp(name)]);
}

export function DeleteResourceOp(name: string): Op {
  return new Op([new DeleteResourceSupOp(name)]);
}

export function AddResourceOptionOp(key: string, value: string): Op {
  return new Op([new AddResourceOptionSubOp(key, value)]);
}

export function DeleteResourceOptionOp(key: string, value: string): Op {
  return new Op([new DeleteResourceOptionSubOp(key, value)]);
}

export function RenameResourceOptionOp(
  key: string,
  oldValue: string,
  newValue: string
): Op {
  return new Op([new RenameResourceOptionSubOp(key, oldValue, newValue)]);
}

export function RenameResourceOp(oldValue: string, newValue: string): Op {
  return new Op([new RenameResourceSubOp(oldValue, newValue)]);
}

export function MoveResourceOptionOp(
  key: string,
  oldIndex: number,
  newIndex: number
): Op {
  return new Op([new MoveResourceOptionSubOp(key, oldIndex, newIndex)]);
}
