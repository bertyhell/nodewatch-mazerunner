// const isBangle = process && process.env && process.env.BOARD === 'BANGLEJS';

enum MazeElement {
	UNVISITED_EMPTY = -1,
	EMPTY = 0,
	WALL = 1,
	PLAYER = 2,
	END = 3,
}

// Game variables
let mazeWidth = 30;
let mazeHeight = 20;
let debugCellSize = 20;
let screenWidth = 240;
let screenHeight = 160;
let viewAngleWidth = 70;
let angleStep = 7;
let playerStepSize = 0.1;

// Computed values
let mazeHorCells = mazeWidth * 2 + 1;
let mazeVerCells = mazeHeight * 2 + 1;

const debugWidth = mazeHorCells * debugCellSize;
const debugHeight = mazeVerCells * debugCellSize;

let playerX = 1.5;
let playerY = 1.5;

let maze: MazeElement[][] = generateMaze(mazeHorCells, mazeVerCells);
// let maze: MazeElement[][] = [
// 	[1, 1, 1, 1, 1, 1, 1],
// 	[1, 0, 0, 0, 1, 0, 1],
// 	[1, 0, 1, 0, 0, 0, 1],
// 	[1, 0, 1, 0, 1, 0, 1],
// 	[1, 2, 1, 0, 1, 3, 1],
// 	[1, 1, 1, 1, 1, 1, 1]
// ];

// point te player towards the hallway instead of towards a wall
// Checks if the cell to the right of the player is a wall, if so, point the player down (90), else to the right (0)
let playerAngle = maze[1][2] === MazeElement.WALL ? 90 : 0;

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

const Bangle = {
	setLCDMode: (type: string) => {
	},
};

let context: CanvasRenderingContext2D;
let contextDebug: CanvasRenderingContext2D;
window.onload = () => {
	const canvas: HTMLCanvasElement | null = document.getElementById('canvas') as HTMLCanvasElement | null;

	if (canvas) {
		canvas.width = screenWidth;
		canvas.height = screenHeight;
		const tempContext = canvas.getContext('2d');
		if (tempContext) {
			context = tempContext;
		} else {
			console.error('Failed to get the 2d canvas context');
		}
	} else {
		console.error('Failed to find canvas element');
	}

	const canvasDebug: HTMLCanvasElement | null = document.getElementById('canvas-debug') as HTMLCanvasElement | null;
	if (canvasDebug) {
		canvasDebug.width = debugWidth;
		canvasDebug.height = debugHeight;
		const tempContext = canvasDebug.getContext('2d');
		if (tempContext) {
			contextDebug = tempContext;
		} else {
			console.error('Failed to get the 2d canvas context for debug');
		}
	} else {
		console.error('Failed to find canvas element for debug');
	}
};

const g = {
	setPixel: (x: number, y: number) => {
		context.fillStyle = '#000000';
		context.fillRect(x, y, 1, 1);
	},
	clear: () => {
		context.fillStyle = '#EEEEEE';
		context.fillRect(0, 0, screenWidth, screenHeight);
		context.fillStyle = '#000000';
	},
	flip: () => {
	},
	getWidth: () => screenWidth,
	getHeight: () => screenHeight,
};

function cos(deg: number) {
	return Math.cos(((deg + 360) % 360) / 180 * Math.PI);
}

function sin(deg: number) {
	return Math.sin(((deg + 360) % 360) / 180 * Math.PI);
}

function tan(deg: number) {
	return Math.tan(((deg + 360) % 360) / 180 * Math.PI);
}

const BTN1 = {
	read: () => buttons.BTN1.active,
};

const BTN2 = {
	read: () => buttons.BTN2.active,
};

const BTN3 = {
	read: () => false,
};

const BTN4 = {
	read: () => buttons.BTN4.active,
};

const BTN5 = {
	read: () => buttons.BTN5.active,
};


let globals: {
	Bangle: any,
	g: any,
	BTN1: { read: () => boolean },
	BTN2: { read: () => boolean },
	BTN3: { read: () => boolean },
	BTN4: { read: () => boolean },
	BTN5: { read: () => boolean },
};

globals = {
	Bangle,
	g,
	BTN1,
	BTN2,
	BTN3,
	BTN4,
	BTN5
};

