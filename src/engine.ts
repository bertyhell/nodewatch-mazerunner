import { ScreenIoOperations, MazeElement, Point, Quadrant } from './types';
import { clampDeg, cos, sin, tan } from './utils';

const mazeWidth = 20;
const mazeHeight = 15;
const screenWidth = 240;
const screenHeight = 160;
const viewAngleWidth = 70;
const angleStep = 7;
const playerStepSize = 0.1;
const mazeHorCells = mazeWidth * 2 + 1;
const mazeVerCells = mazeHeight * 2 + 1;

const maze: MazeElement[][] = generateMaze(mazeHorCells, mazeVerCells);
// let maze: MazeElement[][] = [
// 	[1, 1, 1, 1, 1, 1, 1],
// 	[1, 0, 0, 0, 1, 0, 1],
// 	[1, 0, 1, 0, 0, 0, 1],
// 	[1, 0, 1, 0, 1, 0, 1],
// 	[1, 2, 1, 0, 1, 3, 1],
// 	[1, 1, 1, 1, 1, 1, 1]
// ];

// Game variables
export const gameVariables = {
	mazeWidth,
	mazeHeight,
	screenWidth,
	screenHeight,
	viewAngleWidth,
	angleStep,
	playerStepSize,

	// Computed values
  mazeHorCells,
  mazeVerCells,
  playerX: 1.5,
  playerY: 1.5,
	maze,
	// point te player towards the hallway instead of towards a wall
  // Checks if the cell to the right of the player is a wall, if so, point the player down (90), else to the right (0)
	playerAngle: maze[1][2] === MazeElement.WALL ? 90 : 0,

	onFrame,
	startGame,
	stopGame,
};




// Determines if we should draw a vertical wall line for the given intersections at the center of these 4 maze cells:
// +-----+
// |0 |1 |
// +-----+
// |2 |3 |
// +-----+
//
// eg: 1000 => should draw a wall at the X
// +--+--+
// |W |  |
// +--X--+
// |  |  |
// +--+--+
//
// eg: 1010 => should not draw a wall at the X since the wall is smoothly running from top to bottom across the intersection
// +--+--+
// |W |  |
// +--X--+
// |W |  |
// +--+--+
//
// We can assume the X location is always visible from the user's perspective
const CORNERS: { [cornerKey: string]: boolean } = {
	'0000': false,
	'0001': true,
	'0010': true,
	'0011': false,
	'0100': true,
	'0101': false,
	'0110': false,
	'0111': true,
	'1000': true,
	'1001': true,
	'1010': false,
	'1011': true,
	'1100': false,
	'1101': true,
	'1110': true,
	'1111': false,
};

let running = true;



// } else {
// 	globals = {
// 		Bangle: Bangle,
// 		g: g,
// 		BTNU: BTN1,
// 		BTND: BTN2,
// 		BTNL: BTN4,
// 		BTNR: BTN5,
// 	};
// }


console.log('screen: ', gameVariables.screenWidth, gameVariables.screenHeight);

function startGame(screenIo: ScreenIoOperations) {
	running = true;
	gameVariables.onFrame(screenIo);
}

function stopGame() {
	running = false;
	// globals.g.clear();
	// globals.g.drawString('Game Over!', 120, (gameVariables.screenHeight - 6) / 2);
	// globals.g.flip();
}

function getSquareDistance(x1: number, y1: number, x2: number, y2: number) {
	return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
}

function isOutsideMaze(maze: MazeElement[][], location: Point): boolean {
	return !(location.x >= 0 && location.x < maze[0].length && location.y >= 0 && location.y < maze.length);
}

/**
 * https://www.permadi.com/tutorial/raycast/rayc7.html
 */
