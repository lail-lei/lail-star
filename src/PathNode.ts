export class PathNode {
    x: number;
    y: number;
    parent: PathNode | null;
    id: string;
    cost: number;

    constructor(x: number, y: number, parent?: PathNode) {
        this.x = x;
        this.y = y;
        this.id = `${x}_${y}`;
        this.parent = parent || null;
        this.cost = Infinity;
    }

    evaluate = (target: PathNode) => {
        // cost from start to parent node
        const g = this.parent?.cost ? this.parent.cost : 0;
        // heuristic 
        const h = this.calculateManhattenDistance(target);
        this.cost = g + h;
    }

    calculateEuclideanDistance = (target: PathNode): number => {
        return Math.sqrt(Math.pow(this.x - target.x, 2) + Math.pow(this.y - target.y, 2));
    }

    calculateManhattenDistance = (target: PathNode): number => {
        return (Math.abs(this.x - target.x) + Math.abs(this.y - target.y));
    }

    generateChildren = (floorplan: Matrix): (PathNode | null)[] => {

        const numColumns = floorplan[0].length;
        const numRows = floorplan.length;

        const generateChild = (x: number, y: number) => {
            const xOutOfBounds = x < 0 || x >= numColumns;
            const yOutOfBounds = y < 0 || y >= numRows;

            if (xOutOfBounds || yOutOfBounds) return null;

            if (floorplan[y][x] === 1) return null;

            return new PathNode(x, y, this);
        }

        return [
            generateChild(this.x - 1, this.y),
            generateChild(this.x + 1, this.y),
            generateChild(this.x, this.y - 1),
            generateChild(this.x, this.y + 1),
        ];
    }

}