import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { RenderOptions } from "../renderer.ts";
import { Coordiate, Feature, Point, Scale } from "./scale.ts";

const optsForTest: RenderOptions = {
  fontSizePx: 12,
  hasText: true,
  displaySubRange: null,
  colorTheme: {
    surface: "#000",
    onSurface: "#222",
  },
  marginSizePx: 10,
};

Deno.test("Basic size calculations 12px font:", () => {
  optsForTest.fontSizePx = 12;
  const s = new Scale(optsForTest, 256, 0, 20, 10);
  assertEquals(s.feature(1, 0, Feature.percentHeight), 1);
  assertEquals(s.feature(1, 0, Feature.taskLineHeight), 3);

  assertEquals(s["dayWidthPx"], 11);
  assertEquals(s["blockSizePx"], 4);
  assertEquals(
    s.coord(1, 1, Coordiate.taskLineStart),
    // margin + dayWidthPx, margin + rowHeight + 5*blockSize
    new Point(10 + 11, 10 + 6 * 4 + 5 * 4)
  );
});

Deno.test("Basic size calculations 24px font:", () => {
  optsForTest.fontSizePx = 24;
  const s = new Scale(optsForTest, 256, 0, 20, 10);
  assertEquals(s.feature(1, 0, Feature.percentHeight), 3);
  assertEquals(s.feature(1, 0, Feature.taskLineHeight), 7);

  assertEquals(s["dayWidthPx"], 11);
  assertEquals(s["blockSizePx"], 8);
  assertEquals(
    s.coord(1, 1, Coordiate.taskLineStart),
    // margin + dayWidthPx, margin + rowHeight + 5*blockSize
    new Point(10 + 11, 10 + 6 * 8 + 5 * 8)
  );
});