function getCollisionDistance(viewAngle: number, outerRay: boolean, debugOperations: ScreenIoOperations): Point {
	const quadrant: Quadrant = Math.floor(viewAngle / 90);

	let horCollision: Point | undefined; // first intersection with a wall
	let vertCollision: Point | undefined; // first intersection with a wall
	let intersectionOffset: number = 0; // number of intersections to skip since the ones before were not an intersection with a wall
	let initialHorIntersectionX: number | undefined; // first intersection with horizontal gridline
	let initialHorIntersectionY: number | undefined;
	let initialVertIntersectionX: number | undefined; // first intersection with vertical gridline
	let initialVertIntersectionY: number | undefined;
	let horizontalOffsetX: number | undefined; // distance between horizontal intersections
	let horizontalOffsetY: number | undefined;
	let verticalOffsetX: number | undefined; // distance between vertical intersections
	let verticalOffsetY: number | undefined;
	let isFacingUp: boolean;
	let isFacingRight: boolean;
	let horIntersectionX: number;
	let horIntersectionY: number;
	let horGridLocation: Point;
	let vertIntersectionX: number;
	let vertIntersectionY: number;
	let vertGridLocation: Point;

	while (!horCollision || !vertCollision) {
		isFacingUp = quadrant === Quadrant.TopLeft || quadrant === Quadrant.TopRight;
		// horizontal intersection
		if (!horCollision) {
			if (!initialHorIntersectionX) {
				if (isFacingUp) {
					initialHorIntersectionY = Math.floor(gameVariables.playerY);
				} else {
					initialHorIntersectionY = Math.floor(gameVariables.playerY) + 1;
				}
				initialHorIntersectionX = gameVariables.playerX - (gameVariables.playerY - initialHorIntersectionY) / tan(viewAngle);
			}
			if (intersectionOffset !== 0 && !horizontalOffsetX) {
				if (isFacingUp) {
					horizontalOffsetY = -1;
				} else {
					horizontalOffsetY = 1;
				}
				horizontalOffsetX = 1 / tan(viewAngle);
			}
			horIntersectionX = initialHorIntersectionX + (horizontalOffsetX || 0) * intersectionOffset * (isFacingUp ? -1 : 1);
			horIntersectionY = initialHorIntersectionY as number + (horizontalOffsetY || 0) * intersectionOffset;
			horGridLocation = {
				x: Math.floor(horIntersectionX),
				y: Math.floor(horIntersectionY) + (isFacingUp ? -1 : 0),
			};
			if (isOutsideMaze(maze, horGridLocation) || maze[horGridLocation.y][horGridLocation.x] === MazeElement.WALL) {
				outerRay ? debugOperations.drawDebugPixel(horIntersectionX, horIntersectionY) : () => {
				};
				horCollision = { x: horIntersectionX, y: horIntersectionY };
			} else {
				outerRay ? debugOperations.drawDebugPixel(horIntersectionX, horIntersectionY, '#FF0000') : () => {
				};
			}
		}

		// Vertical intersection
		isFacingRight = quadrant === Quadrant.BottomRight || quadrant === Quadrant.TopRight;

		if (!vertCollision) {
			if (!initialVertIntersectionX) {
				if (isFacingRight) {
					initialVertIntersectionX = Math.floor(gameVariables.playerX) + 1;
				} else {
					initialVertIntersectionX = Math.floor(gameVariables.playerX);
				}
				initialVertIntersectionY = gameVariables.playerY - (gameVariables.playerX - initialVertIntersectionX) * tan(viewAngle);
			}
			if (intersectionOffset !== 0 && !verticalOffsetX) {
				verticalOffsetX = isFacingRight ? 1 : -1;
				verticalOffsetY = Math.abs(tan(viewAngle)) * (isFacingUp ? -1 : 1);
			}

			vertIntersectionX = initialVertIntersectionX + (verticalOffsetX || 0) * intersectionOffset;
			vertIntersectionY = initialVertIntersectionY as number + (verticalOffsetY || 0) * intersectionOffset;
			vertGridLocation = {
				x: Math.floor(vertIntersectionX) + (isFacingRight ? 0 : -1),
				y: Math.floor(vertIntersectionY),
			};
			if (isOutsideMaze(maze, vertGridLocation) || maze[vertGridLocation.y][vertGridLocation.x] === MazeElement.WALL) {
				outerRay ? debugOperations.drawDebugPixel(vertIntersectionX, vertIntersectionY) : () => {
				};
				vertCollision = { x: vertIntersectionX, y: vertIntersectionY };
			} else {
				outerRay ? debugOperations.drawDebugPixel(vertIntersectionX, vertIntersectionY, '#FF0000') : () => {
				};
			}
		}
		intersectionOffset++;
	}
	const horDistance = getSquareDistance(gameVariables.playerX, gameVariables.playerY, horCollision.x, horCollision.y);
	const vertDistance = getSquareDistance(gameVariables.playerX, gameVariables.playerY, vertCollision.x, vertCollision.y);
	const closestCollision: Point = horDistance < vertDistance ? horCollision : vertCollision;
	outerRay ? debugOperations.drawDebugPixel(closestCollision.x, closestCollision.y, '#00FF00') : () => {
	};
	debugOperations.drawDebugLine(gameVariables.playerX, gameVariables.playerY, closestCollision.x, closestCollision.y);

	if (!closestCollision) {
		throw new Error('intersection is null');
	}

	return closestCollision;
}

