import { GameRenderer } from '../GameRenderer.js';

export class BaseGame {
    constructor(container, config, onScoreUpdate) {
        this.container = container;
        this.config = config;
        this.onScoreUpdate = onScoreUpdate;
        this.score = 0;
        this.isActive = false;
    }

    start() {
        this.isActive = true;
        this.container.innerHTML = '';
    }

    restart() {
        this.score = 0;
        this.updateScore();
        this.start();
    }

    destroy() {
        this.isActive = false;
        GameRenderer.clearContainer(this.container);
    }

    render() {
        throw new Error('render() must be implemented by subclass');
    }

    updateScore(points = 0) {
        if (points !== 0) {
            this.score += points;
        }
        if (this.onScoreUpdate) {
            this.onScoreUpdate(this.score);
        }
    }

    createGameOverOverlay(message, onRestart) {
        GameRenderer.createGameOverOverlay(this.container, message, onRestart);
    }
}
