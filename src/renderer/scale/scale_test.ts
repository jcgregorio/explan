import { assert } from "https://deno.land/std@0.224.0/assert/assert.ts";
import { RenderOptions } from "../renderer.ts";
import { Feature, Scale } from "./scale.ts";

Deno.test("Basic size calculations:", () => {
  const opts: RenderOptions = {
    fontSizePx: 12,
    hasText: true,
    displaySubRange: null,
    colorTheme: {
      surface: "#000",
      onSurface: "#222",
    },
    marginSizePx: 10,
  };
  const s = new Scale(opts, 256, 0, 20, 10);
  assert(s.feature(1, 0, Feature.percentHeight) === 1);
  assert(s.feature(1, 0, Feature.taskLineHeight) === 3);
});