interface CollisionInfo {
	angle: number;
	collision: Point;
	distance: number;
	shouldDrawWall: boolean;
}

function drawWalls(screenIo: ScreenIoOperations) {
	// console.log('--------------------------');
	screenIo.drawDebugGrid(maze);

	// console.log('player angle: ', playerAngle);

	const startAngle = clampDeg(gameVariables.playerAngle - gameVariables.viewAngleWidth / 2);
	const raytraceStepAngle = gameVariables.viewAngleWidth / gameVariables.screenWidth;
	const anglesCollisionsAndDistances: CollisionInfo[] = [];
	for (let i = 0; i < gameVariables.screenWidth; i += 1) {
		const viewAngle = clampDeg(startAngle + raytraceStepAngle * i);
		const collision: Point = getCollisionDistance(viewAngle, i === 0 || i >= gameVariables.screenWidth - 1, screenIo);
		const directDistance = Math.sqrt(getSquareDistance(gameVariables.playerX, gameVariables.playerY, collision.x, collision.y));
		const perpendicularDistance = directDistance * cos(clampDeg(viewAngle - gameVariables.playerAngle));

		anglesCollisionsAndDistances.push({
			angle: viewAngle,
			collision,
			distance: perpendicularDistance,
			shouldDrawWall: false,
		});
	}

	// Identify which rays should also draw a vertical line to identify corners
	// Find unique intersection point in the maze which are closest to each collision
	const intersectionPoints: { [coord: string]: Point } = {};
	anglesCollisionsAndDistances.forEach(angCollDis => {
		const intersectionX = Math.round(angCollDis.collision.x);
		const intersectionY = Math.round(angCollDis.collision.y);
		intersectionPoints[intersectionX + ';' + intersectionY] = { x: intersectionX, y: intersectionY };
	});
	// Identify if the intersection should cause a wall line to be displayed or if it is part of a straight wall
	const cornerIntersectionPoints: Point[] = [];
	Object.keys(intersectionPoints).forEach(intersectionKey => {
		const intersection = intersectionPoints[intersectionKey];
		const topLeftCell = maze[intersection.y - 1][intersection.x - 1];
		const topRightCell = maze[intersection.y - 1][intersection.x];
		const bottomLeftCell = maze[intersection.y][intersection.x - 1];
		const bottomRightCell = maze[intersection.y][intersection.x];

		// Generate corner key: eg: 1100 or 1010
		const cornerKey: string =
			(topLeftCell === MazeElement.WALL ? '1' : '0') +
			(topRightCell === MazeElement.WALL ? '1' : '0') +
			(bottomLeftCell === MazeElement.WALL ? '1' : '0') +
			(bottomRightCell === MazeElement.WALL ? '1' : '0');
		const shouldDrawWall = CORNERS[cornerKey];
		if (shouldDrawWall) {
			cornerIntersectionPoints.push(intersection);
		}
	});

	// Find the closest collision to each corner intersection
	cornerIntersectionPoints.forEach(intersection => {
		let shortestDistance = 100000;
		let closestCollisionIndex = 0;
		anglesCollisionsAndDistances.forEach((collisionInfo: CollisionInfo, index: number) => {
			const distance = Math.abs(intersection.x - collisionInfo.collision.x) + Math.abs(intersection.y - collisionInfo.collision.y);
			if (distance < shortestDistance) {
				closestCollisionIndex = index;
				shortestDistance = distance;
			}
		});
		anglesCollisionsAndDistances[closestCollisionIndex].shouldDrawWall = true;
	});

	// Draw the walls
	anglesCollisionsAndDistances.forEach((collisionInfo: CollisionInfo, index: number) => {
		let wallHeight = gameVariables.screenHeight / collisionInfo.distance;

		if (collisionInfo.shouldDrawWall) {
			screenIo.drawVerticalLine(index, Math.round((gameVariables.screenHeight - wallHeight) / 2), Math.round((gameVariables.screenHeight - wallHeight) / 2 + wallHeight));
		} else {
			screenIo.drawPixel(index, Math.round((gameVariables.screenHeight - wallHeight) / 2));
			screenIo.drawPixel(index, Math.round((gameVariables.screenHeight - wallHeight) / 2 + wallHeight));
		}
	});
}

function isInsideWall(playerX: number, playerY: number) {
	return maze[Math.floor(playerY)][Math.floor(playerX)] === MazeElement.WALL;
}

