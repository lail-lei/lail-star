import { Matrix } from '../types';

import { MinPriorityQueue, IGetCompareValue } from '@datastructures-js/priority-queue';
import { PathNode } from '../PathNode';

export interface AStarSearchResult {
  minCost: number;
  path?: PathNode[];
  error?: string;
}

export class AStar {
  floorplan: Matrix;
  start?: PathNode;
  target?: PathNode;
  opened?: MinPriorityQueue<PathNode>;
  searchableOpenQueue?: PathNode[] | undefined;
  closed?: Map<string, PathNode>;

  constructor(floorplan: Matrix) {
    this.floorplan = floorplan;
  }

  getNodeCost: IGetCompareValue<PathNode> = (node: PathNode) => node.cost;

  // priority queue helper functions
  createSearchableQueue = () => (this.searchableOpenQueue = this.opened?.toArray());
  resetSearchableQueue = () => (this.searchableOpenQueue = undefined);
  findInOpenQueue = (nodeId: string): number => {
    if (this.searchableOpenQueue === undefined)
      throw new Error('must convert queue to array before searching for node');
    return this.searchableOpenQueue.findIndex((node: PathNode) => node.id === nodeId);
  };
  selectCheaperOpenNode = (child: PathNode, index: number) => {
    if (this.searchableOpenQueue === undefined)
      throw new Error('must convert queue to array before replacing for node');
    const prev = this.searchableOpenQueue[index];
    if (prev.cost > child.cost) {
      this.opened = MinPriorityQueue.fromArray(
        this.searchableOpenQueue.filter((node: PathNode) => node.id !== prev.id),
      );
      this.opened.push(child);
    }
  };

  reconstructPath = (end: PathNode): PathNode[] => {
    const path = [end];
    let ptr = end.parent;
    while (ptr) {
      path.push(ptr);
      ptr = ptr.parent;
    }
    return path;
  };

  // find the distance
  search = (start: PathNode, target: PathNode, reconstructPath: boolean): AStarSearchResult => {
    this.start = start;
    this.target = target;
    this.opened = new MinPriorityQueue<PathNode>(this.getNodeCost);
    this.closed = new Map();
    this.start.evaluate(this.target);

    this.opened.push(this.start);

    let current: PathNode;

    while (!this.opened.isEmpty()) {
      current = this.opened.pop();

      if (current.id === this.target.id) {
        const result: AStarSearchResult = { minCost: current.cost };
        if (reconstructPath) result.path = this.reconstructPath(current);
        return result;
      }

      const children = current.generateChildren(this.floorplan);

      for (const child of children) {
        if (child === null) continue;
        child.evaluate(this.target);

        // if this node has been encountered before and is closed
        if (this.closed.has(child.id)) {
          const prev = this.closed.get(child.id);

          if (prev && prev.cost > child.cost) {
            this.closed.delete(child.id);
            this.opened.push(child);
          }
          continue;
        }

        this.createSearchableQueue();
        const indexInOpenQueue = this.findInOpenQueue(child.id);
        if (indexInOpenQueue === -1) {
          this.opened.push(child);
          this.resetSearchableQueue();
          continue;
        }

        this.selectCheaperOpenNode(child, indexInOpenQueue);
        this.resetSearchableQueue();
      }

      this.closed.set(current.id, current);
    }

    return { minCost: Infinity, error: 'unable to reach target node from given start' };
  };
}
