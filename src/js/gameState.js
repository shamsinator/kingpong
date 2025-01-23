import { gameStateMachine, GameStates, GameEvents } from './gameStateMachine';

let gameState = {
    gamePaused: false,
    gameInProgress: false,
    difficulty: 'normal',
};

export const getGameState = () => {
    const currentState = gameStateMachine.getState();
    return {
        ...gameState,
        currentState,
        isPlaying: currentState === GameStates.PLAYING,
        isPaused: currentState === GameStates.PAUSED,
        isGameOver: currentState === GameStates.GAME_OVER,
    };
};

export const setGameState = (newState) => {
    gameState = { ...gameState, ...newState };

    // Update state machine based on game state changes
    if (newState.gameInProgress === true && newState.gamePaused === false) {
        gameStateMachine.transition(GameEvents.START);
    } else if (newState.gamePaused === true) {
        gameStateMachine.transition(GameEvents.PAUSE);
    }
};

export const isValidGameState = (state) => {
    return Object.values(GameStates).includes(state);
};
