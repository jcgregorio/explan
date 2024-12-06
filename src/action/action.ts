import { ExplanMain } from "../explanMain/explanMain";
import { Result } from "../result";

export type PostActonWork = "" | "paintChart" | "planDefinitionChanged";

export interface Action {
  name: string;
  description: string;
  postActionWork: PostActonWork;
  do(explanMain: ExplanMain): Result<Action>;
}
