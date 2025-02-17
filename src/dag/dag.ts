/** One vertex of a graph. */
export type Vertex = object;

/** Every Vertex in a graph. */
export type Vertices = Vertex[];

/** A subset of Vertices referred to by their index number. */
export type VertexIndices = number[];

export interface DirectedEdgeSerialized {
  i: number;
  j: number;
}

/** One edge of a graph, which is a directed connection from the i'th Vertex to
the j'th Vertex, where the Vertex is stored in a Vertices.
 */
export class DirectedEdge {
  i: number = 0;
  j: number = 0;

  constructor(i: number = 0, j: number = 0) {
    this.i = i;
    this.j = j;
  }

  equal(rhs: DirectedEdge): boolean {
    return rhs.i === this.i && rhs.j === this.j;
  }

  toJSON(): DirectedEdgeSerialized {
    return {
      i: this.i,
      j: this.j,
    };
  }

  static fromJSON(des: DirectedEdgeSerialized): DirectedEdge {
    return new DirectedEdge(des.i, des.j);
  }
}

/** Every Egde in a graph. */
export type Edges = DirectedEdge[];

/** A graph is just a collection of Vertices and Edges between those vertices. */
export type DirectedGraph = {
  Vertices: Vertices;
  Edges: Edges;
};

/**
 Groups the Edges by their `i` value.

 @param edges - All the Eges in a DirectedGraph.
 @returns A map from the Vertex index to all the Edges that start at
   at that Vertex index.
 */
export const edgesBySrcToMap = (edges: Edges): Map<number, Edges> => {
  const ret = new Map<number, Edges>();

  edges.forEach((e: DirectedEdge) => {
    const arr = ret.get(e.i) || [];
    arr.push(e);
    ret.set(e.i, arr);
  });

  return ret;
};

/**
   Groups the Edges by their `j` value.
  
   @param edges - All the Edges in a DirectedGraph.
   @returns A map from the Vertex index to all the Edges that end at
     at that Vertex index.
   */

export const edgesByDstToMap = (edges: Edges): Map<number, Edges> => {
  const ret = new Map<number, Edges>();

  edges.forEach((e: DirectedEdge) => {
    const arr = ret.get(e.j) || [];
    arr.push(e);
    ret.set(e.j, arr);
  });

  return ret;
};

export type SrcAndDstReturn = {
  bySrc: Map<number, Edges>;
  byDst: Map<number, Edges>;
};

export const edgesBySrcAndDstToMap = (edges: Edges): SrcAndDstReturn => {
  const ret = {
    bySrc: new Map<number, Edges>(),
    byDst: new Map<number, Edges>(),
  };

  edges.forEach((e: DirectedEdge) => {
    let arr = ret.bySrc.get(e.i) || [];
    arr.push(e);
    ret.bySrc.set(e.i, arr);
    arr = ret.byDst.get(e.j) || [];
    arr.push(e);
    ret.byDst.set(e.j, arr);
  });

  return ret;
};
