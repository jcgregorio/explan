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

  equal(rhs: Point): boolean {
    return this.x === rhs.x && this.y === rhs.y;
  }

  set(rhs: Point): void {
    this.x = rhs.x;
    this.y = rhs.y;
  }

  dup(): Point {
    return new Point(this.x, this.y);
  }
}
