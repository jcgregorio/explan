import { ExplanMain } from '../../explanMain/explanMain';
import { ok, Result } from '../../result';
import { Action, PostActonWork } from '../action';

export class ToggleRadarAction implements Action {
  description: string = 'Toggles the radar view.';
  postActionWork: PostActonWork = '';
  undo: boolean = false;

  async do(explanMain: ExplanMain): Promise<Result<Action>> {
    explanMain.toggleRadar();
    // ToggleRadarAction is its own inverse.
    return ok(this);
  }
}
