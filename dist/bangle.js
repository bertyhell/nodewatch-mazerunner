var initialTime = new Date().getTime();
function printFreeSpace(name) {
    var time = Math.floor(new Date().getTime() - initialTime);
    console.log((name || 'free memory') + '; ' + time + '; ' + process.memory().free);
}
function clampDeg(deg) {
    return (deg + 360) % 360;
}
function cos(deg) {
    return Math.cos(deg / 180 * Math.PI);
}
function sin(deg) {
    return Math.sin(deg / 180 * Math.PI);
}
function tan(deg) {
    return Math.tan(deg / 180 * Math.PI);
}
function getSquareDistance(x1, y1, x2, y2) {
    return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
}
function isOutsideMaze(maze, location) {
    return !(location.x >= 0 && location.x < maze[0].length && location.y >= 0 && location.y < maze.length);
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
    var generatedMaze = new Array(height);
    for (var row = 0; row < height; row++) {
        generatedMaze[row] = new Array(width);
        for (var col = 0; col < width; col++) {
            if (row % 2 === 0 || col % 2 === 0) {
                generatedMaze[row][col] = 1;
            }
            else {
                generatedMaze[row][col] = -1;
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

var mazeWidth = 3;
var mazeHeight = 3;
var screenWidth = 240;
var screenHeight = 160;
var playerX = 1.5;
var playerY = 1.5;
var viewAngleWidth = 70;
var angleStep = 7;
var playerStepSize = 0.1;
var mazeHorCells = mazeWidth * 2 + 1;
var mazeVerCells = mazeHeight * 2 + 1;
printFreeSpace('before maze');
var maze = generateMaze(mazeHorCells, mazeVerCells);
printFreeSpace('after maze');
var playerAngle = (maze[1][2] === 1 ? 90 : 0);
var gameVars = {
    mazeWidth: mazeWidth,
    mazeHeight: mazeHeight,
    screenWidth: screenWidth,
    screenHeight: screenHeight,
    viewAngleWidth: viewAngleWidth,
    angleStep: angleStep,
    playerStepSize: playerStepSize,
    mazeHorCells: mazeHorCells,
    mazeVerCells: mazeVerCells,
    playerX: playerX,
    playerY: playerY,
    maze: maze,
    playerAngle: playerAngle,
    startGame: function (screenIo) {
    },
    stopGame: function () {
    },
};
var running = true;
function startGame(screenIo) {
    running = true;
    onFrame(screenIo);
}
function stopGame() {
    running = false;
}
function getCollisionDistance(viewAngle, outerRay, debugOperations) {
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
                    initialHorIntersectionY = Math.floor(gameVars.playerY);
                }
                else {
                    initialHorIntersectionY = Math.floor(gameVars.playerY) + 1;
                }
                initialHorIntersectionX = gameVars.playerX - (gameVars.playerY - initialHorIntersectionY) / tan(viewAngle);
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
                y: Math.floor(horIntersectionY) + (isFacingUp ? -1 : 0),
            };
            if (isOutsideMaze(maze, horGridLocation) || maze[horGridLocation.y][horGridLocation.x] === 1) {
                if (outerRay) {
                    debugOperations.drawDebugPixel(horIntersectionX, horIntersectionY);
                }
                horCollision = { x: horIntersectionX, y: horIntersectionY };
            }
            else {
                if (outerRay) {
                    debugOperations.drawDebugPixel(horIntersectionX, horIntersectionY, '#FF0000');
                }
            }
        }
        isFacingRight = quadrant === 0 || quadrant === 3;
        if (!vertCollision) {
            if (!initialVertIntersectionX) {
                if (isFacingRight) {
                    initialVertIntersectionX = Math.floor(gameVars.playerX) + 1;
                }
                else {
                    initialVertIntersectionX = Math.floor(gameVars.playerX);
                }
                initialVertIntersectionY = gameVars.playerY - (gameVars.playerX - initialVertIntersectionX) * tan(viewAngle);
            }
            if (intersectionOffset !== 0 && !verticalOffsetX) {
                verticalOffsetX = isFacingRight ? 1 : -1;
                verticalOffsetY = Math.abs(tan(viewAngle)) * (isFacingUp ? -1 : 1);
            }
            vertIntersectionX = initialVertIntersectionX + (verticalOffsetX || 0) * intersectionOffset;
            vertIntersectionY = initialVertIntersectionY + (verticalOffsetY || 0) * intersectionOffset;
            vertGridLocation = {
                x: Math.floor(vertIntersectionX) + (isFacingRight ? 0 : -1),
                y: Math.floor(vertIntersectionY),
            };
            if (isOutsideMaze(maze, vertGridLocation) || maze[vertGridLocation.y][vertGridLocation.x] === 1) {
                if (outerRay) {
                    debugOperations.drawDebugPixel(vertIntersectionX, vertIntersectionY);
                }
                vertCollision = { x: vertIntersectionX, y: vertIntersectionY };
            }
            else {
                if (outerRay) {
                    debugOperations.drawDebugPixel(vertIntersectionX, vertIntersectionY, '#FF0000');
                }
            }
        }
        intersectionOffset++;
    }
    var horDistance = getSquareDistance(gameVars.playerX, gameVars.playerY, horCollision.x, horCollision.y);
    var vertDistance = getSquareDistance(gameVars.playerX, gameVars.playerY, vertCollision.x, vertCollision.y);
    var closestCollision = horDistance < vertDistance ? horCollision : vertCollision;
    if (outerRay) {
        debugOperations.drawDebugPixel(closestCollision.x, closestCollision.y, '#00FF00');
    }
    debugOperations.drawDebugLine(gameVars.playerX, gameVars.playerY, closestCollision.x, closestCollision.y);
    if (!closestCollision) {
        throw new Error('intersection is null');
    }
    return closestCollision;
}
function drawWalls(screenIo) {
    screenIo.drawDebugGrid(maze);
    var startAngle = clampDeg(gameVars.playerAngle - gameVars.viewAngleWidth / 2);
    var raytraceStepAngle = gameVars.viewAngleWidth / gameVars.screenWidth;
    var anglesCollisionsAndDistances = [];
    for (var i = 0; i < gameVars.screenWidth; i += 1) {
        var viewAngle = clampDeg(startAngle + raytraceStepAngle * i);
        var collision = getCollisionDistance(viewAngle, i === 0 || i >= gameVars.screenWidth - 1, screenIo);
        var directDistance = Math.sqrt(getSquareDistance(gameVars.playerX, gameVars.playerY, collision.x, collision.y));
        var perpendicularDistance = directDistance * cos(clampDeg(viewAngle - gameVars.playerAngle));
        var wallHeight = gameVars.screenHeight / perpendicularDistance;
        screenIo.drawPixel(i, Math.round((gameVars.screenHeight - wallHeight) / 2));
        screenIo.drawPixel(i, Math.round((gameVars.screenHeight - wallHeight) / 2 + wallHeight));
    }
}
function isInsideWall(playerX, playerY) {
    return maze[Math.floor(playerY)][Math.floor(playerX)] === 1;
}
function movePlayer(deltaX, deltaY) {
    var newPlayerX = gameVars.playerX + deltaX;
    var newPlayerY = gameVars.playerY + deltaY;
    if (!isInsideWall(newPlayerX, newPlayerY)) {
        gameVars.playerX = newPlayerX;
        gameVars.playerY = newPlayerY;
        return;
    }
    newPlayerX = gameVars.playerX;
    newPlayerY = gameVars.playerY + deltaY;
    if (!isInsideWall(newPlayerX, newPlayerY)) {
        gameVars.playerX = newPlayerX;
        gameVars.playerY = newPlayerY;
        return;
    }
    newPlayerX = gameVars.playerX + deltaX;
    newPlayerY = gameVars.playerY;
    if (!isInsideWall(newPlayerX, newPlayerY)) {
        gameVars.playerX = newPlayerX;
        gameVars.playerY = newPlayerY;
        return;
    }
}
var lastPlayerX;
var lastPlayerY;
var lastPlayerAngle;
function onFrame(screenIo) {
    if (screenIo.BTN4.read()) {
        console.log('left');
        gameVars.playerAngle = clampDeg(gameVars.playerAngle - gameVars.angleStep);
    }
    if (screenIo.BTN5.read()) {
        console.log('right');
        gameVars.playerAngle = clampDeg(gameVars.playerAngle + gameVars.angleStep);
    }
    var quadrant;
    var isFacingUp;
    var isFacingRight;
    var playerXDelta;
    var playerYDelta;
    if (screenIo.BTN1.read()) {
        console.log('forward');
        quadrant = Math.floor(gameVars.playerAngle / 90);
        isFacingUp = quadrant === 2 || quadrant === 3;
        isFacingRight = quadrant === 3 || quadrant === 0;
        playerXDelta = Math.abs(cos(gameVars.playerAngle) * gameVars.playerStepSize) * (isFacingRight ? 1 : -1);
        playerYDelta = Math.abs(sin(gameVars.playerAngle) * gameVars.playerStepSize) * (isFacingUp ? -1 : 1);
        movePlayer(playerXDelta, playerYDelta);
    }
    if (screenIo.BTN2.read()) {
        console.log('backward');
        quadrant = Math.floor(gameVars.playerAngle / 90);
        isFacingUp = quadrant === 2 || quadrant === 3;
        isFacingRight = quadrant === 3 || quadrant === 0;
        playerXDelta = Math.abs(cos(gameVars.playerAngle) * gameVars.playerStepSize) * (isFacingRight ? -1 : 1);
        playerYDelta = Math.abs(sin(gameVars.playerAngle) * gameVars.playerStepSize) * (isFacingUp ? 1 : -1);
        movePlayer(playerXDelta, playerYDelta);
    }
    if (!running) {
        return;
    }
    if (lastPlayerX !== gameVars.playerX ||
        lastPlayerY !== gameVars.playerY ||
        lastPlayerAngle !== gameVars.playerAngle) {
        screenIo.clear();
        drawWalls(screenIo);
        screenIo.flip();
    }
    lastPlayerX = gameVars.playerX;
    lastPlayerY = gameVars.playerY;
    lastPlayerAngle = gameVars.playerAngle;
    setTimeout(function () { return onFrame(screenIo); }, 50);
}
gameVars.startGame = startGame;
gameVars.stopGame = stopGame;
var gameVariables = gameVars;
printFreeSpace('after engine loaded');

