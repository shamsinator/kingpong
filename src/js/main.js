const canvas = document.getElementById('gameCanvas');
let canvasContext = canvas.getContext('2d');

let ball = {
    positionX: canvas.width / 2,
    positionY: canvas.height / 2,
    size: 20,
    velocityX: 8,
    velocityY: 0,
};

let fps = 60;

let paddleWidth = 10;
let paddleHeight = 100;

let paddleOne = {
    y: 250,
    directionY: null,
    velocityY: 15,
};

let paddleTwo = {
    y: 250,
    directionY: null,
    velocityY: 10,
};

let playerOneScore = 0;
let playerTwoScore = 0;

// state variables
let gamePaused = false;
let gameInProgress = false;
let scoreToWin = 10;
let difficultyLevel = 1;
let gameInterval;

const startMenu = document.getElementById('startMenu');
const pauseMenu = document.getElementById('pauseMenu');
const gameOverMenu = document.getElementById('gameOverMenu');
const gameArea = document.getElementById('gameArea');
const startBtn = document.getElementById('startBtn');
const continueBtn = document.getElementById('continueBtn');
const restartBtn = document.getElementById('restartBtn');
const againBtn = document.getElementById('againBtn');
const gameMessage = document.getElementById('gameMessage');

initCanvas();
initBall();
initPaddles();
setupEventListeners();
showStartMenu();

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function initBall() {
    ball.positionY = canvas.height / 2 - ball.size / 2;
    ball.velocityY = getRandomNumber(-5, 5) * (0.25 * difficultyLevel);
}

function initPaddles() {
    paddleOne.y = canvas.height / 2 - paddleHeight / 2;
    paddleTwo.y = canvas.height / 2 - paddleHeight / 2;
}

function setupEventListeners() {
    window.addEventListener('resize', _.throttle(windowResize, 1000));
    startBtn.addEventListener('click', startGame);
    continueBtn.addEventListener('click', resumeGame);
    restartBtn.addEventListener('click', resetGame);
    againBtn.addEventListener('click', resetGame);
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);
}

// NOTE: extract this function to a separate file
function toggleActiveClass(element, isActive) {
    isActive
        ? element.classList.add('active')
        : element.classList.remove('active');
}

function showStartMenu() {
    toggleActiveClass(startMenu, true);
    toggleActiveClass(pauseMenu, false);
    toggleActiveClass(gameArea, false);
    toggleActiveClass(gameOverMenu, false);
}

function startGame() {
    gameInProgress = true;
    toggleActiveClass(startMenu, false);
    toggleActiveClass(pauseMenu, false);
    toggleActiveClass(gameArea, false);
    toggleActiveClass(gameOverMenu, false);
    gamePaused = false;
    gameInterval = window.setInterval(function () {
        moveEverything();
        drawEverything();
    }, 1000 / fps);
}

function resetGame() {
    playerOneScore = 0;
    playerTwoScore = 0;
    difficultyLevel = 1;
    initBall();
    initPaddles();
    startGame();
}

