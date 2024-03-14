import throttle from './utils/throttle';

/**
 * Sets up event listeners for various game control buttons and key events. This function
 * is designed to facilitate the interaction between the user and the game by handling
 * actions such as starting, pausing, resuming, and restarting the game. Additionally,
 * it manages keyboard inputs for game controls and window resize events for responsive layouts.
 *
 * @param {Object} config - An object containing references to button elements and action functions.
 * @param {HTMLElement} config.startBtn - The button element that starts the game.
 * @param {HTMLElement} config.continueBtn - The button element that resumes the game.
 * @param {HTMLElement} config.restartBtn - The button element that restarts the game.
 * @param {HTMLElement} config.againBtn - The button element that resets the game for another round.
 * @param {Function} config.startGame - The function to call when starting the game.
 * @param {Function} config.resumeGame - The function to call when resuming the game.
 * @param {Function} config.resetGame - The function to call when resetting or restarting the game.
 * @param {Function} config.keyDown - The function to call when a key is pressed down.
 * @param {Function} config.keyUp - The function to call when a key is released.
 * @param {Function} config.windowResize - The function to call when the window is resized.
 */
function setupEventListeners({
    startBtn,
    continueBtn,
    restartBtn,
    againBtn,
    startGame,
    resumeGame,
    resetGame,
    keyDown,
    keyUp,
    windowResize,
}) {
    // console.log('startBtn:', startBtn);
    // console.log('continueBtn:', continueBtn);
    // console.log('restartBtn:', restartBtn);
    // console.log('againBtn:', againBtn);

    window.addEventListener('resize', throttle(windowResize, 1000));
    startBtn.addEventListener('click', startGame);
    continueBtn.addEventListener('click', resumeGame);
    restartBtn.addEventListener('click', resetGame);
    againBtn.addEventListener('click', resetGame);
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);
}

export { setupEventListeners };
