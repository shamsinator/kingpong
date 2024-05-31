let gameState = {
    gamePaused: false,
    gameInProgress: false,
    difficulty: 'normal',
};

export const getGameState = () => {
    return gameState;
};

export const setGameState = (newState) => {
    gameState = { ...gameState, ...newState };
};
