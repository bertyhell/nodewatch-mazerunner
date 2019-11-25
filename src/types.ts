export const enum MazeElement {
	UNVISITED_EMPTY = -1,
	EMPTY = 0,
	WALL = 1,
	PLAYER = 2,
	END = 3,
}

export const enum Quadrant {
	BottomRight = 0,
	BottomLeft = 1,
	TopLeft = 2,
	TopRight = 3,
}

export type ButtonIndex = 'BTN1' | 'BTN2' | 'BTN3' | 'BTN4' | 'BTN5';

export interface Point {
	x: number;
	y: number;
}

export interface ScreenIoOperations {
	drawPixel: (x: number, y: number) => void;
	drawVerticalLine: (x: number, y1: number, y2: number) => void;
	flip: () => void;
	clear: () => void;
	BTN1: Button;
	BTN2: Button;
	BTN3: Button;
	BTN4: Button;
	BTN5: Button;

	drawDebugGrid: (maze: MazeElement[][]) => void;
	drawDebugPixel: (x: number, y: number, color?: string) => void;
	drawDebugLine: (x1: number, y1: number, x2: number, y2: number, color?: string) => void;
}

export interface Button {
	read: () => boolean;
}
