const gameBackgroundMusic = document.getElementById('backgroundMusic');
const hitSound = document.getElementById('hitSound');
const gameOverSound = document.getElementById('gameOverSound');
const gameWonSound = document.getElementById('gameWonSound');

/**
 * Toggles the background music for the game.
 *
 * @param {boolean} playSound - Indicates whether to play the background music or not.
 * @return {undefined}
 */
const toggleBackgroundMusic = (playSound = true) => {
    if (!gameBackgroundMusic) {
        console.warn('gameBackgroundMusic is not defined');
        return;
    }

    gameBackgroundMusic.loop = true;
    playSound ? gameBackgroundMusic.play() : gameBackgroundMusic.pause();
};

/**
 * Function to play the hit sound.
 *
 * @return {void}
 */
const playHitSound = () => {
    if (!hitSound) {
        console.warn('hitSound is not defined');
        return;
    }

    hitSound.play();
};

/**
 * Plays the game over sound if it is defined.
 *
 * @return {void}
 */
const playGameOverSound = () => {
    if (!gameOverSound) {
        console.warn('gameOverSound is not defined');
        return;
    }

    gameOverSound.play();
};

/**
 * This function plays the game won sound if available.
 */
const playGameWonByPlayer = () => {
    if (!gameWonSound) {
        console.warn('gameWonSound is not defined');
        return;
    }

    gameWonSound.play();
};

export {
    toggleBackgroundMusic,
    playHitSound,
    playGameOverSound,
    playGameWonByPlayer,
};
