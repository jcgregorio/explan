import { Result, ok, error } from "../result";
import { Plan } from "../plan/plan";
import { Op, SubOp, SubOpResult } from "./ops";
import { ResourceDefinition } from "../resources/resources";

export class AddResourceSubOp implements SubOp {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  apply(plan: Plan): Result<SubOpResult> {
    const foundMatch = plan.resourceDefinitions.find(
      (value: ResourceDefinition) => value.key === this.name
    );
    if (foundMatch !== undefined) {
      return error(`${this.name} already exists as a Resource`);
    }

    plan.resourceDefinitions.push(new ResourceDefinition(this.name));
    return ok({plan:plan, inverse: this.inverse()});
  }

  inverse(): SubOp {
    return new DeleteResourceSupOp(this.name);
  }
}

export class DeleteResourceSupOp implements SubOp {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  apply(plan: Plan): Result<SubOpResult> {
    const index = plan.resourceDefinitions.findIndex(
      (value: ResourceDefinition) => value.key === this.name
    );
    if (index === -1) {
      return error(
        `The resource with name ${this.name} does not exist and can't be deleted.`
      );
    }
    plan.resourceDefinitions.splice(index, 1);

    return ok({plan:plan, inverse: this.inverse()});
  }

  inverse(): SubOp {
    return new AddResourceSubOp(this.name);
  }
}

export class AddResourceOptionSubOp implements SubOp {
  key: string;
  value: string;

  constructor(key: string, value: string) {
    this.key = key;
    this.value = value;
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

    return ok({plan: plan, inverse: this.inverse()});
  }

  inverse(): SubOp {
    return new DeleteResourceOptionSubOp(this.key, this.value);
  }
}

export class DeleteResourceOptionSubOp implements SubOp {
  key: string;
  value: string;

  constructor(key: string, value: string) {
    this.key = key;
    this.value = value;
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

    return ok({plan:plan, inverse: this.inverse()});
  }

  inverse(): SubOp {
    return new AddResourceOptionSubOp(this.key, this.value);
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
