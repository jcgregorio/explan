// Need a way to map from x-domain (days, feature) to x-range (pixels) and
// from y-domain (row #, feature) to y-range (pixels) where feature is
// something like 'text', 'task line', 'completion line', etc.

import { RenderOptions } from "../renderer";

export class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(x: number, y: number): Point {
    this.x += x;
    this.y += y;
    return this;
  }

  sum(rhs: Point): Point {
    return new Point(this.x + rhs.x, this.y + rhs.y);
  }
}

// The value returned is the top left coordinate of the feature.
export enum Coordiate {
  taskLineStart,
  textStart,
  percentStart,
  verticalArrowDest,
  horizontalArrowDest,
}

export enum Feature {
  taskLineHeight,
  percentHeight,
}

const makeOdd = (n: number): number => {
  if (n % 2 === 0) {
    return n + 1;
  }
  return n;
};

export class Scale {
  private dayWidthPx: number;
  private rowHeightPx: number;
  private blockSizePx: number;
  private taskHeightPx: number;
  private lineWidthPx: number;
  private marginSizePx: number;

  constructor(
    opts: RenderOptions,
    canvasWidthPx: number,
    canvasHeightPx: number,
    totalNumberOfDays: number,
    numberSwimLanes: number
  ) {
    this.marginSizePx = opts.marginSizePx;
    // TODO Change calcs if opts.displaySubRange is non-Null.
    this.dayWidthPx =
      (canvasWidthPx - 2 * opts.marginSizePx) / totalNumberOfDays;

    this.blockSizePx = Math.floor(opts.fontSizePx / 3);
    this.taskHeightPx = makeOdd(Math.floor((this.blockSizePx * 3) / 4));
    this.lineWidthPx = makeOdd(Math.floor(this.taskHeightPx / 3));
    this.rowHeightPx = 6 * this.blockSizePx; // This might also be `(canvasHeightPx - 2 * opts.marginSizePx) / numberSwimLanes` if height is supplied?
  }

  private envelopeStart(row: number, day: number): Point {
    return new Point(
      day * this.dayWidthPx + this.marginSizePx,
      row * this.rowHeightPx + this.marginSizePx
    );
  }

  coord(row: number, day: number, coord: Coordiate): Point {
    switch (coord) {
      case Coordiate.taskLineStart:
        return this.envelopeStart(row, day).add(0, 5 * this.blockSizePx);
        break;
      case Coordiate.textStart:
        return this.envelopeStart(row, day).add(
          this.blockSizePx,
          this.blockSizePx
        );
        break;
      case Coordiate.percentStart:
        return this.envelopeStart(row, day).add(
          0,
          6 * this.blockSizePx - this.lineWidthPx
        );
        break;
      case Coordiate.verticalArrowDest:
        return this.envelopeStart(row, day).add(0, 5 * this.blockSizePx);
        break;
      case Coordiate.horizontalArrowDest:
        return this.envelopeStart(row, day).add(0, 4.5 * this.blockSizePx);
      default:
        // The line below will not compile if you missed an enum in the switch above.
        coord satisfies never;
        return new Point(0, 0);
    }
  }

  feature(row: number, day: number, feature: Feature): number {
    switch (feature) {
      case Feature.taskLineHeight:
        return this.taskHeightPx;
        break;

      case Feature.percentHeight:
        return this.lineWidthPx;
        break;

      default:
        // The line below will not compile if you missed an enum in the switch above.
        feature satisfies never;
        return 0.0;
        break;
    }
  }
}
