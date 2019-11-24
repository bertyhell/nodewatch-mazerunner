"use strict";
// const isBangle = process && process.env && process.env.BOARD === 'BANGLEJS';
// Game variables
var mazeWidth = 9;
var mazeHeight = 6;
var debugCellSize = 40;
var screenWidth = 240;
var screenHeight = 160;
var playerX = 1.5; // TODO get this from the maze (position of "2")
var playerY = 1.5;
var playerAngle = 90;
var viewAngleWidth = 90;
var angleStep = 5;
var playerStepSize = 0.1;
// Computed values
var mazeHorCells = mazeWidth * 2 + 1;
var mazeVerCells = mazeHeight * 2 + 1;
var debugWidth = mazeHorCells * 40;
var debugHeight = mazeVerCells * 40;
var MazeElement;
(function (MazeElement) {
    MazeElement[MazeElement["UNVISITED_EMPTY"] = -1] = "UNVISITED_EMPTY";
    MazeElement[MazeElement["EMPTY"] = 0] = "EMPTY";
    MazeElement[MazeElement["WALL"] = 1] = "WALL";
    MazeElement[MazeElement["PLAYER"] = 2] = "PLAYER";
    MazeElement[MazeElement["END"] = 3] = "END";
})(MazeElement || (MazeElement = {}));
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
var CORNERS = {
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
    '1111': false
};
var maze = generateMaze(mazeHorCells, mazeVerCells);
// let maze: MazeElement[][] = [
// 	[1, 1, 1, 1, 1, 1, 1],
// 	[1, 0, 0, 0, 1, 0, 1],
// 	[1, 0, 1, 0, 0, 0, 1],
// 	[1, 0, 1, 0, 1, 0, 1],
// 	[1, 2, 1, 0, 1, 3, 1],
// 	[1, 1, 1, 1, 1, 1, 1]
// ];
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
        canvas.width = screenWidth;
        canvas.height = screenHeight;
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
        canvasDebug.width = debugWidth;
        canvasDebug.height = debugHeight;
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
        context.fillRect(0, 0, screenWidth, screenHeight);
        context.fillStyle = '#000000';
    },
    flip: function () {
    },
    getWidth: function () { return screenWidth; },
    getHeight: function () { return screenHeight; }
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
function drawDebugPixel(x, y, color) {
    if (color === void 0) { color = '#ff8e00'; }
    contextDebug.fillStyle = color;
    contextDebug.fillRect(x * debugCellSize - 1, y * debugCellSize - 1, 3, 3);
}
function drawDebugLine(x1, y1, x2, y2, color) {
    if (color === void 0) { color = 'rgba(200, 200, 200, 0.5)'; }
    contextDebug.strokeStyle = color;
    contextDebug.beginPath();
    contextDebug.moveTo(x1 * debugCellSize, y1 * debugCellSize);
    contextDebug.lineTo(x2 * debugCellSize, y2 * debugCellSize);
    contextDebug.stroke();
}
function getSquareDistance(x1, y1, x2, y2) {
    return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
}
function isOutsideMaze(maze, location) {
    return !(location.x >= 0 && location.x < maze[0].length && location.y >= 0 && location.y < maze.length);
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
    var horGridLocation;
    var vertIntersectionX;
    var vertIntersectionY;
    var vertGridLocation;
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
            horGridLocation = {
                x: Math.floor(horIntersectionX),
                y: Math.floor(horIntersectionY) + (isFacingUp ? -1 : 0)
            };
            if (isOutsideMaze(maze, horGridLocation) || maze[horGridLocation.y][horGridLocation.x] === 1) {
                outerRay ? drawDebugPixel(horIntersectionX, horIntersectionY) : function () {
                };
                horCollision = { x: horIntersectionX, y: horIntersectionY };
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
            vertGridLocation = {
                x: Math.floor(vertIntersectionX) + (isFacingRight ? 0 : -1),
                y: Math.floor(vertIntersectionY)
            };
            if (isOutsideMaze(maze, vertGridLocation) || maze[vertGridLocation.y][vertGridLocation.x] === 1) {
                outerRay ? drawDebugPixel(vertIntersectionX, vertIntersectionY) : function () {
                };
                vertCollision = { x: vertIntersectionX, y: vertIntersectionY };
            }
            else {
                outerRay ? drawDebugPixel(vertIntersectionX, vertIntersectionY, '#FF0000') : function () {
                };
            }
        }
        intersectionOffset++;
    }
    var horDistance = getSquareDistance(playerX, playerY, horCollision.x, horCollision.y);
    var vertDistance = getSquareDistance(playerX, playerY, vertCollision.x, vertCollision.y);
    var closestCollision = horDistance < vertDistance ? horCollision : vertCollision;
    outerRay ? drawDebugPixel(closestCollision.x, closestCollision.y, '#00FF00') : function () {
    };
    drawDebugLine(playerX, playerY, closestCollision.x, closestCollision.y);
    if (!closestCollision) {
        throw new Error('intersection is null');
    }
    return closestCollision;
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
    var anglesCollisionsAndDistances = [];
    for (var i = 0; i < W; i += 1) {
        var viewAngle = (startAngle + raytraceStepAngle * i + 360) % 360;
        var collision = getCollisionDistance(viewAngle, i === 0 || i >= W - 1);
        var directDistance = Math.sqrt(getSquareDistance(playerX, playerY, collision.x, collision.y));
        var perpendicularDistance = directDistance * cos((viewAngle - playerAngle + 360) % 360);
        anglesCollisionsAndDistances.push({
            angle: viewAngle,
            collision: collision,
            distance: perpendicularDistance,
            shouldDrawWall: false
        });
    }
    // Identify which rays should also draw a vertical line to identify corners
    // Find unique intersection point in the maze which are closest to each collision
    var intersectionPoints = {};
    anglesCollisionsAndDistances.forEach(function (angCollDis) {
        var intersectionX = Math.round(angCollDis.collision.x);
        var intersectionY = Math.round(angCollDis.collision.y);
        intersectionPoints[intersectionX + ';' + intersectionY] = { x: intersectionX, y: intersectionY };
    });
    // Identify if the intersection should cause a wall line to be displayed or if it is part of a straight wall
    var cornerIntersectionPoints = [];
    Object.keys(intersectionPoints).forEach(function (intersectionKey) {
        var intersection = intersectionPoints[intersectionKey];
        var topLeftCell = maze[intersection.y - 1][intersection.x - 1];
        var topRightCell = maze[intersection.y - 1][intersection.x];
        var bottomLeftCell = maze[intersection.y][intersection.x - 1];
        var bottomRightCell = maze[intersection.y][intersection.x];
        // Generate corner key: eg: 1100 or 1010
        var cornerKey = (topLeftCell === 1 ? '1' : '0') +
            (topRightCell === 1 ? '1' : '0') +
            (bottomLeftCell === 1 ? '1' : '0') +
            (bottomRightCell === 1 ? '1' : '0');
        var shouldDrawWall = CORNERS[cornerKey];
        if (shouldDrawWall) {
            cornerIntersectionPoints.push(intersection);
        }
    });
    // Find the closest collision to each corner intersection
    cornerIntersectionPoints.forEach(function (intersection) {
        var shortestDistance = 100000;
        var closestCollisionIndex = 0;
        anglesCollisionsAndDistances.forEach(function (collisionInfo, index) {
            var distance = Math.abs(intersection.x - collisionInfo.collision.x) + Math.abs(intersection.y - collisionInfo.collision.y);
            if (distance < shortestDistance) {
                closestCollisionIndex = index;
                shortestDistance = distance;
            }
        });
        anglesCollisionsAndDistances[closestCollisionIndex].shouldDrawWall = true;
    });
    // Draw the walls
    anglesCollisionsAndDistances.forEach(function (collisionInfo, index) {
        var wallHeight = screenHeight / collisionInfo.distance;
        if (collisionInfo.shouldDrawWall) {
            drawVerticalLine(index, Math.round((H - wallHeight) / 2), Math.round((H - wallHeight) / 2 + wallHeight));
        }
        else {
            drawPixel(index, Math.round((H - wallHeight) / 2));
            drawPixel(index, Math.round((H - wallHeight) / 2 + wallHeight));
        }
    });
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
function getUnvisitedNeighbors(maze, currentPosition) {
    var neighbors = [
        { x: currentPosition.x - 2, y: currentPosition.y },
        { x: currentPosition.x, y: currentPosition.y - 2 },
        { x: currentPosition.x + 2, y: currentPosition.y },
        { x: currentPosition.x, y: currentPosition.y + 2 },
    ];
    return neighbors.filter(function (neighbor) {
        return !isOutsideMaze(maze, neighbor) && maze[neighbor.y][neighbor.x] === MazeElement.UNVISITED_EMPTY;
    });
}
/**
 * Generate random number inside the interval [min, max]
 * min and max included
 * @param min
 * @param max
 */
