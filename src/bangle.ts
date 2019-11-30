import { Button, ScreenIoOperations } from './types';
import { gameVariables } from './engine';

declare const Bangle: any;
declare const g: any;
declare const BTN1: Button;
declare const BTN2: Button;
declare const BTN3: Button;
declare const BTN4: Button;
declare const BTN5: Button;

Bangle.setLCDMode('doublebuffered');

function drawPixel(x: number, y: number, color?: string) {
	g.setPixel(x, y);
}

function drawVerticalLine(x: number, y1: number, y2: number) {
	g.drawLine(x, y1, x, y2);
}

function clear() {
	g.clear();
}

function flip() {
	g.flip();
}

const screenIo: ScreenIoOperations = {
	BTN1,
	BTN2,
	BTN3,
	BTN4,
	BTN5,
	drawPixel,
	drawVerticalLine,
	clear,
	flip,
	drawDebugGrid: () => {},
	drawDebugLine: () => {},
	drawDebugPixel: () => {},
};

g.setFontAlign(0,-1);
g.clear();
g.drawString("Press button 2 to start game ==>",120,(g.getHeight()-6)/2);

function checkForStart() {
	if (BTN2.read()) {
		console.log('starting game');
		gameVariables.startGame(screenIo);
	} else {
		setTimeout(checkForStart, 16);
	}
}

console.log('starting maze runner');
checkForStart();
