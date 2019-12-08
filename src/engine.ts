import { ScreenIoOperations, MazeElement, Point, Quadrant } from './types';
import { clampDeg, cos, generateMaze, getSquareDistance, isOutsideMaze, sin, tan, trace } from './utils';

const mazeWidth = 10;
const mazeHeight = 6;
const screenWidth = 240;
const screenHeight = 160;
const playerX = 1.5;
const playerY = 1.5;
const viewAngleWidth = 70;
const angleStep = 7;
const playerStepSize = 0.1;
const mazeHorCells = mazeWidth * 2 + 1;
const mazeVerCells = mazeHeight * 2 + 1;
const SKIP_RENDER_RAYS = 1; // 1 => renders all 240 rays, 8 => renders only 240/8 rays

// printFreeSpace('before maze');
const maze: MazeElement[][] = generateMaze(mazeHorCells, mazeVerCells);
// printFreeSpace('after maze');
// let maze: MazeElement[][] = [
// 	[1, 1, 1, 1, 1, 1, 1],
// 	[1, 0, 0, 0, 1, 0, 1],
// 	[1, 0, 1, 0, 0, 0, 1],
// 	[1, 0, 1, 0, 1, 0, 1],
// 	[1, 2, 1, 0, 1, 3, 1],
// 	[1, 1, 1, 1, 1, 1, 1]
// ];

const playerAngle: number = (maze[1][2] === MazeElement.WALL ? 90 : 0);

