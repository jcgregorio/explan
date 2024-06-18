import { RenderOptions } from "../renderer";

/** A coordinate point on the rendering surface. */
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

/** Features of the chart we can ask for coordinates of, where the value returned is
 * the top left coordinate of the feature.
 */
export enum Feature {
  taskLineStart,
  textStart,
  percentStart,
  verticalArrowDest,
  horizontalArrowDest,
  verticalArrowStart,
  horizontalArrowStart,
  verticalArrowDestToMilestone,
  horizontalArrowDestToMilestone,
  verticalArrowStartFromMilestone,
  horizontalArrowStartFromMilestone,
}

/** Sizes of features of a rendered chart. */
export enum Metric {
  taskLineHeight,
  percentHeight,
  arrowHeadHeight,
  arrowHeadWidth,
  milestoneDiameter,
}

/** Makes a number odd, adds one if even. */
const makeOdd = (n: number): number => {
  if (n % 2 === 0) {
    return n + 1;
  }
  return n;
};

/** Scale consolidates all calculations around rendering a chart onto a surface. */
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
    totalNumberOfDays: number
  ) {
    this.marginSizePx = opts.marginSizePx;
    // TODO Change calcs if opts.displaySubRange is non-Null.
    this.dayWidthPx = Math.floor(
      (canvasWidthPx - 2 * opts.marginSizePx) / totalNumberOfDays
    );

    this.blockSizePx = Math.floor(opts.fontSizePx / 3);
    this.taskHeightPx = makeOdd(Math.floor((this.blockSizePx * 3) / 4));
    this.lineWidthPx = makeOdd(Math.floor(this.taskHeightPx / 3));
    this.rowHeightPx = 6 * this.blockSizePx; // This might also be `(canvasHeightPx - 2 * opts.marginSizePx) / numberSwimLanes` if height is supplied?
  }

  /** The top left corner of the bounding box for a single task. */
  private envelopeStart(row: number, day: number): Point {
    return new Point(
      day * this.dayWidthPx + this.marginSizePx,
      row * this.rowHeightPx + this.marginSizePx
    );
  }

  /** Returns the coordinate of the item */
  feature(row: number, day: number, coord: Feature): Point {
    switch (coord) {
      case Feature.taskLineStart:
      case Feature.verticalArrowDest:
      case Feature.verticalArrowStart:
        return this.envelopeStart(row, day).add(0, 5 * this.blockSizePx);
      case Feature.textStart:
        return this.envelopeStart(row, day).add(
          this.blockSizePx,
          this.blockSizePx
        );
      case Feature.percentStart:
        return this.envelopeStart(row, day).add(
          0,
          6 * this.blockSizePx - this.lineWidthPx
        );
      case Feature.horizontalArrowDest:
      case Feature.horizontalArrowStart:
        return this.envelopeStart(row, day).add(
          0,
          Math.floor(5.5 * this.blockSizePx) - 1
        );
      case Feature.verticalArrowDestToMilestone:
        return this.feature(row, day, Feature.verticalArrowDest).add(
          0,
          -1 * this.metric(Metric.milestoneDiameter)
        );
      case Feature.horizontalArrowDestToMilestone:
        return this.feature(row, day, Feature.horizontalArrowDest).add(
          -1 * this.metric(Metric.milestoneDiameter),
          0
        );
      case Feature.verticalArrowStartFromMilestone:
        return this.feature(row, day, Feature.verticalArrowStart).add(
          0,
          this.metric(Metric.milestoneDiameter)
        );
      case Feature.horizontalArrowStartFromMilestone:
        return this.feature(row, day, Feature.horizontalArrowStart).add(
          this.metric(Metric.milestoneDiameter),
          0
        );

      default:
        // The line below will not compile if you missed an enum in the switch above.
        coord satisfies never;
        return new Point(0, 0);
    }
  }

  metric(feature: Metric): number {
    switch (feature) {
      case Metric.taskLineHeight:
        return this.taskHeightPx;
        break;

      case Metric.percentHeight:
        return this.lineWidthPx;
        break;

      case Metric.arrowHeadHeight:
        return this.taskHeightPx;
        break;

      case Metric.arrowHeadWidth:
        return Math.ceil(this.taskHeightPx / 2);
        break;

      case Metric.milestoneDiameter:
        return Math.ceil(this.taskHeightPx / 2);
        break;

      default:
        // The line below will not compile if you missed an enum in the switch above.
        feature satisfies never;
        return 0.0;
        break;
    }
  }
}
