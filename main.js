"use strict";
var mazeWidth = 20;
var mazeHeight = 15;
var debugCellSize = 20;
var screenWidth = 240;
var screenHeight = 160;
var viewAngleWidth = 70;
var angleStep = 7;
var playerStepSize = 0.1;
var mazeHorCells = mazeWidth * 2 + 1;
var mazeVerCells = mazeHeight * 2 + 1;
var debugWidth = mazeHorCells * debugCellSize;
var debugHeight = mazeVerCells * debugCellSize;
var playerX = 1.5;
var playerY = 1.5;
var maze = generateMaze(mazeHorCells, mazeVerCells);
var playerAngle = maze[1][2] === 1 ? 90 : 0;
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
var running = true;
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
var Bangle = {
    setLCDMode: function (type) {
    }
};
var globals = {
    Bangle: Bangle,
    g: {},
    BTN1: BTN1,
    BTN2: BTN2,
    BTN3: BTN3,
    BTN4: BTN4,
    BTN5: BTN5
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
            globals.g = {
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
    setTimeout(onFrame, 500);
    console.log('starting maze runner');
};
function getLookupTable(trigonometricFunction) {
    var lookup = {};
    for (var i = 0; i <= 360; i += 1) {
        lookup[Math.round(i)] = trigonometricFunction(i / 180 * Math.PI);
    }
    return lookup;
}
var cosLookupTable = getLookupTable(Math.cos);
var sinLookupTable = getLookupTable(Math.sin);
var tanLookupTable = getLookupTable(Math.tan);
function lookupAndInterpolate(deg, lookupTable) {
    var lowerDeg = Math.floor(deg);
    var upperDeg = Math.ceil(deg + 0.00001);
    var lowerTri = lookupTable[lowerDeg];
    var upperTri = lookupTable[upperDeg];
    var diffDeg = upperDeg - lowerDeg;
    var diffCos = upperTri - lowerTri;
    return lowerTri + Math.abs(deg - lowerDeg) / diffDeg * diffCos;
}
function cos(deg) {
    return lookupAndInterpolate(deg, cosLookupTable);
}
function sin(deg) {
    return lookupAndInterpolate(deg, sinLookupTable);
}
function tan(deg) {
    return lookupAndInterpolate(deg, tanLookupTable);
}
globals.Bangle.setLCDMode('doublebuffered');
console.log('screen: ', screenWidth, screenHeight);
function clampDeg(deg) {
    return (deg + 360) % 360;
}
function drawDebugGrid() {
    contextDebug.fillStyle = '#FFFFFF';
    contextDebug.clearRect(0, 0, debugWidth, debugHeight);
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
    contextDebug.fillStyle = '#0000FF';
    contextDebug.fillRect(playerX * debugCellSize - 3, playerY * debugCellSize - 3, 7, 7);
    contextDebug.strokeStyle = '#666666';
    contextDebug.beginPath();
    contextDebug.moveTo(playerX * debugCellSize, playerY * debugCellSize);
    contextDebug.lineTo(playerX * debugCellSize + 1000 * cos(clampDeg(playerAngle - viewAngleWidth / 2)), playerY * debugCellSize + 1000 * sin(clampDeg(playerAngle - viewAngleWidth / 2)));
    contextDebug.stroke();
    contextDebug.beginPath();
    contextDebug.moveTo(playerX * debugCellSize, playerY * debugCellSize);
    contextDebug.lineTo(playerX * debugCellSize + 1000 * cos(clampDeg(playerAngle + viewAngleWidth / 2)), playerY * debugCellSize + 1000 * sin(clampDeg(playerAngle + viewAngleWidth / 2)));
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
function getCollisionDistance(viewAngle, outerRay) {
    var quadrant = Math.floor(viewAngle / 90);
    var horCollision;
    var vertCollision;
    var intersectionOffset = 0;
    var initialHorIntersectionX;
    var initialHorIntersectionY;
    var initialVertIntersectionX;
    var initialVertIntersectionY;
    var horizontalOffsetX;
    var horizontalOffsetY;
    var verticalOffsetX;
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
function drawPixel(x, y) {
    if (x >= 0 && x < screenWidth && y >= 0 && y < screenHeight) {
        globals.g.setPixel(x, y);
    }
}
function drawVerticalLine(x, y1, y2) {
    for (var i = y1; i <= y2; i++) {
        drawPixel(x, i);
    }
}
function drawWalls() {
    drawDebugGrid();
    var startAngle = clampDeg(playerAngle - viewAngleWidth / 2);
    var raytraceStepAngle = viewAngleWidth / screenWidth;
    var anglesCollisionsAndDistances = [];
    for (var i = 0; i < screenWidth; i += 1) {
        var viewAngle = clampDeg(startAngle + raytraceStepAngle * i);
        var collision = getCollisionDistance(viewAngle, i === 0 || i >= screenWidth - 1);
        var directDistance = Math.sqrt(getSquareDistance(playerX, playerY, collision.x, collision.y));
        var perpendicularDistance = directDistance * cos(clampDeg(viewAngle - playerAngle));
        anglesCollisionsAndDistances.push({
            angle: viewAngle,
            collision: collision,
            distance: perpendicularDistance,
            shouldDrawWall: false
        });
    }
    var intersectionPoints = {};
    anglesCollisionsAndDistances.forEach(function (angCollDis) {
        var intersectionX = Math.round(angCollDis.collision.x);
        var intersectionY = Math.round(angCollDis.collision.y);
        intersectionPoints[intersectionX + ';' + intersectionY] = { x: intersectionX, y: intersectionY };
    });
    var cornerIntersectionPoints = [];
    Object.keys(intersectionPoints).forEach(function (intersectionKey) {
        var intersection = intersectionPoints[intersectionKey];
        var topLeftCell = maze[intersection.y - 1][intersection.x - 1];
        var topRightCell = maze[intersection.y - 1][intersection.x];
        var bottomLeftCell = maze[intersection.y][intersection.x - 1];
        var bottomRightCell = maze[intersection.y][intersection.x];
        var cornerKey = (topLeftCell === 1 ? '1' : '0') +
            (topRightCell === 1 ? '1' : '0') +
            (bottomLeftCell === 1 ? '1' : '0') +
            (bottomRightCell === 1 ? '1' : '0');
        var shouldDrawWall = CORNERS[cornerKey];
        if (shouldDrawWall) {
            cornerIntersectionPoints.push(intersection);
        }
    });
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
    anglesCollisionsAndDistances.forEach(function (collisionInfo, index) {
        var wallHeight = screenHeight / collisionInfo.distance;
        if (collisionInfo.shouldDrawWall) {
            drawVerticalLine(index, Math.round((screenHeight - wallHeight) / 2), Math.round((screenHeight - wallHeight) / 2 + wallHeight));
        }
        else {
            drawPixel(index, Math.round((screenHeight - wallHeight) / 2));
            drawPixel(index, Math.round((screenHeight - wallHeight) / 2 + wallHeight));
        }
    });
}
function isInsideWall(playerX, playerY) {
    return maze[Math.floor(playerY)][Math.floor(playerX)] === 1;
}
function movePlayer(deltaX, deltaY) {
    var newPlayerX = playerX + deltaX;
    var newPlayerY = playerY + deltaY;
    if (!isInsideWall(newPlayerX, newPlayerY)) {
        playerX = newPlayerX;
        playerY = newPlayerY;
        return;
    }
    newPlayerX = playerX;
    newPlayerY = playerY + deltaY;
    if (!isInsideWall(newPlayerX, newPlayerY)) {
        playerX = newPlayerX;
        playerY = newPlayerY;
        return;
    }
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
        return !isOutsideMaze(maze, neighbor) && maze[neighbor.y][neighbor.x] === -1;
    });
}
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function generateMaze(width, height) {
    var generatedMaze = [];
    for (var row = 0; row < height; row++) {
        generatedMaze[row] = [];
        for (var col = 0; col < width; col++) {
            if (row % 2 === 0 || col % 2 === 0) {
                generatedMaze[row].push(1);
            }
            else {
                generatedMaze[row].push(-1);
            }
        }
    }
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
            generatedMaze[(unvisitedNeighbor.y + currentPosition.y) / 2][(unvisitedNeighbor.x + currentPosition.x) / 2] = 0;
            generatedMaze[unvisitedNeighbor.y][unvisitedNeighbor.x] = 0;
            stack.push(unvisitedNeighbor);
        }
    }
    generatedMaze[1][1] = 2;
    generatedMaze[height - 2][width - 2] = 3;
    return generatedMaze;
}
var lastPlayerX = undefined;
var lastPlayerY = undefined;
var lastPlayerAngle = undefined;
function onFrame() {
    if (globals.BTN4.read()) {
        playerAngle = clampDeg(playerAngle - angleStep);
    }
    if (globals.BTN5.read()) {
        playerAngle = clampDeg(playerAngle + angleStep);
    }
    if (globals.BTN1.read()) {
        var quadrant = Math.floor(playerAngle / 90);
        var isFacingUp = quadrant === 2 || quadrant === 3;
        var isFacingRight = quadrant === 3 || quadrant === 0;
        var playerXDelta = Math.abs(cos(playerAngle) * playerStepSize) * (isFacingRight ? 1 : -1);
        var playerYDelta = Math.abs(sin(playerAngle) * playerStepSize) * (isFacingUp ? -1 : 1);
        movePlayer(playerXDelta, playerYDelta);
    }
    if (globals.BTN2.read()) {
        var quadrant = Math.floor(playerAngle / 90);
        var isFacingUp = quadrant === 2 || quadrant === 3;
        var isFacingRight = quadrant === 3 || quadrant === 0;
        var playerXDelta = Math.abs(cos(playerAngle) * playerStepSize) * (isFacingRight ? -1 : 1);
        var playerYDelta = Math.abs(sin(playerAngle) * playerStepSize) * (isFacingUp ? 1 : -1);
        movePlayer(playerXDelta, playerYDelta);
    }
    if (!running) {
        return;
    }
    if (lastPlayerX !== playerX ||
        lastPlayerY !== playerY ||
        lastPlayerAngle !== playerAngle) {
        globals.g.clear();
        drawWalls();
        globals.g.flip();
    }
    lastPlayerX = playerX;
    lastPlayerY = playerY;
    lastPlayerAngle = playerAngle;
    setTimeout(onFrame, 50);
}
//# sourceMappingURL=main.js.map