function togglePause() {
    if (gamePaused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

function pauseGame() {
    if (!gamePaused) {
        gamePaused = true;
        toggleActiveClass(gameArea, false);
        toggleActiveClass(pauseMenu, true);
        clearInterval(gameInterval);
    }
}

function resumeGame() {
    if (gamePaused) {
        gamePaused = false;
        toggleActiveClass(gameArea, false);
        toggleActiveClass(pauseMenu, false);
        startGame();
    }
}

function windowResize() {
    if (gameInProgress && !gamePaused) {
        pauseGame();
        showPauseMenuOnResize();
    } else if (!gameInProgress) {
        showStartMenu();
    }

    resetBall();
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawEverything();
}

function showPauseMenuOnResize() {
    gamePaused = true;
    toggleActiveClass(startMenu, false);
    toggleActiveClass(pauseMenu, true);
    toggleActiveClass(gameArea, false);
    toggleActiveClass(gameOverMenu, false);
}

function keyDown(e) {
    e.preventDefault();
    switch (e.keyCode) {
        case 13:
            if (gameInProgress) togglePause();
            break;
        case 38:
            if (!gamePaused) paddleOne.directionY = 'up';
            break;
        case 40:
            if (!gamePaused) paddleOne.directionY = 'down';
            break;
    }
}

function keyUp(e) {
    paddleOne.directionY = null;
}

function resetBall() {
    ball.velocityX = -ball.velocityX;
    ball.velocityY = getRandomNumber(-5, 5) * (0.25 * difficultyLevel);
    ball.positionX = canvas.width / 2;
    ball.positionY = canvas.height / 2;
}

function moveEverything() {
    moveBall();
    movePaddleOne();
    movePaddleTwo();
    checkBallCollision();
    updateScores();
    checkGameEnd();
}

function moveBall() {
    ball.positionX += ball.velocityX;
    ball.positionY += ball.velocityY;

    if (
        ball.positionY > canvas.height - ball.size / 2 ||
        ball.positionY < ball.size / 2
    ) {
        ball.velocityY = -ball.velocityY;
        adjustBallPosition();
    }
}

function movePaddleOne() {
    if (paddleOne.directionY === 'up' && paddleOne.y >= 0) {
        paddleOne.y -= paddleOne.velocityY;
    } else if (
        paddleOne.directionY === 'down' &&
        paddleOne.y < canvas.height - paddleHeight
    ) {
        paddleOne.y += paddleOne.velocityY;
    }
}

function movePaddleTwo() {
    if (ball.positionY < paddleTwo.y) {
        paddleTwo.y -= paddleTwo.velocityY;
    } else if (ball.positionY > paddleTwo.y + paddleHeight) {
        paddleTwo.y += paddleTwo.velocityY;
    }
}

function checkBallCollision() {
    if (ballHitsPaddleTwo()) {
        handleBallCollision(paddleTwo, canvas.width - paddleWidth);
    } else if (ball.positionX < paddleWidth * 2 + ball.size / 2) {
        handleBallCollision(paddleOne, paddleWidth + ball.size / 2);
    }
}

function handleBallCollision(paddle, collisionPointX) {
    if (
        ball.positionY >= paddle.y &&
        ball.positionY <= paddle.y + paddleHeight &&
        ball.positionX < collisionPointX
    ) {
        ball.velocityX = -ball.velocityX;
        handleBallVerticalBounce(paddle);
    } else if (ball.positionX > canvas.width || ball.positionX < -ball.size) {
        resetBall();
        updateScores();
    }
    randomizeGame();
}

function handleBallVerticalBounce(paddle) {
    const bounceSegments = 5;
    const segmentHeight = paddleHeight / bounceSegments;

    for (let i = 0; i < bounceSegments; i++) {
        const segmentStartY = paddle.y + i * segmentHeight;
        const segmentEndY = segmentStartY + segmentHeight;

        if (ball.positionY >= segmentStartY && ball.positionY < segmentEndY) {
            ball.velocityY =
                (i - Math.floor(bounceSegments / 2)) *
                5 *
                (0.25 * difficultyLevel);
            break;
        }
    }
}

function ballHitsPaddleOne() {
    return (
        ball.positionX < paddleWidth * 2 + ball.size / 2 &&
        ball.positionY >= paddleOne.y &&
        ball.positionY <= paddleOne.y + paddleHeight
    );
}

function ballHitsPaddleTwo() {
    return (
        ball.positionX > canvas.width - paddleWidth * 2 - ball.size / 2 &&
        ball.positionY >= paddleTwo.y &&
        ball.positionY <= paddleTwo.y + paddleHeight
    );
}

function updateScores() {
    if (ball.positionX > canvas.width) {
        playerOneScore++;
        checkWinCondition(playerOneScore);
        resetBall();
    } else if (ball.positionX < 0) {
        playerTwoScore++;
        checkWinCondition(playerTwoScore);
        resetBall();
    }
}

function checkWinCondition(score) {
    if (score >= scoreToWin) {
        gameOver(ballHitsPaddleTwo());
    }
}

function checkGameEnd() {
    if (
        gameInProgress &&
        (ball.positionX > canvas.width || ball.positionX < -ball.size)
    ) {
        gameOver(ballHitsPaddleTwo());
    }
}

function adjustBallPosition() {
    if (ball.positionY > canvas.height - ball.size / 2) {
        ball.positionY = canvas.height - ball.size / 2;
    } else if (ball.positionY < ball.size / 2) {
        ball.positionY = ball.size / 2;
    }
}

function drawEverything() {
    const BALL_COLOR = 'white';
    const PADDLE_COLOR = 'white';
    const LINE_COLOR = 'rgba(255,255,255,0.2)';
    const FONT_STYLE = "100px 'Press Start 2P', Arial";

    // clear the canvas
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    // draw the ball
    canvasContext.fillStyle = BALL_COLOR;
    canvasContext.beginPath();
    canvasContext.arc(
        ball.positionX,
        ball.positionY,
        ball.size / 2,
        0,
        Math.PI * 2,
        true
    );
    canvasContext.fill();

    // draw paggle one
    canvasContext.fillStyle = PADDLE_COLOR;
    canvasContext.fillRect(paddleWidth, paddleOne.y, paddleWidth, paddleHeight);

    // draw paddle two
    canvasContext.fillStyle = PADDLE_COLOR;
    canvasContext.fillRect(
        canvas.width - paddleWidth - paddleWidth,
        paddleTwo.y,
        paddleWidth,
        paddleHeight
    );

    // draw the center line
    canvasContext.fillStyle = LINE_COLOR;
    canvasContext.font = FONT_STYLE;
    canvasContext.textAlign = 'center';
    canvasContext.fillText(
        playerOneScore,
        canvas.width * 0.25,
        canvas.height / 2 + 75
    );

    // draw the scores
    canvasContext.fillStyle = LINE_COLOR;
    canvasContext.font = FONT_STYLE;
    canvasContext.textAlign = 'center';
    canvasContext.fillText(
        playerTwoScore,
        canvas.width * 0.75,
        canvas.height / 2 + 75
    );

    canvasContext.strokeStyle = LINE_COLOR;
    canvasContext.beginPath();
    canvasContext.moveTo(canvas.width / 2, 0);
    canvasContext.lineTo(canvas.width / 2, canvas.height);
    canvasContext.stroke();
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

function randomizeGame() {
    paddleTwo.velocityY = getRandomNumber(10, 20) * (0.25 * difficultyLevel);
}

function gameOver(playerWon) {
    gameInProgress = false;
    clearInterval(gameInterval);
    gameMessage.textContent = '';
    againBtn.textContent = '';

    if (playerWon) {
        gameMessage.textContent = 'You won!';
        againBtn.textContent = 'Play again';
    } else {
        gameMessage.textContent = 'Oh snap, you lost.';
        againBtn.textContent = 'Try again';
    }

    toggleActiveClass(startMenu, false);
    toggleActiveClass(pauseMenu, false);
    toggleActiveClass(gameArea, false);
    toggleActiveClass(gameOverMenu, true);
}
