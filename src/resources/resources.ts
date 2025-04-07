// Each Resourse has a key, which is the name, and a list of acceptable values.
// The list of values can never be empty, and the first value in `values` is the
// default value for a Resource.

export const DEFAULT_RESOURCE_VALUE = "";

export interface ResourceDefinitionSerialized {
  values: string[];
  static: boolean;
}

export class ResourceDefinition {
  values: string[];

  // True if the Resource is built in and can't be edited or deleted.
  isStatic: boolean;

  constructor(
    values: string[] = [DEFAULT_RESOURCE_VALUE],
    isStatic: boolean = false,
  ) {
    this.values = values;
    this.isStatic = isStatic;
  }

  toJSON(): ResourceDefinitionSerialized {
    return {
      values: this.values,
      static: this.isStatic,
    };
  }

  static fromJSON(s: ResourceDefinitionSerialized): ResourceDefinition {
    return new ResourceDefinition(s.values, s.static);
  }
}

export type ResourceDefinitions = { [key: string]: ResourceDefinition };
export type ResourceDefinitionsSerialized = {
  [key: string]: ResourceDefinitionSerialized;
};
