import { XO } from './games/XO.js';
import { Snake } from './games/Snake.js';
import { Sudoku } from './games/Sudoku.js';
import { Pong } from './games/Pong.js';
import { MathGame } from './games/MathGame.js';
import { Platformer } from './games/Platformer.js';
import { Racing } from './games/Racing.js';
import { Shooter } from './games/Shooter.js';
import { GenericGame } from './games/GenericGame.js';

export class GameFactory {
    constructor() {
        this.gameMap = {
            'xo': XO,
            'snake': Snake,
            'sudoku': Sudoku,
            'pong': Pong,
            'math': MathGame,
            'mario': Platformer,
            'platformer': Platformer,
            'racing': Racing,
            'shooter': Shooter,
            'generic': GenericGame
        };
    }

    createGame(type, container, config, onScoreUpdate) {
        const GameClass = this.gameMap[type.toLowerCase()] || this.gameMap['generic'];
        return new GameClass(container, config, onScoreUpdate);
    }
}

