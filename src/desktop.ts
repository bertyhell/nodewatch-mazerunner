import { gameVariables } from './engine';
import { ButtonIndex, MazeElement, ScreenIoOperations } from './types';
import { clampDeg, cos, sin } from './utils';

const debugCellSize = 40;
const showDebug = true;

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

function clear() {
	context.fillStyle = '#EEEEEE';
	context.fillRect(0, 0, gameVariables.screenWidth, gameVariables.screenHeight);
	context.fillStyle = '#000000';
}

function flip() {
}

const screenIo: ScreenIoOperations = {
	BTN1: {
		read: () => buttons.BTN1.active,
	},
	BTN2: {
		read: () => buttons.BTN2.active,
	},
	BTN3: {
		read: () => buttons.BTN3.active,
	},
	BTN4: {
		read: () => buttons.BTN4.active,
	},
	BTN5: {
		read: () => buttons.BTN5.active,
	},
	drawPixel,
	drawVerticalLine,
	clear,
	flip,
	drawDebugGrid: showDebug ? drawDebugGrid : () => {},
	drawDebugLine: showDebug ? drawDebugLine : () => {},
	drawDebugPixel: showDebug ? drawDebugPixel : () => {},
};

let context: CanvasRenderingContext2D;
let contextDebug: CanvasRenderingContext2D;
window.onload = () => {
	const canvas: HTMLCanvasElement | null = document.getElementById('canvas') as HTMLCanvasElement | null;

	if (canvas) {
		canvas.width = gameVariables.screenWidth;
		canvas.height = gameVariables.screenHeight;
		const tempContext = canvas.getContext('2d');
		if (tempContext) {
			context = tempContext;
		} else {
			console.error('Failed to get the 2d canvas context');
		}
	} else {
		console.error('Failed to find canvas element');
	}

	if (showDebug) {
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
	}

	gameVariables.startGame(screenIo);
	console.log('starting maze runner');
};

const debugWidth = gameVariables.mazeHorCells * debugCellSize;
const debugHeight = gameVariables.mazeVerCells * debugCellSize;

function drawDebugGrid(maze: MazeElement[][]) {
	contextDebug.fillStyle = '#FFFFFF';
	contextDebug.clearRect(0, 0, debugWidth, debugHeight);

	// draw grid
	contextDebug.strokeStyle = '#000000';
	for (let row = 0; row < maze.length; row++) {
		for (let col = 0; col < maze[0].length; col++) {
			const mazeItem = maze[row][col];
			contextDebug.strokeStyle = '#333333';
			if (mazeItem === MazeElement.WALL) {
				contextDebug.fillStyle = '#000000';
			} else if (mazeItem === MazeElement.END) {
				contextDebug.fillStyle = '#00FF00';
			} else { // Empty
				contextDebug.fillStyle = '#FFFFFF';
			}
			contextDebug.fillRect(col * debugCellSize, row * debugCellSize, debugCellSize, debugCellSize);
			contextDebug.strokeRect(col * debugCellSize, row * debugCellSize, debugCellSize, debugCellSize);
		}
	}

	// draw player
	contextDebug.fillStyle = '#0000FF';
	contextDebug.fillRect(gameVariables.playerX * debugCellSize - 3, gameVariables.playerY * debugCellSize - 3, 7, 7);

	// draw viewAngle
	contextDebug.strokeStyle = '#666666';
	contextDebug.beginPath();
	contextDebug.moveTo(gameVariables.playerX * debugCellSize, gameVariables.playerY * debugCellSize);
	contextDebug.lineTo(gameVariables.playerX * debugCellSize + 1000 * cos(clampDeg(gameVariables.playerAngle - gameVariables.viewAngleWidth / 2)), gameVariables.playerY * debugCellSize + 1000 * sin(clampDeg(gameVariables.playerAngle - gameVariables.viewAngleWidth / 2)));
	contextDebug.stroke();
	contextDebug.beginPath();
	contextDebug.moveTo(gameVariables.playerX * debugCellSize, gameVariables.playerY * debugCellSize);
	contextDebug.lineTo(gameVariables.playerX * debugCellSize + 1000 * cos(clampDeg(gameVariables.playerAngle + gameVariables.viewAngleWidth / 2)), gameVariables.playerY * debugCellSize + 1000 * sin(clampDeg(gameVariables.playerAngle + gameVariables.viewAngleWidth / 2)));
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

function drawPixel(x: number, y: number) {
	if (x >= 0 && x < gameVariables.screenWidth && y >= 0 && y < gameVariables.screenHeight) {
		context.fillStyle = '#000000';
		context.fillRect(x, y, 1, 1);
	}
}

function drawVerticalLine(x: number, y1: number, y2: number) {
	for (let i = y1; i <= y2; i++) {
		drawPixel(x, i);
	}
}