function randomInt(min, max) {
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
function generateMaze(width, height) {
    var generatedMaze = [];
    // Init maze like:
    // 111111111
    // 101010101
    // 111111111
    // 101010101
    // 111111111
    // 101010101
    // 111111111
    for (var row = 0; row < height; row++) {
        generatedMaze[row] = [];
        for (var col = 0; col < width; col++) {
            if (row % 2 === 0 || col % 2 === 0) {
                generatedMaze[row].push(MazeElement.WALL);
            }
            else {
                generatedMaze[row].push(MazeElement.UNVISITED_EMPTY); // Empty not yet visited, we'll switch this to 0 once we visit the cell during the algorithm
            }
        }
    }
    // Remove hedges between empty cells based on maze generation algorithm
    var stack = [];
    var currentPosition = { x: 1, y: 1 };
    generatedMaze[currentPosition.y][currentPosition.x] = 0;
    stack.push(currentPosition);
    var unvisitedNeighbors;
    while (stack.length) {
        currentPosition = stack.pop();
        unvisitedNeighbors = getUnvisitedNeighbors(generatedMaze, currentPosition);
        if (unvisitedNeighbors.length) {
            stack.push(currentPosition);
            var unvisitedNeighbor = unvisitedNeighbors[randomInt(0, unvisitedNeighbors.length - 1)];
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