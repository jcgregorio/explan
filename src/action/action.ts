import { ExplanMain } from "../explanMain/explanMain";
import { Result } from "../result";

export type PostActonWork = "" | "paintChart" | "planDefinitionChanged";

export interface Action {
  name: string;
  description: string;
  postActionWork: PostActonWork;
  undo: boolean; // If true include in undo/redo actions.
  do(explanMain: ExplanMain): Result<Action>;
}
