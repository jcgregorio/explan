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

export function AddResourceOp(name: string): Op {
  return new Op([new AddResourceSubOp(name)]);
}

export function DeleteResourceOpResourceOp(name: string): Op {
  return new Op([new DeleteResourceSupOp(name)]);
}
