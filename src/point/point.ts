/** A coordinate point on the rendering surface. */

export interface Point {
  x: number;
  y: number;
}

export const pt = (x: number, y: number): Point => {
  return { x: x, y: y };
};

export const ptt = (p: [number, number]): Point => {
  const [x, y] = p;
  return { x: x, y: y };
};

export const sum = (p1: Point, p2: Point): Point => {
  return {
    x: p1.x + p2.x,
    y: p1.y + p2.y,
  };
};

export const add = (p1: Point, p2: [number, number]): Point => {
  const [x2, y2] = p2;
  return {
    x: Math.floor(p1.x + x2),
    y: Math.floor(p1.y + y2),
  };
};

export const equal = (p1: Point, p2: Point): boolean =>
  p1.x === p2.x && p1.y === p2.y;

export const dup = (p: Point): Point => {
  return { x: p.x, y: p.y };
};

export const difference = (p1: Point, p2: Point): [number, number] => {
  return [p2.x - p1.x, p2.y - p1.y];
};