type ButtonIndex = 'BTN1' | 'BTN2' | 'BTN3' | 'BTN4' | 'BTN5';

interface Point {
	x: number;
	y: number;
}

interface ButtonInfo {
	name: 'up' | 'down' | 'menu' | 'left' | 'right';
	code: 9 | 37 | 38 | 39 | 40;
	bangleVar: ButtonIndex;
	active: boolean;
}

const buttons: { [key in ButtonIndex]: ButtonInfo } = {
	BTN1: {
		name: 'up',
		code: 38,
		bangleVar: 'BTN1',
		active: false,
	},
	BTN2: {
		name: 'down',
		code: 40,
		bangleVar: 'BTN2',
		active: false,
	},
	BTN3: {
		name: 'menu',
		code: 9,
		bangleVar: 'BTN3',
		active: false,
	},
	BTN4: {
		name: 'left',
		code: 37,
		bangleVar: 'BTN4',
		active: false,
	},
	BTN5: {
		name: 'right',
		code: 39,
		bangleVar: 'BTN5',
		active: false,
	},
};

[{ prop: 'keyup', active: false }, { prop: 'keydown', active: true }].forEach((eventType) => {
	document.addEventListener(eventType.prop as 'keyup' | 'keydown', (event: KeyboardEvent) => {
		(Object.keys(buttons) as ButtonIndex[]).forEach((key: ButtonIndex) => {
			if ((event.which || event.keyCode) === buttons[key].code) {
				buttons[key].active = eventType.active;
			}
		});
	});
});

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

globals.Bangle.setLCDMode('doublebuffered');

let W = globals.g.getWidth();
let H = globals.g.getHeight();
// g.setFontAlign(0,-1);

console.log('screen: ', W, H);

let MAX_DISTANCE = Math.sqrt(
	(maze.length - 2) *
	(maze.length - 2) +
	(maze[0].length - 2) *
	(maze[0].length - 2)
);

function gameStop() {
	running = false;
	globals.g.clear();
	globals.g.drawString('Game Over!', 120, (H - 6) / 2);
	globals.g.flip();
}

function gameStart() {
	running = true;
}

function drawDebugGrid() {
	contextDebug.fillStyle = '#FFFFFF';
	contextDebug.clearRect(0, 0, debugWidth, debugHeight);

	// draw grid
	contextDebug.strokeStyle = '#000000';
	for (let row = 0; row < maze.length; row++) {
		for (let col = 0; col < maze[0].length; col++) {
			const mazeItem = maze[row][col];
			contextDebug.strokeStyle = '#333333';
			if (mazeItem === 1) {
				contextDebug.fillStyle = '#000000';
			} else if (mazeItem === 3) {
				contextDebug.fillStyle = '#00FF00';
			} else {
				contextDebug.fillStyle = '#FFFFFF';
			}
			contextDebug.fillRect(col * debugCellSize, row * debugCellSize, debugCellSize, debugCellSize);
			contextDebug.strokeRect(col * debugCellSize, row * debugCellSize, debugCellSize, debugCellSize);
		}
	}

	// draw player
	contextDebug.fillStyle = '#0000FF';
	contextDebug.fillRect(playerX * debugCellSize - 3, playerY * debugCellSize - 3, 7, 7);

	// draw viewAngle
	contextDebug.strokeStyle = '#666666';
	contextDebug.beginPath();
	contextDebug.moveTo(playerX * debugCellSize, playerY * debugCellSize);
	contextDebug.lineTo(playerX * debugCellSize + 1000 * cos(playerAngle - viewAngleWidth / 2), playerY * debugCellSize + 1000 * sin(playerAngle - viewAngleWidth / 2));
	contextDebug.stroke();
	contextDebug.beginPath();
	contextDebug.moveTo(playerX * debugCellSize, playerY * debugCellSize);
	contextDebug.lineTo(playerX * debugCellSize + 1000 * cos(playerAngle + viewAngleWidth / 2), playerY * debugCellSize + 1000 * sin(playerAngle + viewAngleWidth / 2));
	contextDebug.stroke();
}

function drawDebugPixel(x: number, y: number, color: string = '#ff8e00') {
	contextDebug.fillStyle = color;
	contextDebug.fillRect(x * debugCellSize - 1, y * debugCellSize - 1, 3, 3);
}