// Game variables
const gameVars = {
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
	playerX,
	playerY,
	maze,
	// point te player towards the hallway instead of towards a wall
	// Checks if the cell to the right of the player is a wall, if so, point the player down (90), else to the right (0)
	playerAngle,

	startGame: (screenIo: ScreenIoOperations) => {
	},
	stopGame: () => {
	},
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

function startGame(screenIo: ScreenIoOperations) {
	running = true;
	onFrame(screenIo);
}

function stopGame() {
	running = false;
	// globals.g.clear();
	// globals.g.drawString('Game Over!', 120, (gameVariables.screenHeight - 6) / 2);
	// globals.g.flip();
}

/**
 * https://www.permadi.com/tutorial/raycast/rayc7.html
 */
function getCollisionDistance(viewAngle: number, outerRay: boolean, debugOperations: ScreenIoOperations): Point {
	// printFreeSpace('before getCollisionDistance');
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

	trace('01 collision start hor');
	while (!horCollision || !vertCollision) {
		isFacingUp = quadrant === Quadrant.TopLeft || quadrant === Quadrant.TopRight;
		// horizontal intersection
		if (!horCollision) {
			if (!initialHorIntersectionX) {
				if (isFacingUp) {
					initialHorIntersectionY = Math.floor(gameVars.playerY);
				} else {
					initialHorIntersectionY = Math.floor(gameVars.playerY) + 1;
				}
				initialHorIntersectionX = gameVars.playerX - (gameVars.playerY - initialHorIntersectionY) / tan(viewAngle);
			}

			trace('02 after hor intersect');
			if (intersectionOffset !== 0 && !horizontalOffsetX) {
				if (isFacingUp) {
					horizontalOffsetY = -1;
				} else {
					horizontalOffsetY = 1;
				}
				horizontalOffsetX = 1 / tan(viewAngle);
			}
			trace('03 after hor offset');

			horIntersectionX = initialHorIntersectionX + (horizontalOffsetX || 0) * intersectionOffset * (isFacingUp ? -1 : 1);
			horIntersectionY = initialHorIntersectionY as number + (horizontalOffsetY || 0) * intersectionOffset;
			horGridLocation = {
				x: Math.floor(horIntersectionX),
				y: Math.floor(horIntersectionY) + (isFacingUp ? -1 : 0),
			};

			trace('04 after hor grid location');
			if (isOutsideMaze(maze, horGridLocation) || maze[horGridLocation.y][horGridLocation.x] === MazeElement.WALL) {
				if (outerRay) {
					debugOperations.drawDebugPixel(horIntersectionX, horIntersectionY);
				}
				horCollision = { x: horIntersectionX, y: horIntersectionY };
			} else {
				if (outerRay) {
					debugOperations.drawDebugPixel(horIntersectionX, horIntersectionY, '#FF0000');
				}
			}

			trace('05 after hor found location');
		}

		// Vertical intersection
		trace('06 collision start vert');
		isFacingRight = quadrant === Quadrant.BottomRight || quadrant === Quadrant.TopRight;

		if (!vertCollision) {
			if (!initialVertIntersectionX) {
				if (isFacingRight) {
					initialVertIntersectionX = Math.floor(gameVars.playerX) + 1;
				} else {
					initialVertIntersectionX = Math.floor(gameVars.playerX);
				}
				initialVertIntersectionY = gameVars.playerY - (gameVars.playerX - initialVertIntersectionX) * tan(viewAngle);
			}
			trace('07 after vert intersect');
			if (intersectionOffset !== 0 && !verticalOffsetX) {
				verticalOffsetX = isFacingRight ? 1 : -1;
				verticalOffsetY = Math.abs(tan(viewAngle)) * (isFacingUp ? -1 : 1);
			}
			trace('08 after vert offset');

			vertIntersectionX = initialVertIntersectionX + (verticalOffsetX || 0) * intersectionOffset;
			vertIntersectionY = initialVertIntersectionY as number + (verticalOffsetY || 0) * intersectionOffset;
			vertGridLocation = {
				x: Math.floor(vertIntersectionX) + (isFacingRight ? 0 : -1),
				y: Math.floor(vertIntersectionY),
			};
			trace('09 after vert grid location');
			if (isOutsideMaze(maze, vertGridLocation) || maze[vertGridLocation.y][vertGridLocation.x] === MazeElement.WALL) {
				if (outerRay) {
					debugOperations.drawDebugPixel(vertIntersectionX, vertIntersectionY);
				}
				vertCollision = { x: vertIntersectionX, y: vertIntersectionY };
			} else {
				if (outerRay) {
					debugOperations.drawDebugPixel(vertIntersectionX, vertIntersectionY, '#FF0000');
				}
			}
			trace('10 after vert found location');
		}
		intersectionOffset++;
	}
	trace('11 after intersection found location');
	const horDistance = getSquareDistance(gameVars.playerX, gameVars.playerY, horCollision.x, horCollision.y);
	const vertDistance = getSquareDistance(gameVars.playerX, gameVars.playerY, vertCollision.x, vertCollision.y);
	const closestCollision: Point = horDistance < vertDistance ? horCollision : vertCollision;
	if (outerRay) {
		debugOperations.drawDebugPixel(closestCollision.x, closestCollision.y, '#00FF00');
	}
	debugOperations.drawDebugLine(gameVars.playerX, gameVars.playerY, closestCollision.x, closestCollision.y);

	if (!closestCollision) {
		throw new Error('intersection is null');
	}

	// printFreeSpace('after getCollisionDistance');
	trace('12 return intersection');
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

	const startAngle = clampDeg(gameVars.playerAngle - gameVars.viewAngleWidth / 2);
	const raytraceStepAngle = gameVars.viewAngleWidth / gameVars.screenWidth;
	const anglesCollisionsAndDistances: CollisionInfo[] = [];
	for (let i = 0; i < gameVars.screenWidth; i += SKIP_RENDER_RAYS) {
		const viewAngle = clampDeg(startAngle + raytraceStepAngle * i);
		const collision: Point = getCollisionDistance(viewAngle, i === 0 || i >= gameVars.screenWidth - 1, screenIo);
		const directDistance = Math.sqrt(getSquareDistance(gameVars.playerX, gameVars.playerY, collision.x, collision.y));
		const perpendicularDistance = directDistance * cos(clampDeg(viewAngle - gameVars.playerAngle));

		anglesCollisionsAndDistances.push({
			angle: viewAngle,
			collision,
			distance: perpendicularDistance,
			shouldDrawWall: false,
		});

		// let wallHeight = gameVars.screenHeight / perpendicularDistance;
		// screenIo.drawPixel(i, Math.round((gameVars.screenHeight - wallHeight) / 2));
		// screenIo.drawPixel(i, Math.round((gameVars.screenHeight - wallHeight) / 2 + wallHeight));
	}

	// Identify which rays should also draw a vertical line to identify corners
	// Find unique intersection point in the maze which are closest to each collision
	const intersectionPoints: { [coord: string]: Point } = {};
	anglesCollisionsAndDistances.forEach(angCollDis => {
		const intersectionX = Math.round(angCollDis.collision.x);
		const intersectionY = Math.round(angCollDis.collision.y);
		intersectionPoints[intersectionX + ';' + intersectionY] = { x: intersectionX, y: intersectionY };
	});

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
	let CORNERS: { [cornerKey: string]: boolean } = {
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
	// printFreeSpace('after corners');

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
	CORNERS = {};

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
		let wallHeight = gameVars.screenHeight / collisionInfo.distance;

		if (collisionInfo.shouldDrawWall) {
			screenIo.drawVerticalLine(index, Math.round((gameVars.screenHeight - wallHeight) / 2), Math.round((gameVars.screenHeight - wallHeight) / 2 + wallHeight));
		} else {
			screenIo.drawPixel(index, Math.round((gameVars.screenHeight - wallHeight) / 2));
			screenIo.drawPixel(index, Math.round((gameVars.screenHeight - wallHeight) / 2 + wallHeight));
		}
	});
}

