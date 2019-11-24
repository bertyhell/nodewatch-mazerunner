"use strict";
// const isBangle = process && process.env && process.env.BOARD === 'BANGLEJS';
var playerX = 1.5;
var playerY = 4.5;
var playerAngle = 270;
var viewAngleWidth = 90;
var angleStep = 5;
var playerStepSize = 0.1;
var verticalWallEpsilon = 0.01; // collisions with walls within this margin will draw a vertical wall
var MazeElement;
(function (MazeElement) {
    MazeElement[MazeElement["EMPTY"] = 0] = "EMPTY";
    MazeElement[MazeElement["WALL"] = 1] = "WALL";
    MazeElement[MazeElement["PLAYER"] = 2] = "PLAYER";
    MazeElement[MazeElement["END"] = 3] = "END";
})(MazeElement || (MazeElement = {}));
var maze = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [1, 2, 1, 0, 1, 3, 1],
    [1, 1, 1, 1, 1, 1, 1]
];
var running = true;
var Bangle = {
    setLCDMode: function (type) {
    }
};
var context;
var contextDebug;
window.onload = function () {
    var canvas = document.getElementById('canvas');
    if (canvas) {
        var tempContext = canvas.getContext('2d');
        if (tempContext) {
            context = tempContext;
        }
        else {
            console.error('Failed to get the 2d canvas context');
        }
    }
    else {
        console.error('Failed to find canvas element');
    }
    var canvasDebug = document.getElementById('canvas-debug');
    if (canvasDebug) {
        var tempContext = canvasDebug.getContext('2d');
        if (tempContext) {
            contextDebug = tempContext;
        }
        else {
            console.error('Failed to get the 2d canvas context for debug');
        }
    }
    else {
        console.error('Failed to find canvas element for debug');
    }
};
var g = {
    setPixel: function (x, y) {
        context.fillStyle = '#000000';
        context.fillRect(x, y, 1, 1);
    },
    clear: function () {
        context.fillStyle = '#EEEEEE';
        context.fillRect(0, 0, 240, 160);
        context.fillStyle = '#000000';
    },
    flip: function () {
    },
    getWidth: function () { return 240; },
    getHeight: function () { return 160; }
};
function cos(deg) {
    return Math.cos(((deg + 360) % 360) / 180 * Math.PI);
}
function sin(deg) {
    return Math.sin(((deg + 360) % 360) / 180 * Math.PI);
}
function tan(deg) {
    return Math.tan(((deg + 360) % 360) / 180 * Math.PI);
}
var BTN1 = {
    read: function () { return buttons.BTN1.active; }
};
var BTN2 = {
    read: function () { return buttons.BTN2.active; }
};
var BTN3 = {
    read: function () { return false; }
};
var BTN4 = {
    read: function () { return buttons.BTN4.active; }
};
var BTN5 = {
    read: function () { return buttons.BTN5.active; }
};
var globals;
globals = {
    Bangle: Bangle,
    g: g,
    BTN1: BTN1,
    BTN2: BTN2,
    BTN3: BTN3,
    BTN4: BTN4,
    BTN5: BTN5
};
var buttons = {
    BTN1: {
        name: 'up',
        code: 38,
        bangleVar: 'BTN1',
        active: false
    },
    BTN2: {
        name: 'down',
        code: 40,
        bangleVar: 'BTN2',
        active: false
    },
    BTN3: {
        name: 'menu',
        code: 9,
        bangleVar: 'BTN3',
        active: false
    },
    BTN4: {
        name: 'left',
        code: 37,
        bangleVar: 'BTN4',
        active: false
    },
    BTN5: {
        name: 'right',
        code: 39,
        bangleVar: 'BTN5',
        active: false
    }
};
[{ prop: 'keyup', active: false }, { prop: 'keydown', active: true }].forEach(function (eventType) {
    document.addEventListener(eventType.prop, function (event) {
        Object.keys(buttons).forEach(function (key) {
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
var W = globals.g.getWidth();
var H = globals.g.getHeight();
// g.setFontAlign(0,-1);
console.log('screen: ', W, H);
var MAX_DISTANCE = Math.sqrt((maze.length - 2) *
    (maze.length - 2) +
    (maze[0].length - 2) *
        (maze[0].length - 2));
function gameStop() {
    running = false;
    globals.g.clear();
    globals.g.drawString('Game Over!', 120, (H - 6) / 2);
    globals.g.flip();
}
function gameStart() {
    running = true;
}
var debugWidth = 70 * 4 + 1;
var debugHeight = 60 * 4 + 1;
function drawDebugGrid() {
    contextDebug.fillStyle = '#FFFFFF';
    contextDebug.clearRect(0, 0, debugWidth, debugHeight);
    // draw grid
    contextDebug.strokeStyle = '#000000';
    for (var row = 0; row < maze.length; row++) {
        for (var col = 0; col < maze[0].length; col++) {
            var mazeItem = maze[row][col];
            contextDebug.strokeStyle = '#333333';
            if (mazeItem === 1) {
                contextDebug.fillStyle = '#000000';
            }
            else if (mazeItem === 3) {
                contextDebug.fillStyle = '#00FF00';
            }
            else {
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
function drawDebugPixel(x, y, color) {
    if (color === void 0) { color = '#ff8e00'; }
    contextDebug.fillStyle = color;
    contextDebug.fillRect(x * 40 - 1, y * 40 - 1, 3, 3);
}
function drawDebugLine(x1, y1, x2, y2, color) {
    if (color === void 0) { color = 'rgba(200, 200, 200, 0.5)'; }
    contextDebug.strokeStyle = color;
    contextDebug.beginPath();
    contextDebug.moveTo(x1 * 40, y1 * 40);
    contextDebug.lineTo(x2 * 40, y2 * 40);
    contextDebug.stroke();
}
function getSquareDistance(x1, y1, x2, y2) {
    return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
}
function areOutsideMaze(x, y) {
    return !(x >= 0 && x < maze[0].length && y >= 0 && y < maze.length);
}
/**
 * https://www.permadi.com/tutorial/raycast/rayc7.html
 */
function getCollisionDistance(viewAngle, outerRay) {
    var quadrant = Math.floor(viewAngle / 90);
    var horCollision; // first intersection with a wall
    var vertCollision; // first intersection with a wall
    var intersectionOffset = 0; // number of intersections to skip since the ones before were not an intersection with a wall
    var initialHorIntersectionX; // first intersection with horizontal gridline
    var initialHorIntersectionY;
    var initialVertIntersectionX; // first intersection with vertical gridline
    var initialVertIntersectionY;
    var horizontalOffsetX; // distance between horizontal intersections
    var horizontalOffsetY;
    var verticalOffsetX; // distance between vertical intersections
    var verticalOffsetY;
    var isFacingUp;
    var isFacingRight;
    var horIntersectionX;
    var horIntersectionY;
    var horGridX;
    var horGridY;
    var vertIntersectionX;
    var vertIntersectionY;
    var vertGridX;
    var vertGridY;
    while (!horCollision || !vertCollision) {
        isFacingUp = quadrant === 2 || quadrant === 3;
        // horizontal intersection
        if (!horCollision) {
            if (!initialHorIntersectionX) {
                if (isFacingUp) {
                    initialHorIntersectionY = Math.floor(playerY);
                }
                else {
                    initialHorIntersectionY = Math.floor(playerY) + 1;
                }
                initialHorIntersectionX = playerX - (playerY - initialHorIntersectionY) / tan(viewAngle);
            }
            if (intersectionOffset !== 0 && !horizontalOffsetX) {
                if (isFacingUp) {
                    horizontalOffsetY = -1;
                }
                else {
                    horizontalOffsetY = 1;
                }
                horizontalOffsetX = 1 / tan(viewAngle);
            }
            horIntersectionX = initialHorIntersectionX + (horizontalOffsetX || 0) * intersectionOffset * (isFacingUp ? -1 : 1);
            horIntersectionY = initialHorIntersectionY + (horizontalOffsetY || 0) * intersectionOffset;
            horGridX = Math.floor(horIntersectionX);
            horGridY = Math.floor(horIntersectionY) + (isFacingUp ? -1 : 0);
            if (areOutsideMaze(horGridX, horGridY) || maze[horGridY][horGridX] === 1) {
                outerRay ? drawDebugPixel(horIntersectionX, horIntersectionY) : function () {
                };
                horCollision = [horIntersectionX, horIntersectionY];
            }
            else {
                outerRay ? drawDebugPixel(horIntersectionX, horIntersectionY, '#FF0000') : function () {
                };
            }
        }
        // Vertical intersection
        isFacingRight = quadrant === 0 || quadrant === 3;
        if (!vertCollision) {
            if (!initialVertIntersectionX) {
                if (isFacingRight) {
                    initialVertIntersectionX = Math.floor(playerX) + 1;
                }
                else {
                    initialVertIntersectionX = Math.floor(playerX);
                }
                initialVertIntersectionY = playerY - (playerX - initialVertIntersectionX) * tan(viewAngle);
            }
            if (intersectionOffset !== 0 && !verticalOffsetX) {
                verticalOffsetX = isFacingRight ? 1 : -1;
                verticalOffsetY = Math.abs(tan(viewAngle)) * (isFacingUp ? -1 : 1);
            }
            vertIntersectionX = initialVertIntersectionX + (verticalOffsetX || 0) * intersectionOffset;
            vertIntersectionY = initialVertIntersectionY + (verticalOffsetY || 0) * intersectionOffset;
            vertGridX = Math.floor(vertIntersectionX) + (isFacingRight ? 0 : -1);
            vertGridY = Math.floor(vertIntersectionY);
            if (areOutsideMaze(vertGridX, vertGridY) || maze[vertGridY][vertGridX] === 1) {
                outerRay ? drawDebugPixel(vertIntersectionX, vertIntersectionY) : function () {
                };
                vertCollision = [vertIntersectionX, vertIntersectionY];
            }
            else {
                outerRay ? drawDebugPixel(vertIntersectionX, vertIntersectionY, '#FF0000') : function () {
                };
            }
        }
        intersectionOffset++;
    }
    var horDistance = getSquareDistance(playerX, playerY, horCollision[0], horCollision[1]);
    var vertDistance = getSquareDistance(playerX, playerY, vertCollision[0], vertCollision[1]);
    var closestCollision = horDistance < vertDistance ? horCollision : vertCollision;
    outerRay ? drawDebugPixel(closestCollision[0], closestCollision[1], '#00FF00') : function () {
    };
    drawDebugLine(playerX, playerY, closestCollision[0], closestCollision[1]);
    if (!closestCollision) {
        throw new Error('intersection is null');
    }
    var directDistance = Math.sqrt(getSquareDistance(playerX, playerY, closestCollision[0], closestCollision[1]));
    var perpendicularDistance = directDistance * cos((viewAngle - playerAngle + 360) % 360);
    // const perpendicularDistance = (intersection[0] - playerX) * cos(playerAngle) +
    // 	(playerY - intersection[1]) * sin(playerAngle);
    var isAtMazeIntersection = closestCollision[0] % 1 < verticalWallEpsilon && closestCollision[1] % 1 < verticalWallEpsilon;
    return [perpendicularDistance, isAtMazeIntersection];
}
var mapRange = function (val, in_min, in_max, out_min, out_max) {
    return (val - in_min) / (in_max - in_min) * (out_max - out_min) + out_min;
};
function drawPixel(x, y) {
    // console.log('drawPixel: ', x, y);
    if (x >= 0 && x < W && y >= 0 && y < H) {
        globals.g.setPixel(x, y);
    }
}
function drawVerticalLine(x, y1, y2) {
    for (var i = y1; i <= y2; i++) {
        drawPixel(x, i);
    }
}
function drawWalls() {
    console.log('--------------------------');
    drawDebugGrid();
    console.log('player angle: ', playerAngle);
    var startAngle = (playerAngle - viewAngleWidth / 2 + 360) % 360;
    var raytraceStepAngle = viewAngleWidth / W;
    for (var i = 0; i < W; i += 1) {
        var viewAngle = (startAngle + raytraceStepAngle * i + 360) % 360;
        var _a = getCollisionDistance(viewAngle, i === 0 || i >= W - 1), collisionDistance = _a[0], isMazeIntersection = _a[1];
        if (collisionDistance) {
            // 64 => 240
            // 5 * 64 => 120
            // let wallHeight = mapRange(Math.sqrt(collisionDistance), 0.3, Math.sqrt(MAX_DISTANCE), 160, 10);
            var wallHeight = 160 / collisionDistance;
            if (isMazeIntersection) {
                // draw line
                drawVerticalLine(i, Math.round((H - wallHeight) / 2), Math.round((H - wallHeight) / 2 + wallHeight));
            }
            else {
                // draw top and bottom of the wall
                drawPixel(i, Math.round((H - wallHeight) / 2));
                drawPixel(i, Math.round((H - wallHeight) / 2 + wallHeight));
            }
        }
        else {
            console.error('failed to find an intersection');
        }
    }
}
function isInsideWall(playerX, playerY) {
    return maze[Math.floor(playerY)][Math.floor(playerX)] === MazeElement.WALL;
}
function movePlayer(deltaX, deltaY) {
    // Try moving in both directions
    var newPlayerX = playerX + deltaX;
    var newPlayerY = playerY + deltaY;
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
var lastPlayerX = undefined;
var lastPlayerY = undefined;
var lastPlayerAngle = undefined;
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
        var quadrant = Math.floor(playerAngle / 90);
        var isFacingUp = quadrant === 2 || quadrant === 3;
        var isFacingRight = quadrant === 0 || quadrant === 3;
        var playerXDelta = Math.abs(cos(playerAngle) * playerStepSize) * (isFacingRight ? 1 : -1);
        var playerYDelta = Math.abs(sin(playerAngle) * playerStepSize) * (isFacingUp ? -1 : 1);
        movePlayer(playerXDelta, playerYDelta);
    }
    if (globals.BTN2.read()) {
        console.log('backward');
        var quadrant = Math.floor(playerAngle / 90);
        var isFacingUp = quadrant === 2 || quadrant === 3;
        var isFacingRight = quadrant === 0 || quadrant === 3;
        var playerXDelta = Math.abs(cos(playerAngle) * playerStepSize) * (isFacingRight ? -1 : 1);
        var playerYDelta = Math.abs(sin(playerAngle) * playerStepSize) * (isFacingUp ? 1 : -1);
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
//# sourceMappingURL=main.js.map