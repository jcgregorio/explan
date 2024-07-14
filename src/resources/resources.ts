// Each Resourse has a key, which is the name, and a list of acceptable values.
// The list of values can never be empty, and the first value in `values` is the
// default value for a Resource.

export const DEFAULT_RESOURCE_VALUE = "";

export class ResourceDefinition {
  key: string;
  values: string[] = [DEFAULT_RESOURCE_VALUE];

  constructor(key: string) {
    this.key = key;
  }
}

export type ResourceDefinitions = ResourceDefinition[];
