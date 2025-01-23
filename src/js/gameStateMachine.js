/**
 * Game states enum
 */
export const GameStates = {
    INIT: 'INIT',
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER',
};

/**
 * Game events enum
 */
export const GameEvents = {
    START: 'START',
    PAUSE: 'PAUSE',
    RESUME: 'RESUME',
    RESET: 'RESET',
    WIN: 'WIN',
    LOSE: 'LOSE',
};

/**
 * State machine for managing game states and transitions
 */
class GameStateMachine {
    constructor() {
        this.state = GameStates.INIT;
        this.transitions = {
            [GameStates.INIT]: {
                [GameEvents.START]: GameStates.MENU,
            },
            [GameStates.MENU]: {
                [GameEvents.START]: GameStates.PLAYING,
            },
            [GameStates.PLAYING]: {
                [GameEvents.PAUSE]: GameStates.PAUSED,
                [GameEvents.WIN]: GameStates.GAME_OVER,
                [GameEvents.LOSE]: GameStates.GAME_OVER,
            },
            [GameStates.PAUSED]: {
                [GameEvents.RESUME]: GameStates.PLAYING,
                [GameEvents.RESET]: GameStates.MENU,
                [GameEvents.START]: GameStates.PLAYING,
            },
            [GameStates.GAME_OVER]: {
                [GameEvents.RESET]: GameStates.MENU,
            },
        };
    }

    /**
     * Transition to a new state based on the given event
     * @param {string} event - The event triggering the transition
     * @returns {boolean} Whether the transition was successful
     */
    transition(event) {
        const nextState = this.transitions[this.state]?.[event];
        if (nextState) {
            this.state = nextState;
            return true;
        }
        return false;
    }

    /**
     * Get the current state
     * @returns {string} Current state
     */
    getState() {
        return this.state;
    }

    /**
     * Check if a transition is valid
     * @param {string} event - The event to check
     * @returns {boolean} Whether the transition is valid
     */
    canTransition(event) {
        return !!this.transitions[this.state]?.[event];
    }
}

export const gameStateMachine = new GameStateMachine();
