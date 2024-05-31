import { getGameState, setGameState } from './gameState';

/**
 * Imports the `toggleActiveClass` utility function for toggling CSS classes on elements.
 */
import toggleActiveClass from './utils/toggleActiveClass';
/**
 * Imports the `getRandomNumber` utility function for generating random numbers within a specified range.
 */
import getRandomNumber from './utils/getRandomNumber';
/**
 * Imports the `setupEventListeners` function from the events module to initialize event listeners.
 */
import { setupEventListeners } from './events';
/**
 * Imports sound-related functions from the sounds module to control game sounds like background music and sound effects for hits, game over, and victories.
 */
import {
    toggleBackgroundMusic,
    playHitSound,
    playGameOverSound,
    playGameWonByPlayer,
} from './sounds';

document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('gameCanvas');
    let canvasContext = canvas.getContext('2d');

    let paddleWidth = 10;
    let paddleHeight = 100;

    let playerOneScore = 0;
    let playerTwoScore = 0;

    let paddleOne = {
        y: 0,
        directionY: null,
        velocityY: 15,
    };

    let paddleTwo = {
        y: 0,
        directionY: null,
        velocityY: 10,
    };

    // state variables
    let scoreToWin = 10;
    let difficultyLevel = 1;
    let gameInterval;

    // Set initial difficulty level
    setGameState({ difficulty: 'normal' });

    // Get the current difficulty from the updated game state
    let currentDifficulty = getGameState().difficulty;

    let lastTime;

    const createDifficultyLevels = (canvas, ball) => ({
        normal: {
            ballVelocity: 2,
            initialBallPositionY: canvas.height / 2 - ball.size / 2,
        },
        hard: {
            ballVelocity: 3,
            initialBallPositionY: canvas.height / 3 - ball.size / 2,
        },
        extreme: {
            ballVelocity: 4,
            initialBallPositionY: canvas.height / 4 - ball.size / 2,
        },
    });

    // Initialize ball
    const ball = initBall(
        canvas,
        createDifficultyLevels(canvas, { size: 20 }),
        currentDifficulty
    );

    const startMenu = document.getElementById('startMenu');
    const pauseMenu = document.getElementById('pauseMenu');
    const gameOverMenu = document.getElementById('gameOverMenu');
    const gameArea = document.getElementById('gameArea');
    const startBtn = document.getElementById('startBtn');
    const continueBtn = document.getElementById('continueBtn');
    const restartBtn = document.getElementById('restartBtn');
    const againBtn = document.getElementById('againBtn');
    const gameMessage = document.getElementById('gameMessage');

    /**
     * Initializes the game canvas with the full dimensions of the window.
     */
    function initCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    /**
     * Creates and initializes the ball with a default position, size, and velocity.
     * This setup is influenced by the current difficulty level's ball velocity and initial position.
     *
     * @param {HTMLCanvasElement} canvas - The canvas element where the game is rendered.
     * @returns {Object} The initialized ball object with position, size, and velocity properties.
     */
    function initBall(canvas) {
        const ball = {
            positionX: canvas.width / 2,
            positionY: canvas.height / 2,
            size: 20,
            velocityX: 8,
            velocityY: 0,
        };
        const difficultyLevels = createDifficultyLevels(canvas, ball);
        ball.velocityY = difficultyLevels.normal.ballVelocity;
        ball.positionY = difficultyLevels.normal.initialBallPositionY;
        return ball;
    }

    /**
     * Initializes the paddles to their starting positions on the canvas.
     *
     * @param {HTMLCanvasElement} canvas - The canvas element where the game is rendered.
     */
    const initPaddles = (canvas) => {
        paddleOne.y = canvas.height / 2 - paddleHeight / 2;
        paddleTwo.y = canvas.height / 2 - paddleHeight / 2;
    };

    /**
     * Adjusts the position of the ball on the canvas to keep it within the game area's boundaries.
     *
     * @param {Object} ball - The ball object with its current position and size.
     * @param {HTMLCanvasElement} canvas - The canvas element where the game is rendered.
     */
    const adjustBallPosition = (ball, canvas) => {
        if (ball.positionY > canvas.height - ball.size / 2) {
            ball.positionY = canvas.height - ball.size / 2;
        } else if (ball.positionY < ball.size / 2) {
            ball.positionY = ball.size / 2;
        }
    };

    /**
     * Sets up event listeners for difficulty selection buttons, allowing players to change the game's difficulty.
     */
    function setupDifficultyButtons() {
        const difficultyButtons =
            document.querySelectorAll('.difficulty-button');
        difficultyButtons.forEach((button) => {
            button.addEventListener('click', () =>
                setDifficulty(button.id, canvas, null)
            );
        });
    }

    /**
     * Sets the game's difficulty level and re-initializes the ball and game elements accordingly.
     * Optionally, executes a callback function after setting the difficulty.
     *
     * @param {string} newDifficulty - The new difficulty setting ('normal', 'hard', or 'extreme').
     * @param {HTMLCanvasElement} canvas - The canvas element where the game is rendered.
     * @param {Function} [callback] - An optional callback function to run after setting the difficulty.
     */
    function setDifficulty(newDifficulty, canvas, callback) {
        if (createDifficultyLevels(canvas, { size: 20 })[newDifficulty]) {
            currentDifficulty = newDifficulty;
            initBall(
                canvas,
                createDifficultyLevels(canvas, { size: 20 }),
                currentDifficulty
            );
            showStartButton();

            if (callback && typeof callback === 'function') {
                callback(currentDifficulty);
            }
        }
    }

    /**
     * Displays the start button, allowing players to begin the game.
     */
    function showStartButton() {
        const startButton = document.getElementById('startBtn');
        if (startButton) {
            startButton.style.display = 'block';
            startButton.addEventListener('click', startGame);
        }
    }

    /**
     * Toggles the display of the start menu, allowing players to navigate the game's initial options.
     */
    function showStartMenu() {
        toggleActiveClass(startMenu, true);
        toggleActiveClass(pauseMenu, false);
        toggleActiveClass(gameArea, false);
        toggleActiveClass(gameOverMenu, false);
    }

    /**
     * The main game loop that handles updating the game state and rendering the game elements.
     * It uses requestAnimationFrame for smooth animations.
     *
     * @param {DOMHighResTimeStamp} timestamp - The timestamp provided by requestAnimationFrame.
     */
    function gameLoop(timestamp) {
        const gameState = getGameState();
        if (!gameState.gameInProgress) {
            return; // Stop the loop if the game is not in progress
        }

        if (!lastTime) lastTime = timestamp;
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        moveEverything(deltaTime);
        drawEverything();

        requestAnimationFrame(gameLoop);
    }

    /**
     * Starts or resumes the game loop, updates game state, and manages game rendering and logic.
     */
    function startGame() {
        setGameState({
            gameInProgress: true,
            gamePaused: false,
        });

        toggleBackgroundMusic(true);
        toggleActiveClass(startMenu, false);
        toggleActiveClass(pauseMenu, false);
        toggleActiveClass(gameArea, false);
        toggleActiveClass(gameOverMenu, false);
        requestAnimationFrame(gameLoop);
    }

    /**
     * Resets the game to its initial state, including resetting scores and ball position.
     */
    function resetGame() {
        playerOneScore = 0;
        playerTwoScore = 0;
        difficultyLevel = 1;
        initBall(
            canvas,
            createDifficultyLevels(canvas, { size: 20 }),
            currentDifficulty
        );
        initPaddles(canvas);
        startGame();
    }

    /**
     * Toggles the game's pause state, either pausing or resuming the game based on its current state.
     */
    function togglePause() {
        const gameState = getGameState();
        if (gameState.gamePaused) {
            // If the game is paused, resume it
            resumeGame();
        } else {
            // If the game is not paused, pause it
            pauseGame();
        }
    }

    /**
     * Pauses the game, stopping game logic updates and showing the pause menu.
     */
    function pauseGame() {
        const gameState = getGameState();
        if (gameState.gameInProgress) {
            setGameState({
                gameInProgress: false,
                gamePaused: true,
            });

            toggleBackgroundMusic(false);
            toggleActiveClass(gameArea, false);
            toggleActiveClass(pauseMenu, true);
        }
    }

    /**
     * Resumes the game from a paused state, hiding the pause menu and continuing game logic updates.
     */
    function resumeGame() {
        const gameState = getGameState();
        if (!gameState.gameInProgress && gameState.gamePaused) {
            setGameState({
                gameInProgress: true,
                gamePaused: false,
            });

            toggleActiveClass(gameArea, true);
            toggleActiveClass(pauseMenu, false);
            toggleBackgroundMusic(true);
            requestAnimationFrame(gameLoop); // Resume the game loop
        }
    }

    /**
     * Handles window resize events to pause the game and adjust game elements as needed.
     */
    function windowResize() {
        const gameState = getGameState();
        if (gameState.gameInProgress && !gameState.gamePaused) {
            // If the game is in progress and not paused, pause it and show pause menu on resize
            pauseGame();
            showPauseMenuOnResize();
        } else if (!gameState.gameInProgress) {
            // If the game is not in progress, show the start menu
            showStartMenu();
        }

        resetBall();
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        clearInterval(gameInterval);

        drawEverything();

        // Restart the game if it was in progress and not paused
        if (gameState.gameInProgress && !gameState.gamePaused) {
            startGame();
        }
    }

    /**
     * Shows the pause menu when the window is resized, pausing the game and awaiting further user action.
     */
    function showPauseMenuOnResize() {
        setGameState({
            gamePaused: true,
        });
        toggleActiveClass(startMenu, false);
        toggleActiveClass(pauseMenu, true);
        toggleActiveClass(gameArea, false);
        toggleActiveClass(gameOverMenu, false);
    }

    /**
     * Handles key down events for player input, such as moving paddles or pausing the game.
     *
     * @param {KeyboardEvent} e - The event object associated with the key press.
     */
    function keyDown(e) {
        e.preventDefault();
        const gameState = getGameState();

        switch (e.key) {
            case 'Enter':
                if (gameState.gameInProgress) togglePause();
                break;
            case 'ArrowUp':
                if (!gameState.gamePaused) paddleOne.directionY = 'up';
                break;
            case 'ArrowDown':
                if (!gameState.gamePaused) paddleOne.directionY = 'down';
                break;
        }
    }

    /**
     * Handles key up events, stopping paddle movement when player input ends.
     *
     * @param {KeyboardEvent} e - The event object associated with the key release.
     */
    function keyUp(e) {
        paddleOne.directionY = null;
    }

    /**
     * Resets the ball to the center of the canvas with initial velocity settings based on the current difficulty level.
     */
    function resetBall() {
        ball.velocityX = -ball.velocityX;
        ball.velocityY = createDifficultyLevels(canvas, ball)[
            currentDifficulty
        ].ballVelocity;
        ball.positionX = canvas.width / 2;
        ball.positionY = canvas.height / 2;
    }

    /**
     * Moves the ball and paddles according to their velocity and direction, and checks for collisions.
     */
    function moveEverything() {
        moveBall(ball, canvas);
        movePaddleOne();
        movePaddleTwo();
        checkBallCollision();
        updateScores();
        checkGameEnd();
    }

    /**
     * Calculates and updates the ball's position based on its velocity.
     *
     * @param {Object} ball - The ball object with its current position, size, and velocity.
     * @param {HTMLCanvasElement} canvas - The canvas element where the game is rendered.
     * @returns {Object} The updated ball object.
     */
    const moveBall = (ball, canvas) => {
        ball.positionX += ball.velocityX;
        ball.positionY += ball.velocityY;

        if (
            ball.positionY > canvas.height - ball.size / 2 ||
            ball.positionY < ball.size / 2
        ) {
            ball.velocityY = -ball.velocityY;
            adjustBallPosition(ball, canvas);
        }

        return ball;
    };

    /**
     * Updates the position of paddle one based on its current direction and velocity.
     */
    const movePaddleOne = () => {
        if (paddleOne.directionY === 'up' && paddleOne.y >= 0) {
            paddleOne.y -= paddleOne.velocityY;
        } else if (
            paddleOne.directionY === 'down' &&
            paddleOne.y < canvas.height - paddleHeight
        ) {
            paddleOne.y += paddleOne.velocityY;
        }
    };

    /**
     * Updates the position of paddle two, simulating simple AI by following the ball's position.
     */
    const movePaddleTwo = () => {
        if (ball.positionY < paddleTwo.y) {
            paddleTwo.y -= paddleTwo.velocityY;
        } else if (ball.positionY > paddleTwo.y + paddleHeight) {
            paddleTwo.y += paddleTwo.velocityY;
        }
    };

    /**
     * Checks for and handles collisions between the ball and paddles or the ball and game area boundaries.
     */
    function checkBallCollision() {
        if (ballHitsPaddleTwo()) {
            handleBallCollision(paddleTwo, canvas.width - paddleWidth);
        } else if (ball.positionX < paddleWidth * 2 + ball.size / 2) {
            handleBallCollision(paddleOne, paddleWidth + ball.size / 2);
        }
    }

    /**
     * Handles the ball's velocity and direction changes when it collides with a paddle.
     *
     * @param {Object} paddle - The paddle object that the ball collided with.
     * @param {number} collisionPointX - The x-coordinate of the collision point.
     */
    function handleBallCollision(paddle, collisionPointX) {
        if (
            ball.positionY >= paddle.y &&
            ball.positionY <= paddle.y + paddleHeight &&
            ball.positionX < collisionPointX
        ) {
            ball.velocityX = -ball.velocityX;
            handleBallVerticalBounce(paddle);
            playHitSound();
        } else if (
            ball.positionX > canvas.width ||
            ball.positionX < -ball.size
        ) {
            resetBall();
            updateScores();
        }
        randomizeGame();
    }

    /**
     * Adjusts the ball's vertical velocity based on which segment of the paddle it hits.
     *
     * @param {Object} paddle - The paddle object that the ball collided with.
     */
    function handleBallVerticalBounce(paddle) {
        const bounceSegments = 5;
        const segmentHeight = paddleHeight / bounceSegments;

        for (let i = 0; i < bounceSegments; i++) {
            const segmentStartY = paddle.y + i * segmentHeight;
            const segmentEndY = segmentStartY + segmentHeight;

            if (
                ball.positionY >= segmentStartY &&
                ball.positionY < segmentEndY
            ) {
                ball.velocityY =
                    (i - Math.floor(bounceSegments / 2)) * 5 * difficultyLevel;
                break;
            }
        }
    }

    /**
     * Checks if the ball hits paddle one, to facilitate collision detection and response.
     *
     * @returns {boolean} True if the ball hits paddle one, false otherwise.
     */
    function ballHitsPaddleOne() {
        return (
            ball.positionX < paddleWidth * 2 + ball.size / 2 &&
            ball.positionY >= paddleOne.y &&
            ball.positionY <= paddleOne.y + paddleHeight
        );
    }

    /**
     * Checks if the ball hits paddle two, to facilitate collision detection and response.
     *
     * @returns {boolean} True if the ball hits paddle two, false otherwise.
     */
    function ballHitsPaddleTwo() {
        const isBallRightOfPaddle =
            ball.positionX > canvas.width - paddleWidth * 2 - ball.size / 2;
        const isBallAbovePaddle = ball.positionY >= paddleTwo.y;
        const isBallBelowPaddle = ball.positionY <= paddleTwo.y + paddleHeight;

        return isBallRightOfPaddle && isBallAbovePaddle && isBallBelowPaddle;
    }

    /**
     * Updates the score based on the ball's position relative to the game area boundaries.
     */
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

    /**
     * Checks if a player has won the game by reaching the required score to win.
     *
     * @param {number} score - The current score of the player to check.
     */
    function checkWinCondition(score) {
        if (score >= scoreToWin) {
            gameOver(ballHitsPaddleTwo());
        }
    }

    /**
     * Checks if the game should end, either by a player winning or the ball exiting the game area.
     */
    function checkGameEnd() {
        const gameState = getGameState();
        if (
            !gameState.gameInProgress &&
            (ball.positionX > canvas.width || ball.positionX < -ball.size)
        ) {
            gameOver(ballHitsPaddleTwo());
        }
    }

    /**
     * Draws all game elements, including the ball, paddles, and scores, to the canvas.
     */
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

        // draw paddle one
        canvasContext.fillStyle = PADDLE_COLOR;
        canvasContext.fillRect(
            paddleWidth,
            paddleOne.y,
            paddleWidth,
            paddleHeight
        );

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

    /**
     * Randomizes aspects of the game, such as paddle velocity, to increase difficulty dynamically.
     */
    function randomizeGame() {
        paddleTwo.velocityY = getRandomNumber(10, 20) * difficultyLevel;
    }

    /**
     * Ends the game, displays the appropriate game over message, and offers the player options to restart or exit.
     *
     * @param {boolean} playerWon - Indicates whether the player won the game or not.
     */
    function gameOver(playerWon) {
        setGameState({
            gameInProgress: false,
        });

        toggleBackgroundMusic(false);
        gameMessage.textContent = playerWon ? 'You won!' : 'Game Over :(';
        againBtn.textContent = playerWon ? 'Play again' : 'Try again';

        if (playerWon) {
            playGameWonByPlayer();
        } else {
            playGameOverSound();
        }

        toggleActiveClass(startMenu, false);
        toggleActiveClass(pauseMenu, false);
        toggleActiveClass(gameArea, false);
        toggleActiveClass(gameOverMenu, true);
    }

    initCanvas();
    initBall(
        canvas,
        createDifficultyLevels(canvas, { size: 20 }),
        currentDifficulty
    );
    initPaddles(canvas);
    showStartMenu();
    setupDifficultyButtons();
    setupEventListeners({
        startBtn: startBtn,
        continueBtn: continueBtn,
        restartBtn: restartBtn,
        againBtn: againBtn,
        startGame: startGame,
        resumeGame: resumeGame,
        resetGame: resetGame,
        keyDown: keyDown,
        keyUp: keyUp,
        windowResize: windowResize,
    });
});
