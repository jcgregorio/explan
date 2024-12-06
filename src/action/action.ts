import { ExplanMain } from "../explanMain/explanMain";
import { Result } from "../result";

export interface Action {
  do(explanMain: ExplanMain): Result<Action>;
}
