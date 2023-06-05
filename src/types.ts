type Matrix = number[][];
interface PathNode {
  x: number;
  y: number;
  parent: PathNode | null;
  id: string;
  cost: number;
}
interface AStarSearchResult {
  minCost: number;
  path?: PathNode[];
  error?: string;
}
