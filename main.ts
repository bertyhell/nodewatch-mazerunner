// const isBangle = process && process.env && process.env.BOARD === 'BANGLEJS';

let playerX = 1.5;
let playerY = 4.5;
let playerAngle = 270;
let viewAngleWidth = 90;
let angleStep = 5;
let playerStepSize = 0.1;
let verticalWallEpsilon = 0.01; // collisions with walls within this margin will draw a vertical wall

enum MazeElement {
	EMPTY = 0,
	WALL = 1,
	PLAYER = 2,
	END = 3,
}

let maze: MazeElement[][] = [
	[1, 1, 1, 1, 1, 1, 1],
	[1, 0, 0, 0, 1, 0, 1],
	[1, 0, 1, 0, 0, 0, 1],
	[1, 0, 1, 0, 1, 0, 1],
	[1, 2, 1, 0, 1, 3, 1],
	[1, 1, 1, 1, 1, 1, 1]
];

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
		context.fillRect(0, 0, 240, 160);
		context.fillStyle = '#000000';
	},
	flip: () => {
	},
	getWidth: () => 240,
	getHeight: () => 160,
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

const debugWidth = 70 * 4 + 1;
const debugHeight = 60 * 4 + 1;

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
			contextDebug.fillRect(col * 40, row * 40, 40, 40);
			contextDebug.strokeRect(col * 40, row * 40, 40, 40);
		}
	}

	// draw player
	contextDebug.fillStyle = '#0000FF';
	contextDebug.fillRect(playerX * 40 - 3, playerY * 40 - 3, 7, 7);

	// draw viewAngle
	contextDebug.strokeStyle = '#666666';
	// contextDebug.moveTo(playerX * 40, playerY * 40);
	// contextDebug.lineTo(playerX * 40 + 1000 * cos(playerAngle), playerY * 40 + 1000 * sin(playerAngle));
	// contextDebug.stroke();
	contextDebug.beginPath();
	contextDebug.moveTo(playerX * 40, playerY * 40);
	contextDebug.lineTo(playerX * 40 + 1000 * cos(playerAngle - viewAngleWidth / 2), playerY * 40 + 1000 * sin(playerAngle - viewAngleWidth / 2));
	contextDebug.stroke();
	contextDebug.beginPath();
	contextDebug.moveTo(playerX * 40, playerY * 40);
	contextDebug.lineTo(playerX * 40 + 1000 * cos(playerAngle + viewAngleWidth / 2), playerY * 40 + 1000 * sin(playerAngle + viewAngleWidth / 2));
	contextDebug.stroke();
}

function drawDebugPixel(x: number, y: number, color: string = '#ff8e00') {
	contextDebug.fillStyle = color;
	contextDebug.fillRect(x * 40 - 1, y * 40 - 1, 3, 3);
}

function drawDebugLine(x1: number, y1: number, x2: number, y2: number, color: string = 'rgba(200, 200, 200, 0.5)') {
	contextDebug.strokeStyle = color;
	contextDebug.beginPath();
	contextDebug.moveTo(x1 * 40, y1 * 40);
	contextDebug.lineTo(x2 * 40, y2 * 40);
	contextDebug.stroke();
}

function getSquareDistance(x1: number, y1: number, x2: number, y2: number) {
	return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
}

function areOutsideMaze(x: number, y: number): boolean {
	return !(x >= 0 && x < maze[0].length && y >= 0 && y < maze.length);
}

/**
 * https://www.permadi.com/tutorial/raycast/rayc7.html
 */
function getCollisionDistance(viewAngle: number, outerRay: boolean): [number, boolean] {
	const quadrant = Math.floor(viewAngle / 90);

	let horCollision: [number, number] | undefined; // first intersection with a wall
	let vertCollision: [number, number] | undefined; // first intersection with a wall
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
	let horGridX;
	let horGridY;
	let vertIntersectionX: number;
	let vertIntersectionY: number;
	let vertGridX;
	let vertGridY;

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
			horGridX = Math.floor(horIntersectionX);
			horGridY = Math.floor(horIntersectionY) + (isFacingUp ? -1 : 0);
			if (areOutsideMaze(horGridX, horGridY) || maze[horGridY][horGridX] === 1) {
				outerRay ? drawDebugPixel(horIntersectionX, horIntersectionY) : () => {
				};
				horCollision = [horIntersectionX, horIntersectionY];
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
			vertGridX = Math.floor(vertIntersectionX) + (isFacingRight ? 0 : -1);
			vertGridY = Math.floor(vertIntersectionY);
			if (areOutsideMaze(vertGridX, vertGridY) || maze[vertGridY][vertGridX] === 1) {
				outerRay ? drawDebugPixel(vertIntersectionX, vertIntersectionY) : () => {
				};
				vertCollision = [vertIntersectionX, vertIntersectionY];
			} else {
				outerRay ? drawDebugPixel(vertIntersectionX, vertIntersectionY, '#FF0000') : () => {
				};
			}
		}
		intersectionOffset++;
	}
	const horDistance = getSquareDistance(playerX, playerY, horCollision[0], horCollision[1]);
	const vertDistance = getSquareDistance(playerX, playerY, vertCollision[0], vertCollision[1]);
	const closestCollision = horDistance < vertDistance ? horCollision : vertCollision;
	outerRay ? drawDebugPixel(closestCollision[0], closestCollision[1], '#00FF00') : () => {
	};
	drawDebugLine(playerX, playerY, closestCollision[0], closestCollision[1]);

	if (!closestCollision) {
		throw new Error('intersection is null');
	}

	const directDistance = Math.sqrt(getSquareDistance(playerX, playerY, closestCollision[0], closestCollision[1]));
	const perpendicularDistance = directDistance * cos((viewAngle - playerAngle + 360) % 360);
	// const perpendicularDistance = (intersection[0] - playerX) * cos(playerAngle) +
	// 	(playerY - intersection[1]) * sin(playerAngle);
	const isAtMazeIntersection = closestCollision[0] % 1 < verticalWallEpsilon && closestCollision[1] % 1 < verticalWallEpsilon;
	return [perpendicularDistance, isAtMazeIntersection];
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
	for(let i = y1; i <= y2; i++) {
		drawPixel(x, i);
	}
}

function drawWalls() {
	console.log('--------------------------');
	drawDebugGrid();

	console.log('player angle: ', playerAngle);

	const startAngle = (playerAngle - viewAngleWidth / 2 + 360) % 360;
	const raytraceStepAngle = viewAngleWidth / W;
	for (let i = 0; i < W; i += 1) {
		const viewAngle = (startAngle + raytraceStepAngle * i + 360) % 360;
		const [collisionDistance, isMazeIntersection] = getCollisionDistance(viewAngle, i === 0 || i >= W - 1);

		if (collisionDistance) {
			// 64 => 240
			// 5 * 64 => 120
			// let wallHeight = mapRange(Math.sqrt(collisionDistance), 0.3, Math.sqrt(MAX_DISTANCE), 160, 10);
			let wallHeight = 160 / collisionDistance;

			if (isMazeIntersection) {
				// draw line
				drawVerticalLine(i, Math.round((H - wallHeight) / 2), Math.round((H - wallHeight) / 2 + wallHeight));
			} else {
				// draw top and bottom of the wall
				drawPixel(i, Math.round((H - wallHeight) / 2));
				drawPixel(i, Math.round((H - wallHeight) / 2 + wallHeight));
			}
		} else {
			console.error('failed to find an intersection');
		}
	}
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