function isInsideWall(playerX: number, playerY: number) {
	return maze[Math.floor(playerY)][Math.floor(playerX)] === MazeElement.WALL;
}

function movePlayer(deltaX: number, deltaY: number) {
	// Try moving in both directions
	let newPlayerX = gameVars.playerX + deltaX;
	let newPlayerY = gameVars.playerY + deltaY;
	if (!isInsideWall(newPlayerX, newPlayerY)) {
		gameVars.playerX = newPlayerX;
		gameVars.playerY = newPlayerY;
		return;
	}
	// Try moving in the y direction only
	newPlayerX = gameVars.playerX;
	newPlayerY = gameVars.playerY + deltaY;
	if (!isInsideWall(newPlayerX, newPlayerY)) {
		gameVars.playerX = newPlayerX;
		gameVars.playerY = newPlayerY;
		return;
	}
	// Try moving in the x direction only
	newPlayerX = gameVars.playerX + deltaX;
	newPlayerY = gameVars.playerY;
	if (!isInsideWall(newPlayerX, newPlayerY)) {
		gameVars.playerX = newPlayerX;
		gameVars.playerY = newPlayerY;
		return;
	}
}

let lastPlayerX: number | undefined;
let lastPlayerY: number | undefined;
let lastPlayerAngle: number | undefined;

function onFrame(screenIo: ScreenIoOperations) {
	// let t = getTime();
	// let d = (lastFrame===undefined)?0:(t-lastFrame)*20;
	// lastFrame = t;

	if (screenIo.BTN4.read()) {
		console.log('left');
		gameVars.playerAngle = clampDeg(gameVars.playerAngle - gameVars.angleStep);
	}
	if (screenIo.BTN5.read()) {
		console.log('right');
		gameVars.playerAngle = clampDeg(gameVars.playerAngle + gameVars.angleStep);
	}
	let quadrant: Quadrant;
	let isFacingUp: boolean;
	let isFacingRight: boolean;
	let playerXDelta: number;
	let playerYDelta: number;
	if (screenIo.BTN1.read()) {
		console.log('forward');

		quadrant = Math.floor(gameVars.playerAngle / 90);
		isFacingUp = quadrant === Quadrant.TopLeft || quadrant === Quadrant.TopRight;
		isFacingRight = quadrant === Quadrant.TopRight || quadrant === Quadrant.BottomRight;
		playerXDelta = Math.abs(cos(gameVars.playerAngle) * gameVars.playerStepSize) * (isFacingRight ? 1 : -1);
		playerYDelta = Math.abs(sin(gameVars.playerAngle) * gameVars.playerStepSize) * (isFacingUp ? -1 : 1);
		movePlayer(playerXDelta, playerYDelta);
	}
	if (screenIo.BTN2.read()) {
		console.log('backward');

		quadrant = Math.floor(gameVars.playerAngle / 90);
		isFacingUp = quadrant === Quadrant.TopLeft || quadrant === Quadrant.TopRight;
		isFacingRight = quadrant === Quadrant.TopRight || quadrant === Quadrant.BottomRight;
		playerXDelta = Math.abs(cos(gameVars.playerAngle) * gameVars.playerStepSize) * (isFacingRight ? -1 : 1);
		playerYDelta = Math.abs(sin(gameVars.playerAngle) * gameVars.playerStepSize) * (isFacingUp ? 1 : -1);
		movePlayer(playerXDelta, playerYDelta);
	}

	if (!running) {
		// if (BTNA.read()) gameStart();
		return;
	}

	if (lastPlayerX !== gameVars.playerX ||
		lastPlayerY !== gameVars.playerY ||
		lastPlayerAngle !== gameVars.playerAngle) {
		// console.log('start draw cycle');
		screenIo.clear();
		drawWalls(screenIo);
		screenIo.flip();
		// console.log('finished draw cycle');
	}

	lastPlayerX = gameVars.playerX;
	lastPlayerY = gameVars.playerY;
	lastPlayerAngle = gameVars.playerAngle;
	setTimeout(() => onFrame(screenIo), 50);
}

gameVars.startGame = startGame;
gameVars.stopGame = stopGame;

export const gameVariables = gameVars;

// printFreeSpace('after engine loaded');