function drawDebugLine(x1: number, y1: number, x2: number, y2: number, color: string = 'rgba(200, 200, 200, 0.5)') {
	contextDebug.strokeStyle = color;
	contextDebug.beginPath();
	contextDebug.moveTo(x1 * debugCellSize, y1 * debugCellSize);
	contextDebug.lineTo(x2 * debugCellSize, y2 * debugCellSize);
	contextDebug.stroke();
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
function getCollisionDistance(viewAngle: number, outerRay: boolean): Point {
	const quadrant = Math.floor(viewAngle / 90);

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
		isFacingUp = quadrant === 2 || quadrant === 3;
		// horizontal intersection
		if (!horCollision) {
			if (!initialHorIntersectionX) {
				if (isFacingUp) {
					initialHorIntersectionY = Math.floor(playerY);
				} else {
					initialHorIntersectionY = Math.floor(playerY) + 1;
				}
				initialHorIntersectionX = playerX - (playerY - initialHorIntersectionY) / tan(viewAngle);
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
			if (isOutsideMaze(maze, horGridLocation) || maze[horGridLocation.y][horGridLocation.x] === 1) {
				outerRay ? drawDebugPixel(horIntersectionX, horIntersectionY) : () => {
				};
				horCollision = { x: horIntersectionX, y: horIntersectionY };
			} else {
				outerRay ? drawDebugPixel(horIntersectionX, horIntersectionY, '#FF0000') : () => {
				};
			}
		}

		// Vertical intersection
		isFacingRight = quadrant === 0 || quadrant === 3;

		if (!vertCollision) {
			if (!initialVertIntersectionX) {
				if (isFacingRight) {
					initialVertIntersectionX = Math.floor(playerX) + 1;
				} else {
					initialVertIntersectionX = Math.floor(playerX);
				}
				initialVertIntersectionY = playerY - (playerX - initialVertIntersectionX) * tan(viewAngle);
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
			if (isOutsideMaze(maze, vertGridLocation) || maze[vertGridLocation.y][vertGridLocation.x] === 1) {
				outerRay ? drawDebugPixel(vertIntersectionX, vertIntersectionY) : () => {
				};
				vertCollision = { x: vertIntersectionX, y: vertIntersectionY };
			} else {
				outerRay ? drawDebugPixel(vertIntersectionX, vertIntersectionY, '#FF0000') : () => {
				};
			}
		}
		intersectionOffset++;
	}
	const horDistance = getSquareDistance(playerX, playerY, horCollision.x, horCollision.y);
	const vertDistance = getSquareDistance(playerX, playerY, vertCollision.x, vertCollision.y);
	const closestCollision: Point = horDistance < vertDistance ? horCollision : vertCollision;
	outerRay ? drawDebugPixel(closestCollision.x, closestCollision.y, '#00FF00') : () => {
	};
	drawDebugLine(playerX, playerY, closestCollision.x, closestCollision.y);

	if (!closestCollision) {
		throw new Error('intersection is null');
	}

	return closestCollision;
}

const mapRange = (val: number, in_min: number, in_max: number, out_min: number, out_max: number) => {
	return (val - in_min) / (in_max - in_min) * (out_max - out_min) + out_min;
};

function drawPixel(x: number, y: number) {
	// console.log('drawPixel: ', x, y);
	if (x >= 0 && x < W && y >= 0 && y < H) {
		globals.g.setPixel(x, y);
	}
}

function drawVerticalLine(x: number, y1: number, y2: number) {
	for (let i = y1; i <= y2; i++) {
		drawPixel(x, i);
	}
}

interface CollisionInfo {
	angle: number;
	collision: Point;
	distance: number;
	shouldDrawWall: boolean;
}

function drawWalls() {
	console.log('--------------------------');
	drawDebugGrid();

	console.log('player angle: ', playerAngle);

	const startAngle = (playerAngle - viewAngleWidth / 2 + 360) % 360;
	const raytraceStepAngle = viewAngleWidth / W;
	const anglesCollisionsAndDistances: CollisionInfo[] = [];
	for (let i = 0; i < W; i += 1) {
		const viewAngle = (startAngle + raytraceStepAngle * i + 360) % 360;
		const collision: Point = getCollisionDistance(viewAngle, i === 0 || i >= W - 1);
		const directDistance = Math.sqrt(getSquareDistance(playerX, playerY, collision.x, collision.y));
		const perpendicularDistance = directDistance * cos((viewAngle - playerAngle + 360) % 360);

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
			(topLeftCell === 1 ? '1' : '0') +
			(topRightCell === 1 ? '1' : '0') +
			(bottomLeftCell === 1 ? '1' : '0') +
			(bottomRightCell === 1 ? '1' : '0');
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
		let wallHeight = screenHeight / collisionInfo.distance;

		if (collisionInfo.shouldDrawWall) {
			drawVerticalLine(index, Math.round((H - wallHeight) / 2), Math.round((H - wallHeight) / 2 + wallHeight));
		} else {
			drawPixel(index, Math.round((H - wallHeight) / 2));
			drawPixel(index, Math.round((H - wallHeight) / 2 + wallHeight));
		}
	});
}

function isInsideWall(playerX: number, playerY: number) {
	return maze[Math.floor(playerY)][Math.floor(playerX)] === MazeElement.WALL;
}

function movePlayer(deltaX: number, deltaY: number) {
	// Try moving in both directions
	let newPlayerX = playerX + deltaX;
	let newPlayerY = playerY + deltaY;
	if (!isInsideWall(newPlayerX, newPlayerY)) {
		playerX = newPlayerX;
		playerY = newPlayerY;
		return;
	}
	// Try moving in the y direction only
	newPlayerX = playerX;
	newPlayerY = playerY + deltaY;
	if (!isInsideWall(newPlayerX, newPlayerY)) {
		playerX = newPlayerX;
		playerY = newPlayerY;
		return;
	}
	// Try moving in the x direction only
	newPlayerX = playerX + deltaX;
	newPlayerY = playerY;
	if (!isInsideWall(newPlayerX, newPlayerY)) {
		playerX = newPlayerX;
		playerY = newPlayerY;
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

function onFrame() {
	// let t = getTime();
	// let d = (lastFrame===undefined)?0:(t-lastFrame)*20;
	// lastFrame = t;

	// if (!isBangle) {
	// 	playerAngle = ((playerAngle + 1) + 360) % 360;
	// }

	if (globals.BTN4.read()) {
		console.log('left');
		playerAngle = ((playerAngle - angleStep) + 360) % 360;
	}
	if (globals.BTN5.read()) {
		console.log('right');
		playerAngle = ((playerAngle + angleStep) + 360) % 360;
	}
	if (globals.BTN1.read()) {
		console.log('forward');

		const quadrant = Math.floor(playerAngle / 90);
		const isFacingUp = quadrant === 2 || quadrant === 3;
		const isFacingRight = quadrant === 0 || quadrant === 3;
		const playerXDelta = Math.abs(cos(playerAngle) * playerStepSize) * (isFacingRight ? 1 : -1);
		const playerYDelta = Math.abs(sin(playerAngle) * playerStepSize) * (isFacingUp ? -1 : 1);
		movePlayer(playerXDelta, playerYDelta);
	}
	if (globals.BTN2.read()) {
		console.log('backward');

		const quadrant = Math.floor(playerAngle / 90);
		const isFacingUp = quadrant === 2 || quadrant === 3;
		const isFacingRight = quadrant === 0 || quadrant === 3;
		const playerXDelta = Math.abs(cos(playerAngle) * playerStepSize) * (isFacingRight ? -1 : 1);
		const playerYDelta = Math.abs(sin(playerAngle) * playerStepSize) * (isFacingUp ? 1 : -1);
		movePlayer(playerXDelta, playerYDelta);
	}

	if (!running) {
		// if (BTNA.read()) gameStart();
		return;
	}

	if (lastPlayerX !== playerX ||
		lastPlayerY !== playerY ||
		lastPlayerAngle !== playerAngle) {
		console.log('start draw cycle');
		globals.g.clear();
		drawWalls();
		globals.g.flip();
		console.log('finished draw cycle');
	}

	lastPlayerX = playerX;
	lastPlayerY = playerY;
	lastPlayerAngle = playerAngle;
	setTimeout(onFrame, 50);
}

// gameStart();
setTimeout(onFrame, 500);
console.log('starting maze runner');