function movePlayer(deltaX: number, deltaY: number) {
	// Try moving in both directions
	let newPlayerX = gameVariables.playerX + deltaX;
	let newPlayerY = gameVariables.playerY + deltaY;
	if (!isInsideWall(newPlayerX, newPlayerY)) {
		gameVariables.playerX = newPlayerX;
		gameVariables.playerY = newPlayerY;
		return;
	}
	// Try moving in the y direction only
	newPlayerX = gameVariables.playerX;
	newPlayerY = gameVariables.playerY + deltaY;
	if (!isInsideWall(newPlayerX, newPlayerY)) {
		gameVariables.playerX = newPlayerX;
		gameVariables.playerY = newPlayerY;
		return;
	}
	// Try moving in the x direction only
	newPlayerX = gameVariables.playerX + deltaX;
	newPlayerY = gameVariables.playerY;
	if (!isInsideWall(newPlayerX, newPlayerY)) {
		gameVariables.playerX = newPlayerX;
		gameVariables.playerY = newPlayerY;
		return;
	}
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
function generateMaze(width: number, height: number): MazeElement[][] {
	const generatedMaze: MazeElement[][] = [];
	// Init maze like:
	// 111111111
	// 101010101
	// 111111111
	// 101010101
	// 111111111
	// 101010101
	// 111111111
	for (let row = 0; row < height; row++) {
		generatedMaze[row] = [];
		for (let col = 0; col < width; col++) {
			if (row % 2 === 0 || col % 2 === 0) {
				generatedMaze[row].push(MazeElement.WALL);
			} else {
				generatedMaze[row].push(MazeElement.UNVISITED_EMPTY); // Empty not yet visited, we'll switch this to 0 once we visit the cell during the algorithm
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

let lastPlayerX: number | undefined = undefined;
let lastPlayerY: number | undefined = undefined;
let lastPlayerAngle: number | undefined = undefined;

function onFrame(screenIo: ScreenIoOperations) {
	// let t = getTime();
	// let d = (lastFrame===undefined)?0:(t-lastFrame)*20;
	// lastFrame = t;

	if (screenIo.BTN4.read()) {
		// console.log('left');
		gameVariables.playerAngle = clampDeg(gameVariables.playerAngle - gameVariables.angleStep);
	}
	if (screenIo.BTN5.read()) {
		// console.log('right');
		gameVariables.playerAngle = clampDeg(gameVariables.playerAngle + gameVariables.angleStep);
	}
	if (screenIo.BTN1.read()) {
		// console.log('forward');

		const quadrant: Quadrant = Math.floor(gameVariables.playerAngle / 90);
		const isFacingUp = quadrant === Quadrant.TopLeft || quadrant === Quadrant.TopRight;
		const isFacingRight = quadrant === Quadrant.TopRight || quadrant === Quadrant.BottomRight;
		const playerXDelta = Math.abs(cos(gameVariables.playerAngle) * gameVariables.playerStepSize) * (isFacingRight ? 1 : -1);
		const playerYDelta = Math.abs(sin(gameVariables.playerAngle) * gameVariables.playerStepSize) * (isFacingUp ? -1 : 1);
		movePlayer(playerXDelta, playerYDelta);
	}
	if (screenIo.BTN2.read()) {
		// console.log('backward');

		const quadrant: Quadrant = Math.floor(gameVariables.playerAngle / 90);
		const isFacingUp = quadrant === Quadrant.TopLeft || quadrant === Quadrant.TopRight;
		const isFacingRight = quadrant === Quadrant.TopRight || quadrant === Quadrant.BottomRight;
		const playerXDelta = Math.abs(cos(gameVariables.playerAngle) * gameVariables.playerStepSize) * (isFacingRight ? -1 : 1);
		const playerYDelta = Math.abs(sin(gameVariables.playerAngle) * gameVariables.playerStepSize) * (isFacingUp ? 1 : -1);
		movePlayer(playerXDelta, playerYDelta);
	}

	if (!running) {
		// if (BTNA.read()) gameStart();
		return;
	}

	if (lastPlayerX !== gameVariables.playerX ||
		lastPlayerY !== gameVariables.playerY ||
		lastPlayerAngle !== gameVariables.playerAngle) {
		// console.log('start draw cycle');
		screenIo.clear();
		drawWalls(screenIo);
		screenIo.flip();
		// console.log('finished draw cycle');
	}

	lastPlayerX = gameVariables.playerX;
	lastPlayerY = gameVariables.playerY;
	lastPlayerAngle = gameVariables.playerAngle;
	setTimeout(() => onFrame(screenIo), 50);
}