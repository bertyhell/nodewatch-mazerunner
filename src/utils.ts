import { MazeElement, Point } from './types';

const initialTime = new Date().getTime();

// export function printFreeSpace(name?: string): void {
// 	if (!(process as any).memory) {
// 		return;
// 	}
// 	const time = Math.floor(new Date().getTime() - initialTime);
// 	console.log((name || 'free memory') + '; ' + time + '; ' + (process as any).memory().free);
// }

export function clampDeg(deg: number): number {
	return (deg + 360) % 360;
}


// /**
//  * Generates a lookup table for trigonometric functions
//  * The keys will be the degrees times 10, so we can easily round to 0.1 degree
//  * @param trigonometricFunction
//  */
// function getLookupTable(trigonometricFunction: (rad: number) => number): { [deg: number]: number } {
// 	const lookup: { [deg: number]: number } = {};
// 	for (let i = 0; i <= 360; i += 1) {
// 		lookup[Math.round(i)] = trigonometricFunction(i / 180 * Math.PI);
// 	}
// 	return lookup;
// }
//
// const cosLookupTable: { [deg: number]: number } = getLookupTable(Math.cos);
// const sinLookupTable: { [deg: number]: number } = getLookupTable(Math.sin);
// const tanLookupTable: { [deg: number]: number } = getLookupTable(Math.tan);
//
// function lookupAndInterpolate(deg: number, lookupTable: { [deg: number]: number }): number {
// 	const lowerDeg = Math.floor(deg);
// 	const upperDeg = Math.ceil(deg + 0.00001);
// 	const lowerTri = lookupTable[lowerDeg];
// 	const upperTri = lookupTable[upperDeg];
// 	const diffDeg = upperDeg - lowerDeg;
// 	const diffCos = upperTri - lowerTri;
// 	return lowerTri + Math.abs(deg - lowerDeg) / diffDeg * diffCos;
// }

// export function cos(deg: number): number {
// 	return lookupAndInterpolate(deg, cosLookupTable);
// }
//
// export function sin(deg: number): number {
// 	return lookupAndInterpolate(deg, sinLookupTable);
// }
//
// export function tan(deg: number): number {
// 	return lookupAndInterpolate(deg, tanLookupTable);
// }

export function cos(deg: number): number {
	return Math.cos(deg / 180 * Math.PI);
}

export function sin(deg: number): number {
	return Math.sin(deg / 180 * Math.PI);
}

export function tan(deg: number): number {
	return Math.tan(deg / 180 * Math.PI);
}

export function getSquareDistance(x1: number, y1: number, x2: number, y2: number) {
	return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
}

export function isOutsideMaze(maze: MazeElement[][], location: Point): boolean {
	return !(location.x >= 0 && location.x < maze[0].length && location.y >= 0 && location.y < maze.length);
}

function getUnvisitedNeighbors(maze: MazeElement[][], currentPosition: Point): Point[] {
	const neighbors: Point[] = [
		{ x: currentPosition.x - 2, y: currentPosition.y }, // left
		{ x: currentPosition.x, y: currentPosition.y - 2 }, // top
		{ x: currentPosition.x + 2, y: currentPosition.y }, // right
		{ x: currentPosition.x, y: currentPosition.y + 2 }, // bottom
	];
	return neighbors.filter(neighbor => {
		return !isOutsideMaze(maze, neighbor) && maze[neighbor.y][neighbor.x] === MazeElement.UNVISITED_EMPTY;
	});
}

/**
 * Generate random number inside the interval [min, max]
 * min and max included
 * @param min
 * @param max
 */
function randomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Generate a maze using a depth first search algorthm with backtracking
 * https://en.wikipedia.org/wiki/Maze_generation_algorithm
 * 1. Choose the initial cell, mark it as visited and push it to the stack
 * 2. While the stack is not empty
 *      1. Pop a cell from the stack and make it a current cell
 *      2. If the current cell has any neighbours which have not been visited
 *            1. Push the current cell to the stack
 *            2. Choose one of the unvisited neighbours
 *            3. Remove the wall between the current cell and the chosen cell
 *            4. Mark the chosen cell as visited and push it to the stack
 * @param width
 * @param height
 */
export function generateMaze(width: number, height: number): MazeElement[][] {
	const generatedMaze: MazeElement[][] = new Array<MazeElement[]>(height);
	// Init maze like:
	// 111111111
	// 101010101
	// 111111111
	// 101010101
	// 111111111
	// 101010101
	// 111111111
	for (let row = 0; row < height; row++) {
		generatedMaze[row] = new Array<MazeElement>(width);
		for (let col = 0; col < width; col++) {
			if (row % 2 === 0 || col % 2 === 0) {
				generatedMaze[row][col] = MazeElement.WALL;
			} else {
				generatedMaze[row][col] = MazeElement.UNVISITED_EMPTY; // Empty not yet visited, we'll switch this to 0 once we visit the cell during the algorithm
			}
		}
	}
	// Remove hedges between empty cells based on maze generation algorithm
	const stack: Point[] = [];
	let currentPosition: Point = { x: 1, y: 1 };
	generatedMaze[currentPosition.y][currentPosition.x] = 0;
	stack.push(currentPosition);
	let unvisitedNeighbors: Point[];
	while (stack.length) {
		currentPosition = stack.pop() as Point;
		unvisitedNeighbors = getUnvisitedNeighbors(generatedMaze, currentPosition);
		if (unvisitedNeighbors.length) {
			stack.push(currentPosition);
			const unvisitedNeighbor = unvisitedNeighbors[randomInt(0, unvisitedNeighbors.length - 1)];
			// Remove hedge
			generatedMaze[(unvisitedNeighbor.y + currentPosition.y) / 2][(unvisitedNeighbor.x + currentPosition.x) / 2] = 0;
			// Mark the neighbor as visited
			generatedMaze[unvisitedNeighbor.y][unvisitedNeighbor.x] = 0;
			stack.push(unvisitedNeighbor);
		}
	}

	// Set start and endpoint
	generatedMaze[1][1] = MazeElement.PLAYER;
	generatedMaze[height - 2][width - 2] = MazeElement.END;

	return generatedMaze;
}