var initialTime = new Date().getTime();
function printFreeSpace(name) {
    var time = Math.floor(new Date().getTime() - initialTime);
    console.log((name || 'free memory') + '; ' + time + '; ' + process.memory().free);
}
function clampDeg(deg) {
    return (deg + 360) % 360;
}
function cos(deg) {
    return Math.cos(deg / 180 * Math.PI);
}
function sin(deg) {
    return Math.sin(deg / 180 * Math.PI);
}
function tan(deg) {
    return Math.tan(deg / 180 * Math.PI);
}
function getSquareDistance(x1, y1, x2, y2) {
    return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
}
function isOutsideMaze(maze, location) {
    return !(location.x >= 0 && location.x < maze[0].length && location.y >= 0 && location.y < maze.length);
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
    var generatedMaze = new Array(height);
    for (var row = 0; row < height; row++) {
        generatedMaze[row] = new Array(width);
        for (var col = 0; col < width; col++) {
            if (row % 2 === 0 || col % 2 === 0) {
                generatedMaze[row][col] = 1;
            }
            else {
                generatedMaze[row][col] = -1;
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

Bangle.setLCDMode('doublebuffered');
function drawPixel(x, y, color) {
    g.setPixel(x, y);
}
function drawVerticalLine(x, y1, y2) {
    g.drawLine(x, y1, x, y2);
}
function clear() {
    g.clear();
}
function flip() {
    g.flip();
}
var screenIo = {
    BTN1: BTN1,
    BTN2: BTN2,
    BTN3: BTN3,
    BTN4: BTN4,
    BTN5: BTN5,
    drawPixel: drawPixel,
    drawVerticalLine: drawVerticalLine,
    clear: clear,
    flip: flip,
    drawDebugGrid: function () { },
    drawDebugLine: function () { },
    drawDebugPixel: function () { },
};
g.setFontAlign(0, -1);
g.clear();
g.drawString("Press button 2 to start game ==>", 120, (g.getHeight() - 6) / 2);
console.log('version: ' + process.version);
printFreeSpace();
function checkForStart() {
    if (BTN2.read()) {
        console.log('starting game');
        gameVariables.startGame(screenIo);
    }
    else {
        setTimeout(checkForStart, 16);
    }
}
console.log('starting maze runner');
checkForStart();
