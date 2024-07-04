import { Result, ok, error } from "../result";
import { Plan } from "../plan/plan";
import { Op, SubOp } from "./ops";
import { ResourceDefinition } from "../resources/resources";

export class AddResourceSubOp implements SubOp {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  apply(plan: Plan): Result<Plan> {
    const foundMatch = plan.resourceDefinitions.find(
      (value: ResourceDefinition) => value.key === this.name
    );
    if (foundMatch !== undefined) {
      return error(`${this.name} already exists as a Resource`);
    }

    plan.resourceDefinitions.push(new ResourceDefinition(this.name));
    return ok(plan);
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

  apply(plan: Plan): Result<Plan> {
    const index = plan.resourceDefinitions.findIndex(
      (value: ResourceDefinition) => value.key === this.name
    );
    if (index === -1) {
      return error(
        `The resource with name ${this.name} does not exist and can't be deleted.`
      );
    }
    plan.resourceDefinitions = plan.resourceDefinitions.splice(index, 1);

    return ok(plan);
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

  apply(plan: Plan): Result<Plan> {
    const definition = plan.resourceDefinitions.find(
      (value: ResourceDefinition) => value.key === this.key
    );
    if (definition === undefined) {
      return error(`${this.key} doesn't exist as a Resource`);
    }
    const alreadyExists = definition.values.find(
      (value: string) => value === this.value
    );
    if (alreadyExists) {
      return error(
        `${this.value} already exists as a value in the Resource ${this.key}.`
      );
    }
    definition.values.push(this.value);

    return ok(plan);
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

  apply(plan: Plan): Result<Plan> {
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
    definition.values = definition.values.splice(valueIndex, 1);

    return ok(plan);
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
