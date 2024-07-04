// Each Resourse has a key, which is the name, and a list of acceptable values.
// The list of values can never be empty, and the first value in `values` is the
// default value for a Resource.

export class ResourceDefinition {
  key: string;
  values: string[] = [""];

  constructor(key: string) {
    this.key = key;
  }
}

export type ResourceDefinitions = ResourceDefinition[];
